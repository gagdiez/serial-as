interface Encoder<T> {}
interface Object {
  encode<__T>(encoder: Encoder<__T>): __T;
}