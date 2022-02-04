import { Serializer, isNumber } from "@serial-as/core";
import { EncodeBuffer } from "./buffer";
import {
  Format,
  isFloat32,
  isFloat64,
  isFixedInt,
  isNegativeFixedInt,
  isFixedMap,
  isFixedArray,
  isFixedString,
} from "./format";

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
    this.buffer.store<u8>(value ? <u8>Format.TRUE : <u8>Format.FALSE);
  }

  // String --
  encode_string(value: string): void {
    const utf8 = String.UTF8.encode(value);
    this.encode_string_length(utf8.byteLength);
    this.buffer.store_bytes(changetype<usize>(utf8), utf8.byteLength);
  }

  encode_string_length(length: u32): void {
    if (length < 32) {
      this.buffer.store<u8>((<u8>length) | (<u8>Format.FIXSTR));
    } else if (length <= <u32>u8.MAX_VALUE) {
      this.buffer.store<u8>(<u8>Format.STR8);
      this.buffer.store<u8>(<u8>length);
    } else if (length <= <u32>u16.MAX_VALUE) {
      this.buffer.store<u8>(<u8>Format.STR16);
      this.buffer.store<u16>(<u16>length);
    } else {
      this.buffer.store<u8>(<u8>Format.STR32);
      this.buffer.store<u32>(length);
    }
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
      this.encode<NonNullable<T>>(<NonNullable<T>>t);
    } else {
      this.encode_null();
    }
  }

  encode_null(): void {
    this.buffer.store<u8>(<u8>Format.NIL);
  }

  // Array --
  encode_array<T extends ArrayLike<any>>(value: T): void {
    // repr(value.len() as u32)
    this.encode_array_length(value.length);

    //for el in x; repr(el as K)
    for (let i = 0; i < value.length; i++) {
      // @ts-ignore
      this.encode<valueof<T>>(value[i]);
    }
  }

  encode_array_length(length: u32): void {
    if (length < 16) {
      this.buffer.store<u8>((<u8>length) | (<u8>Format.FIXARRAY));
    } else if (length <= <u32>u16.MAX_VALUE) {
      this.buffer.store<u8>(<u8>Format.ARRAY16);
      this.buffer.store<u16>(<u16>length);
    } else {
      this.buffer.store<u8>(<u8>Format.ARRAY32);
      this.buffer.store<u32>(length);
    }
  }

  encode_arraybuffer(value: ArrayBuffer): void {
    if (value.byteLength == 0) {
      this.encode_null();
      return;
    }
    this.encode_arraybuffer_length(value.byteLength);
    this.buffer.store_bytes(changetype<usize>(value), value.byteLength)
  }

  encode_arraybuffer_length(length: u32): void {
    if (length <= <u32>u8.MAX_VALUE) {
      this.buffer.store<u8>(<u8>Format.BIN8);
      this.buffer.store<u8>(<u8>length);
    } else if (length <= <u32>u16.MAX_VALUE) {
      this.buffer.store<u8>(<u8>Format.BIN16);
      this.buffer.store<u16>(<u16>length);
    } else {
      this.buffer.store<u8>(<u8>Format.BIN32);
      this.buffer.store<u32>(length);
    }
  }

  encode_arraybuffer_view<T extends ArrayBufferView>(value: T): void {
    if (value.byteLength == 0) {
      this.encode_null();
      return;
    }
    //@ts-ignore
    this.encode_arraybuffer_length(value.byteLength / sizeof<valueof<T>>());
    this.buffer.store_bytes(value.dataStart, value.byteLength);
  }

  encode_static_array<T>(value: StaticArray<T>): void {
    this.encode_array(value);
  }

  // Set --
  encode_set<T>(set: Set<T>): void {
    let values: Array<T> = set.values().sort();
    this.encode_array(values);
  }

  // Map --
  encode_map<K, V>(map: Map<K, V>): void {
    let keys = map.keys().sort();

    // repr(keys.len() as u32)
    this.encode_map_length(keys.length);

    // repr(k as K)
    // repr(v as V)
    for (let i = 0; i < keys.length; i++) {
      this.encode<K>(keys[i]);
      this.encode<V>(map.get(keys[i]));
    }
  }

  encode_map_length(length: u32): void {
    if (length < 16) {
      this.buffer.store<u8>((<u8>length) | (<u8>Format.FIXMAP));
    } else if (length <= <u32>u16.MAX_VALUE) {
      this.buffer.store<u8>(<u8>Format.MAP16);
      this.buffer.store<u16>(<u16>length);
    } else {
      this.buffer.store<u8>(<u8>Format.MAP32);
      this.buffer.store<u32>(length);
    }
  }

  // Object --
  encode_object<C>(object: C): void {
    // @ts-ignore
    object.encode(this);
  }

  // TODO
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
