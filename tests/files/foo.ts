export type baz = string;
export interface Foo {
  bar: string;
}
export const useBaz = (bazObj: baz): baz => {
  return bazObj;
};
