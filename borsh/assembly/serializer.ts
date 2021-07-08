import { Serializer, isNumber } from "@serial-as/core";
import { EncodeBuffer } from "./buffer";

export class BorshSerializer extends Serializer<ArrayBuffer> {
  public buffer: EncodeBuffer = new EncodeBuffer();

  get_encoded_object(): ArrayBuffer {
    return this.buffer.get_used_buffer();
  }

  encode_field<T>(name: string, value: T): void {
    this.encode<T>(value);
  }

  // Bool --
  encode_bool(value: bool): void {
    // little endian
    this.buffer.store<bool>(value);
  }

  // String --
  encode_string(value: string): void {
    const utf8 = String.UTF8.encode(value);
    this.buffer.store<u32>(utf8.byteLength);
    this.buffer.store_bytes(changetype<usize>(utf8), utf8.byteLength);
  }

  // Null -- "Option"
  encode_nullable<T>(t: T): void {
    /*if x.is_some() {
    repr(1 as u8)
    repr(x.unwrap() as ident)
  } else {
    repr(0 as u8)
  }  */
    if (t != null) {
      this.buffer.store<u8>(1);
      this.encode<NonNullable<T>>(<NonNullable<T>>t);
    } else {
      this.buffer.store<u8>(0);
    }
  }

  // Array --
  encode_array<T extends ArrayLike<any>>(value: T): void {
    // repr(value.len() as u32)
    this.buffer.store<u32>(value.length);

    //for el in x; repr(el as K)
    for (let i = 0; i < value.length; i++) {
      // @ts-ignore
      this.encode<valueof<T>>(value[i]);
    }
  }

  encode_arraybuffer(value: ArrayBuffer): void {
    this.buffer.store<u32>(value.byteLength)
    this.buffer.store_bytes(changetype<usize>(value), value.byteLength)
  }

  encode_arraybuffer_view<T extends ArrayBufferView>(value: T): void {
    //@ts-ignore
    this.buffer.store<u32>(value.byteLength / sizeof<valueof<T>>());
    this.buffer.store_bytes(value.dataStart, value.byteLength);
  }

  encode_static_array<T>(value: StaticArray<T>): void {
    if (isNumber<T>()) {
      this.buffer.store<u32>(value.length);
      this.buffer.store_bytes(
        changetype<usize>(value),
        value.length * sizeof<T>()
      );
    } else {
      this.encode_array(value);
    }
  }

  // Set --
  encode_set<T>(set: Set<T>): void {
    let values: Array<T> = set.values().sort();

    // repr(value.len() as u32)
    this.buffer.store<u32>(values.length);

    //for el in x.sorted(); repr(el as S)
    for (let i: i32 = 0; i < values.length; i++) {
      this.encode<T>(values[i]);
    }
  }

  // Map --
  encode_map<K, V>(map: Map<K, V>): void {
    let keys = map.keys().sort();

    // repr(keys.len() as u32)
    this.buffer.store<u32>(keys.length);

    // repr(k as K)
    // repr(v as V)
    for (let i = 0; i < keys.length; i++) {
      this.encode<K>(keys[i]);
      this.encode<V>(map.get(keys[i]));
    }
  }

  // Object --
  encode_object<C>(object: C): void {
    // @ts-ignore
    object.encode(this);
  }

  encode_number<T extends number>(value: T): void {
    if (isFloat<T>()) {
      // @ts-ignore
      if (value instanceof f32) {
        assert(
          value != f32.NaN,
          "For portability reasons we do not allow f32s to be encoded as Nan"
        );
      } else {
        assert(
          value != f64.NaN,
          "For portability reasons we do not allow f64s to be encoded as Nan"
        );
      }
    }
    // little_endian(x)
    this.buffer.store<T>(value);
  }

  // We override encode_number, for which we don't need these
  encode_u8(value: u8): void { }
  encode_i8(value: i8): void { }
  encode_u16(value: u16): void { }
  encode_i16(value: i16): void { }
  encode_u32(value: u32): void { }
  encode_i32(value: i32): void { }
  encode_u64(value: u64): void { }
  encode_i64(value: i64): void { }
  encode_f32(value: f32): void { }
  encode_f64(value: f64): void { }

  // We override encode_array_like, for which we don't need these
  encode_u8array(value: Uint8Array): void { }
  encode_i8array(value: Int8Array): void { }
  encode_u16array(value: Uint16Array): void { }
  encode_i16array(value: Int16Array): void { }
  encode_u32array(value: Uint32Array): void { }
  encode_i32array(value: Int32Array): void { }
  encode_u64array(value: Uint64Array): void { }
  encode_i64array(value: Int64Array): void { }

  static encode<T>(a: T): ArrayBuffer {
    const encoder = new BorshSerializer();
    encoder.encode<T>(a);
    return encoder.get_encoded_object();
  }
}
