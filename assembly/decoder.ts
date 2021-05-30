import { u128 } from "near-sdk-as";

function isNull<T>(t: T): bool {
  if (isNullable<T>() || isReference<T>()) {
    return changetype<usize>(t) == 0;
  }
  return false;
}

export abstract class Decoder<I>{

  constructor(encoded_object:I){}

  // Decode Field
  abstract decode_field<T>(name:string):T

  // Boolean
  abstract decode_bool(): bool

  // Map --
  abstract decode_map<K, V, M extends Map<K, V> | null>(): M

  // Null --
  abstract decode_null(): void

  // Object --
  abstract decode_object<C>(): C

  // String --
  abstract decode_string(): string

  // Set --
  abstract decode_set<T, S extends Set<T> | null>(): S

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

  // Array --
  abstract decode_array<T, A extends ArrayLike<T> | null>(): A


  decode_number<N = number>():N{
    let test:N

    // @ts-ignore
    if (test instanceof u8){ return this.decode_u8(); }
    // @ts-ignore
    if (test instanceof i8){ return this.decode_i8(); }
    // @ts-ignore
    if (test instanceof u16){ return this.decode_u16(); }
    // @ts-ignore
    if (test instanceof i16){ return this.decode_i16(); }
    // @ts-ignore
    if (test instanceof u32){ return this.decode_u32(); }
    // @ts-ignore
    if (test instanceof i32){ return this.decode_i32(); }
    // @ts-ignore
    if (test instanceof u64){ return this.decode_u64(); }
    // @ts-ignore
    if (test instanceof i64){ return this.decode_i64(); }
    // @ts-ignore
    if (test instanceof f32){ return this.decode_f32(); }
    // @ts-ignore
    return this.decode_f64();
  }


  // decode --
  decode<V>(): V {
    // @ts-ignore
    if (isBoolean<V>()){ return this.decode_bool(); }

    // @ts-ignore
    if (isInteger<V>() || isFloat<V>()){ return this.decode_number<V>(); }

    // @ts-ignore
    if (isString<V>()) { return this.decode_string(); }

    // @ts-ignore
    if(value instanceof u128){ return this.decode_u128(); }  // -> we need to get ride of this

    // @ts-ignore
    if(isArrayLike<V>(value)){ return this.decode_array<T, V>(); }

    // @ts-ignore
    //if value instanceof Set){ this.decode_set<V>(); return }

    // @ts-ignore
    //if(value instanceof Map){ this.decode_map<V>(); }

    // @ts-ignore
    return this.decode_object();
  }

}