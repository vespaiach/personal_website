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
  opts?: AddEventListenerOptions | boolean
): () => void {
  element.addEventListener(type, listener, opts);
  return element.removeEventListener.bind(element, type, listener, opts);
}
