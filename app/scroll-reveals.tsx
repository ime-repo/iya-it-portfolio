"use client";

import { useEffect } from "react";

// What gets the typing effect (page order is automatic)
const SELECTOR = [
    "h1",
    "h2",
    "h3",
    ".hero-intro",
    ".section-heading > p",
    ".additional-heading p",
    ".compact-project > p",
    ".skill-card > p",
    ".contact-content > p:not(.eyebrow)",
].join(", ");

// Areas that stay static
const SKIP = ".site-header, .project-modal-overlay, .filter-row, .menu-toggle";

// ===== Settings you can change =====
const PX_PER_CHAR = 8; // scroll distance per letter. HIGHER = slower typing, longer sections
const MIN_TYPE_PX = 400; // shortest scroll distance a section's typing can take (px)
const HOLD_VH = 0.4; // pause with the full section shown (fraction of screen height)
const ENTER_VH = 0.35; // typing starts when the section is this far into the screen (fraction of screen height)
const CATCH_UP = 0.35; // how quickly letters follow your scroll (0.15 = floaty, 0.6 = tight)
const HERO_AUTOPLAY = true; // true = the intro types by itself when the page opens, false = intro shown instantly
const HERO_CPS = 28; // intro typing speed in letters per second
const HERO_DELAY = 500; // wait before the intro starts (ms)
const JITTER = 0.4; // randomness in the intro rhythm (0 = robotic, 0.5 = very human)
const PUNCTUATION_PAUSE = 130; // extra pause (ms) after , . ; : ? ! — in the intro
const FALLBACK_START = 0.9; // small screens: text starts typing at this screen height
const FALLBACK_RANGE = 0.4; // small screens: longest scroll distance one text takes (fraction of screen height)
// ===================================

type Part = {
    wrap: HTMLElement;
    typed: HTMLElement;
    rest: HTMLElement;
    original: Text;
    full: string;
};

type Group = {
    el: Element;
    kind: "hero" | "pin";
    pinned: boolean;
    items: Item[];
    chars: number;
    top: number;
    typeLen: number;
    dest: number;
};

type Item = {
    el: Element;
    parts: Part[];
    caret: HTMLElement;
    text: string;
    total: number;
    shown: number;
    start: number;
    range: number;
    heroOffset: number;
    group: Group;
};

type ItemBase = Omit<Item, "group">;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function ScrollReveals() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const main = document.getElementById("top");
        if (!main) return;

        const items: Item[] = [];
        const groups: Group[] = [];
        const groupByEl = new Map<Element, Group>();

        const prepare = (el: Element): ItemBase | null => {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            const nodes: Text[] = [];
            while (walker.nextNode()) {
                const node = walker.currentNode as Text;
                if (node.nodeValue && node.nodeValue.trim() !== "") nodes.push(node);
            }
            if (nodes.length === 0) return null;

            const parts: Part[] = [];
            nodes.forEach((node) => {
                const parent = node.parentNode;
                if (!parent) return;
                const full = node.nodeValue ?? "";
                const wrap = document.createElement("tw-w");
                const typed = document.createElement("tw-t");
                const rest = document.createElement("tw-r");
                rest.textContent = full;
                wrap.appendChild(typed);
                wrap.appendChild(rest);
                parent.replaceChild(wrap, node);
                parts.push({ wrap, typed, rest, original: node, full });
            });

            if (parts.length === 0) return null;

            const text = parts.map((p) => p.full).join("");
            return {
                el,
                parts,
                caret: document.createElement("tw-c"),
                text,
                total: text.length,
                shown: -1,
                start: 0,
                range: 1,
                heroOffset: 0,
            };
        };

        const render = (item: Item, count: number) => {
            let remaining = count;
            let caretPart: Part | undefined;

            for (const p of item.parts) {
                const n = Math.max(0, Math.min(p.full.length, remaining));
                remaining -= n;
                p.typed.textContent = p.full.slice(0, n);
                p.rest.textContent = p.full.slice(n);
                if (!caretPart && n < p.full.length) caretPart = p;
            }

            if (caretPart && count > 0 && count < item.total) {
                caretPart.wrap.insertBefore(item.caret, caretPart.rest);
            } else {
                item.caret.remove();
            }
        };

        // Collect every text, grouped by the section it lives in
        document.querySelectorAll(SELECTOR).forEach((el) => {
            if (el.closest(SKIP)) return;
            if (el.querySelector(SELECTOR)) return;
            const host = el.closest(".hero, .pin");
            if (!host) return;

            const base = prepare(el);
            if (!base) return;

            let g = groupByEl.get(host);
            if (!g) {
                g = {
                    el: host,
                    kind: host.classList.contains("hero") ? "hero" : "pin",
                    pinned: false,
                    items: [],
                    chars: 0,
                    top: 0,
                    typeLen: 0,
                    dest: 0,
                };
                groupByEl.set(host, g);
                groups.push(g);
            }

            const item: Item = { ...base, group: g };
            g.items.push(item);
            g.chars += item.total;
            items.push(item);
        });

        // ----- Intro: types once by itself, with a human rhythm -----
        const heroItems = items.filter((i) => i.group.kind === "hero");
        const heroText = heroItems.map((i) => i.text).join("");
        const heroTimes: number[] = [];
        let acc = 0;
        let heroOff = 0;
        heroItems.forEach((i) => {
            i.heroOffset = heroOff;
            heroOff += i.total;
        });
        for (let i = 0; i < heroText.length; i++) {
            acc += (1000 / HERO_CPS) * (1 + (Math.random() * 2 - 1) * JITTER);
            if (/[,.;:?!—]/.test(heroText[i])) acc += PUNCTUATION_PAUSE;
            heroTimes.push(acc);
        }
        const skipHero = !HERO_AUTOPLAY || window.scrollY > 200;
        let heroIdx = skipHero ? heroTimes.length : 0;
        const heroT0 = performance.now() + HERO_DELAY;

        // ----- Layout: gives every section its pinned scroll distance -----
        const layout = () => {
            const vh = window.innerHeight;
            const y = window.scrollY;
            const hold = vh * HOLD_VH;
            const enter = vh * ENTER_VH;

            const kids = (Array.from(main.children) as HTMLElement[]).filter(
                (c) => getComputedStyle(c).position !== "fixed"
            );

            // 1) a section can pin only if it fits on one screen
            groups.forEach((g) => {
                if (g.kind !== "pin") return;
                const host = g.el as HTMLElement;
                g.pinned = host.offsetHeight <= vh + 2;
                host.classList.toggle("pin-off", !g.pinned);
            });

            // 2) extra scroll distance after each pinned section (added as a top margin on whatever follows it)
            let cursor = main.getBoundingClientRect().top + y + main.clientTop;
            let pending = 0;
            for (const kid of kids) {
                kid.style.marginTop = pending ? `${pending}px` : "";
                cursor += pending;

                const g = groupByEl.get(kid);
                const h = kid.offsetHeight;
                pending = 0;

                if (g && g.kind === "pin" && g.pinned) {
                    g.top = cursor;
                    g.typeLen = Math.max(g.chars * PX_PER_CHAR, MIN_TYPE_PX);
                    g.dest = Math.max(g.top, g.top - enter + g.typeLen);
                    pending = Math.max(g.typeLen + hold - enter, 0) + Math.max(vh - h, 0);
                }
                cursor += h;
            }

            // 3) a typing window for every text
            const maxScroll = Math.max(document.documentElement.scrollHeight - vh, 0);

            groups.forEach((g) => {
                if (g.kind === "hero") return;

                if (g.pinned) {
                    let cum = 0;
                    g.items.forEach((it) => {
                        it.start = g.top - enter + (cum / g.chars) * g.typeLen;
                        it.range = Math.max((it.total / g.chars) * g.typeLen, 1);
                        cum += it.total;
                    });
                } else {
                    g.items.forEach((it) => {
                        const top = it.el.getBoundingClientRect().top + y;
                        let s = top - vh * FALLBACK_START;
                        let r = Math.min(Math.max(it.total * 4, 60), vh * FALLBACK_RANGE);
                        if (s + r > maxScroll) {
                            r = Math.max(Math.min(r, maxScroll - Math.max(s, 0)), 30);
                            s = maxScroll - r;
                        }
                        it.start = s;
                        it.range = r;
                    });
                }
            });
        };

        const targetFor = (it: Item, y: number) => {
            if (it.group.kind === "hero") return clamp(heroIdx - it.heroOffset, 0, it.total);
            return clamp(Math.round(((y - it.start) / it.range) * it.total), 0, it.total);
        };

        let raf = 0;

        const frame = (now: number) => {
            raf = 0;
            const y = window.scrollY;
            let busy = false;

            const elapsed = now - heroT0;
            while (heroIdx < heroTimes.length && heroTimes[heroIdx] <= elapsed) heroIdx++;
            const heroDone = heroIdx >= heroTimes.length;

            for (const it of items) {
                const target = targetFor(it, y);
                if (it.shown === target) continue;
                const diff = target - it.shown;
                const step = Math.max(1, Math.ceil(Math.abs(diff) * CATCH_UP));
                it.shown += Math.sign(diff) * Math.min(Math.abs(diff), step);
                render(it, it.shown);
                if (it.shown !== target) busy = true;
            }

            if (busy || !heroDone) raf = requestAnimationFrame(frame);
        };

        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(frame);
        };

        let layoutRaf = 0;
        const scheduleLayout = () => {
            if (layoutRaf) return;
            layoutRaf = requestAnimationFrame(() => {
                layoutRaf = 0;
                layout();
                schedule();
            });
        };

        // Menu links jump to the point where that section is fully typed
        const onClick = (e: MouseEvent) => {
            const a = (e.target as Element).closest('a[href^="#"]');
            if (!a) return;
            const id = a.getAttribute("href")?.slice(1);
            if (!id || id === "top") return;
            const target = document.getElementById(id);
            if (!target) return;
            const g = groupByEl.get(target);
            if (!g || !g.pinned) return;
            e.preventDefault();
            window.scrollTo({ top: g.dest, behavior: "smooth" });
        };

        // ----- Start -----
        document.documentElement.classList.add("tw-js");
        layout();

        const y0 = window.scrollY;
        items.forEach((it) => {
            it.shown = targetFor(it, y0);
            render(it, it.shown);
        });

        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", scheduleLayout);
        window.addEventListener("load", scheduleLayout);
        document.addEventListener("click", onClick);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(scheduleLayout);
        }
        const resizeObserver = new ResizeObserver(scheduleLayout);
        resizeObserver.observe(main);

        schedule();

        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", scheduleLayout);
            window.removeEventListener("load", scheduleLayout);
            document.removeEventListener("click", onClick);
            resizeObserver.disconnect();
            cancelAnimationFrame(raf);
            cancelAnimationFrame(layoutRaf);
            document.documentElement.classList.remove("tw-js");

            Array.from(main.children).forEach((c) => {
                (c as HTMLElement).style.marginTop = "";
                c.classList.remove("pin-off");
            });

            items.forEach((item) => {
                item.caret.remove();
                item.parts.forEach((p) => {
                    if (p.wrap.parentNode) p.wrap.parentNode.replaceChild(p.original, p.wrap);
                });
            });
            items.length = 0;
        };
    }, []);

    return null;
}