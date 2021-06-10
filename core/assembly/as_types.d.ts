interface Encoder<T> { }
interface Decoder<T> { }
interface Object {
  encode<T>(encoder: Encoder<T>): T;
  decode<From>(decoder: Decoder<From>): this;
}

/**
 * 
 * Macro to add `encode` method to class
 */
declare function serializable(a: any): any;