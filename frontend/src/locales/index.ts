import { ja } from "./ja";

// The active dictionary. Japanese is the only language for now; adding one
// later means choosing a dictionary here (or moving to Next's [lang] routing).
export const t = ja;

// The dictionary's shape with plain strings, so another language can be
// checked against it: `export const en = { ... } satisfies Messages`.
type Widen<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]>;
};
export type Messages = Widen<typeof ja>;
