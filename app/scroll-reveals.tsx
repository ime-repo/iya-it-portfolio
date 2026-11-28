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
const START = 0.95; // text starts typing when it reaches this height of the screen (0 = top, 1 = bottom)
const END = 0.3; // text is fully typed when it reaches this height of the screen
const PX_PER_CHAR = 4; // scroll distance per letter for short texts. HIGHER = slower typing
const MIN_RANGE = 60; // shortest scroll distance used for any text (px)
const CATCH_UP = 0.3; // how quickly letters follow your scroll (0.1 = floaty, 0.5 = tight)
const HERO_TYPES_ON_SCROLL = true; // true = the intro at the top types as you start scrolling
const HERO_RANGE = 0.55; // how much scrolling (as a fraction of screen height) the intro takes
// ===================================

type Part = {
    wrap: HTMLElement;
    typed: HTMLElement;
    rest: HTMLElement;
    original: Text;
    full: string;
};

type Item = {
    el: Element;
    parts: Part[];
    caret: HTMLElement;
    total: number;
    shown: number;
    start: number;
    range: number;
};

export default function ScrollReveals() {
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const items: Item[] = [];

        const prepare = (el: Element): Item | null => {
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

            return {
                el,
                parts,
                caret: document.createElement("tw-c"),
                total: parts.reduce((sum, p) => sum + p.full.length, 0),
                shown: -1,
                start: 0,
                range: 1,
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

        document.querySelectorAll(SELECTOR).forEach((el) => {
            if (el.closest(SKIP)) return;
            if (el.querySelector(SELECTOR)) return;
            const item = prepare(el);
            if (item) items.push(item);
        });

        // Works out, for every text, the scroll range in which it gets typed
        const layout = () => {
            const vh = window.innerHeight;
            const y = window.scrollY;
            const maxScroll = Math.max(document.documentElement.scrollHeight - vh, 0);
            const startLine = vh * START;
            const avail = Math.max(vh * (START - END), 80);
            const tops = items.map((it) => it.el.getBoundingClientRect().top + y);

            // Page too short to scroll: show everything
            if (maxScroll < 50) {
                items.forEach((it) => {
                    it.start = -100000;
                    it.range = 1;
                });
                return;
            }

            // Texts already on screen at the very top of the page
            const hero: number[] = [];
            items.forEach((it, i) => {
                if (tops[i] - startLine <= 0) hero.push(i);
            });
            const heroSet = new Set(hero);

            if (HERO_TYPES_ON_SCROLL) {
                const sum = hero.reduce((a, i) => a + items[i].total, 0) || 1;
                const budget = Math.min(vh * HERO_RANGE, maxScroll);
                let cursor = 0;
                hero.forEach((i) => {
                    const r = Math.max((budget * items[i].total) / sum, 30);
                    items[i].start = cursor;
                    items[i].range = r;
                    cursor += r;
                });
            } else {
                hero.forEach((i) => {
                    items[i].start = -100000;
                    items[i].range = 1;
                });
            }

            items.forEach((it, i) => {
                if (heroSet.has(i)) return;
                let s = tops[i] - startLine;
                let r = Math.min(Math.max(it.total * PX_PER_CHAR, MIN_RANGE), avail);

                // Near the end of the page: make sure the text still finishes before the bottom
                if (s + r > maxScroll) {
                    r = Math.max(Math.min(r, maxScroll - Math.max(s, 0)), MIN_RANGE);
                    s = maxScroll - r;
                }
                it.start = s;
                it.range = r;
            });
        };

        const targetOf = (it: Item, y: number) => {
            const p = (y - it.start) / it.range;
            return Math.max(0, Math.min(it.total, Math.round(p * it.total)));
        };

        let raf = 0;

        const frame = () => {
            raf = 0;
            const y = window.scrollY;
            let busy = false;

            for (const it of items) {
                const target = targetOf(it, y);
                if (it.shown === target) continue;
                const diff = target - it.shown;
                const step = Math.max(1, Math.ceil(Math.abs(diff) * CATCH_UP));
                it.shown += Math.sign(diff) * Math.min(Math.abs(diff), step);
                render(it, it.shown);
                if (it.shown !== target) busy = true;
            }

            if (busy) raf = requestAnimationFrame(frame);
        };

        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(frame);
        };

        const relayout = () => {
            layout();
            schedule();
        };

        // Start: show each text exactly as it should look at the current scroll position
        layout();
        const y0 = window.scrollY;
        items.forEach((it) => {
            it.shown = targetOf(it, y0);
            render(it, it.shown);
        });

        document.documentElement.classList.add("tw-js");

        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", relayout);
        window.addEventListener("load", relayout);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(relayout);
        }
        const resizeObserver = new ResizeObserver(relayout);
        resizeObserver.observe(document.body);

        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", relayout);
            window.removeEventListener("load", relayout);
            resizeObserver.disconnect();
            cancelAnimationFrame(raf);
            document.documentElement.classList.remove("tw-js");
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