import { u128 } from "as-bignum";
import { defaultValue } from "./utils";

@global
export abstract class Deserializer<I> {

  constructor(protected encoded_object: I) { }

  init(encoded_object: I): this {
    this.encoded_object = encoded_object;
    return this;
  }

  // Decode Field
  abstract _decode_field<T>(name: string, defaultValue: T): T

  decode_field<T>(name: string, _defaultValue: T = defaultValue<T>()): T {
    return this._decode_field(name, _defaultValue);
  }

  // Boolean
  abstract decode_bool(): bool

  // Map --
  abstract decode_map<K, V>(): Map<K, V>

  // Null --
  abstract decode_nullable<T>(): T | null

  // Object
  abstract decode_object<C extends object>(): C

  // String --
  abstract decode_string(): string

  // Set --
  abstract decode_set<T>(): Set<T>

  // Array --
  abstract decode_array<A extends ArrayLike<any>>(): A;
  abstract decode_arraybuffer(): ArrayBuffer
  abstract decode_arraybuffer_view<A extends ArrayBufferView>(): A
  abstract decode_static_array<T>(): StaticArray<T>

  // Number --
  abstract decode_u8(): u8
  abstract decode_i8(): i8
  abstract decode_u16(): u16
  abstract decode_i16(): i16
  abstract decode_u32(): u32
  abstract decode_i32(): i32
  abstract decode_u64(): u64
  abstract decode_i64(): i64
  abstract decode_u128(): u128
  abstract decode_f32(): f32
  abstract decode_f64(): f64

  decode_number<N = number>(): N {
    let test: N

    // @ts-ignore
    if (test instanceof u8) { return this.decode_u8(); }
    // @ts-ignore
    if (test instanceof i8) { return this.decode_i8(); }
    // @ts-ignore
    if (test instanceof u16) { return this.decode_u16(); }
    // @ts-ignore
    if (test instanceof i16) { return this.decode_i16(); }
    // @ts-ignore
    if (test instanceof u32) { return this.decode_u32(); }
    // @ts-ignore
    if (test instanceof i32) { return this.decode_i32(); }
    // @ts-ignore
    if (test instanceof u64) { return this.decode_u64(); }
    // @ts-ignore
    if (test instanceof i64) { return this.decode_i64(); }
    // @ts-ignore
    if (test instanceof f32) { return this.decode_f32(); }
    // @ts-ignore
    return this.decode_f64();
  }


  // decode --
  decode<T>(): T {

    // @ts-ignore
    if (isBoolean<T>()) { return this.decode_bool(); }

    // @ts-ignore
    if (isInteger<T>() || isFloat<T>()) { return this.decode_number<T>(); }

    if (isNullable<T>()) { return <T>this.decode_nullable<T>() }

    // @ts-ignore
    if (isString<T>()) { return this.decode_string(); }

    let value: T

    // @ts-ignore
    if (isDefined(value.decode)) { return this.decode_object<T>(); }

    // @ts-ignore
    if(value instanceof u128 && !isDefined(value.decode)){ return this.decode_u128(); }  // -> we need to get ride of this

    // @ts-ignore
    if (value instanceof ArrayBuffer) { return this.decode_arraybuffer(); }    

    // @ts-ignore
    if (value instanceof ArrayBufferView) { return this.decode_arraybuffer_view<T>(); }

    // @ts-ignore
    if (value instanceof StaticArray) { return this.decode_static_array<valueof<T>>(); }
    
    // @ts-ignore
    if (isArrayLike<T>()) { return this.decode_array<T>(); }

    // @ts-ignore
    if (value instanceof Set) { return this.decode_set<indexof<T>>(); }

    // @ts-ignore
    if (value instanceof Map) { return this.decode_map<indexof<T>, valueof<T>>(); }

    // @ts-ignore
    return this.decode_object<T>();
  }

}