import { RequestCookies } from "next/dist/server/web/spec-extension/cookies";

export type EventMap<T extends EventTarget> = T extends MediaQueryList
    ? MediaQueryListEventMap
    : T extends Document
    ? DocumentEventMap
    : T extends Window
    ? WindowEventMap
    : HTMLElementEventMap;
type EventTypes<T extends EventTarget> = keyof EventMap<T> & string;
type EventValue<T extends EventTarget, K extends EventTypes<T>> = Extract<EventMap<T>[K], Event>;

export function listenTo<T extends EventTarget, K extends EventTypes<T>>(
    element: T,
    type: K,
    listener: (this: T, ev: EventValue<T, K>) => void,
    opts?: AddEventListenerOptions | boolean,
): () => void {
    element.addEventListener(type, listener, opts);
    return element.removeEventListener.bind(element, type, listener, opts);
}

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export function format(dt: Date) {
    return `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

export function cx(...name: unknown[]) {
    return name.filter(Boolean).map(String).join(' ') || undefined;
}

export function getThemeModes() {
    return ['light', 'dark'];
}

export function separator() {
    return '----';
}

export function getMode(cookies: RequestCookies): string {
    const modes = getThemeModes();

    return cookies.has('theme-mode') && modes.includes(cookies.get('theme-mode'))
        ? cookies.get('theme-mode')
        : modes[0];
}

export const postIndexPrefix = 'posts-index';
export const tagIndexPrefix = 'tags-index';
