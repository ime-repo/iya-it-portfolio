"use client";

import { useEffect } from "react";

// What gets the typing effect (page order is automatic)
const SELECTOR = [
    "h1",
    "h2",
    "h3",
    "p",
    ".eyebrow",
    ".section-top > span",
    ".button-primary",
    ".text-link",
    ".inline-link",
    ".hero-meta > span",
    ".skill-index",
    ".tag-list > span",
    ".role-row > span",
    ".role-row > strong",
    ".compact-project-top > span",
    ".compact-project-number",
    ".project-more-button",
    ".contact-foot > span",
    ".contact-foot > a",
    ".footer > span",
].join(", ");

// Areas that stay static
const SKIP = ".site-header, .project-modal-overlay, .filter-row, .menu-toggle";

// ===== Settings you can change =====
const START = 0.9; // text can start typing when it reaches this height of the screen (0 = top, 1 = bottom)
const TYPE_CPS = 26; // typing speed in letters per second at slow scrolling
const DELETE_CPS = 45; // deleting speed in letters per second at slow scrolling
const SPEED_GAIN = 0.12; // how much faster it types when you scroll faster (0 = always same speed)
const MAX_CPS = 120; // fastest possible typing speed
const JITTER = 0.4; // randomness in the rhythm (0 = robotic, 0.5 = very human)
const PUNCTUATION_PAUSE = 110; // extra pause (ms) after , . ; : ? ! —
const IDLE_MS = 180; // typing stops this long after you stop scrolling
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
    text: string;
    total: number;
    offset: number;
    shown: number;
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

            const text = parts.map((p) => p.full).join("");
            return {
                el,
                parts,
                caret: document.createElement("tw-c"),
                text,
                total: text.length,
                offset: 0,
                shown: -1,
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

        let running = 0;
        document.querySelectorAll(SELECTOR).forEach((el) => {
            if (el.closest(SKIP)) return;
            if (el.querySelector(SELECTOR)) return;
            const item = prepare(el);
            if (!item) return;
            item.offset = running;
            running += item.total;
            items.push(item);
        });

        const all = items.map((i) => i.text).join("");

        // pos = how many letters are typed on the whole page, counted in page order
        let pos = 0;

        const setPos = (next: number) => {
            pos = next;
            for (const item of items) {
                const count = Math.max(0, Math.min(item.total, pos - item.offset));
                if (count !== item.shown) {
                    item.shown = count;
                    render(item, count);
                }
            }
        };

        // floor = letters already scrolled off the top (finished instantly)
        // allowed = letters that have entered the screen (can be typed)
        const bounds = () => {
            const vh = window.innerHeight;
            let floor = 0;
            let allowed = 0;

            for (const item of items) {
                if (item.el.getBoundingClientRect().bottom < 0) floor = item.offset + item.total;
                else break;
            }
            for (const item of items) {
                if (item.el.getBoundingClientRect().top < vh * START) {
                    allowed = item.offset + item.total;
                } else break;
            }
            return { floor, allowed: Math.max(allowed, floor) };
        };

        let dir = 0;
        let lastY = window.scrollY;
        let lastT = 0;
        let lastScrollAt = -10000;
        let vel = 0;
        let nextAt = 0;
        let raf = 0;

        const delay = (typing: boolean, ch: string) => {
            const base = typing ? TYPE_CPS : DELETE_CPS;
            const cps = Math.min(MAX_CPS, base + vel * SPEED_GAIN);
            let d = (1000 / cps) * (1 + (Math.random() * 2 - 1) * JITTER);
            if (typing && /[,.;:?!—]/.test(ch)) d += PUNCTUATION_PAUSE;
            return d;
        };

        const frame = (now: number) => {
            raf = 0;
            const { floor, allowed } = bounds();

            if (pos < floor) setPos(floor);
            else if (pos > allowed) setPos(allowed);

            const y = window.scrollY;
            const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
            const atTop = y <= 1;
            const recent = now - lastScrollAt < IDLE_MS;
            const typing = dir > 0 && (recent || atBottom);
            const deleting = dir < 0 && (recent || atTop);

            if (nextAt < now - 30) nextAt = now - 30;

            let moved = 0;
            while (moved < 10 && now >= nextAt) {
                if (typing && pos < allowed) {
                    setPos(pos + 1);
                    nextAt += delay(true, all[pos - 1] ?? "");
                } else if (deleting && pos > floor) {
                    setPos(pos - 1);
                    nextAt += delay(false, "");
                } else {
                    break;
                }
                moved++;
            }

            const more =
                recent || (typing && pos < allowed) || (deleting && pos > floor);
            if (more) raf = requestAnimationFrame(frame);
        };

        const schedule = () => {
            if (!raf) raf = requestAnimationFrame(frame);
        };

        const onScroll = () => {
            const now = performance.now();
            const y = window.scrollY;
            const dy = y - lastY;
            if (dy !== 0) {
                if (now - lastT > 250) vel = 0;
                dir = dy > 0 ? 1 : -1;
                const dt = Math.max(now - lastT, 8);
                vel = vel * 0.6 + ((Math.abs(dy) / dt) * 1000) * 0.4;
                lastY = y;
                lastT = now;
                lastScrollAt = now;
            }
            schedule();
        };

        // Start: blank at the very top, or already finished if the page loads scrolled
        const start = bounds();
        setPos(window.scrollY > 4 ? start.allowed : 0);

        document.documentElement.classList.add("tw-js");

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", schedule);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", schedule);
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