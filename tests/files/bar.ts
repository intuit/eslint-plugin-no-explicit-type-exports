interface Bar {
  a: string;
  b: number;
}
type foo = string;
const baz = 5;
const qux = () => {
  return true;
};

class Thud {
  private prop = 'hello';
}

export { Bar, foo, qux, Thud };
export default baz;
