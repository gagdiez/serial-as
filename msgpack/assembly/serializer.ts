import { Serializer } from "@serial-as/core"
import { EncodeBuffer } from "./buffer";
import { u128, u128Safe } from "as-bignum";
import { Format } from "./format"

function isNull<T>(t: T): boolean {
  if (!isNullable<T>()) return false;
  return changetype<usize>(t) == 0;
}

export class MsgPackSerializer extends Serializer<ArrayBuffer> {

  public buffer: EncodeBuffer = new EncodeBuffer();

  get_encoded_object(): ArrayBuffer {
    return this.buffer.get_used_buffer();
  }

  encode_field<T>(name: string, value: T): void {
    this.encode<T>(value);
  }

  // Bool --
  encode_bool(value: bool): void {
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

  encode_static_array<T>(value:StaticArray<T>): void {
    this.encode_array<StaticArray<T>>(value);
  }

  // Null --
  encode_nullable<T>(t: T): void {
    if (isNull(t)) {
      this.encode_null();
    } else {
      // @ts-ignore
      this.encode<NonNullable<T>>(<NonNullable<T>>t);
    }
  }

  encode_null(): void {
    this.buffer.store<u8>(<u8>Format.NIL);
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

  encode_i32(value: i32): void { 
    if (value >= 0 && value < 1 << 7) {
      this.buffer.store<u8>(<u8>value);
    } else if (value < 0 && value >= -(1 << 5)) {
      this.buffer.store<u8>((<u8>value) | (<u8>Format.NEGATIVE_FIXINT));
    } else if (value <= <i32>i8.MAX_VALUE && value >= <i32>i8.MIN_VALUE) {
      this.buffer.store<u8>(<u8>Format.INT8);
      this.buffer.store<i8>(<i8>value);
    } else if (value <= <i32>i16.MAX_VALUE && value >= <i32>i16.MIN_VALUE) {
      this.buffer.store<u8>(<u8>Format.INT16);
      this.buffer.store<i16>(<i16>value);
    } else {
      this.buffer.store<u8>(<u8>Format.INT32);
      this.buffer.store<i32>(value);
    }
  }

  encode_u32(value: u32): void {
    if (value < 1 << 7) {
      this.buffer.store<u8>(<u8>value);
    } else if (value <= <u32>u8.MAX_VALUE) {
      this.buffer.store<u8>(<u8>Format.UINT8);
      this.buffer.store<u8>(<u8>value);
    } else if (value <= <u32>u16.MAX_VALUE) {
      this.buffer.store<u8>(<u8>Format.UINT16);
      this.buffer.store<u16>(<u16>value);
    } else {
      this.buffer.store<u8>(<u8>Format.UINT32);
      this.buffer.store<u32>(value);
    }
  }

  encode_u8(value: u8): void { this.encode_u32(<u32>value); }
  encode_u16(value: u16): void { this.encode_u32(<u32>value); }

  encode_u64(value: u64): void {
    if (value <= <u64>u32.MAX_VALUE) {
      this.encode_u32(<u32>value);
    } else {
      this.buffer.store<u8>(<u8>Format.UINT64);
      this.buffer.store<u64>(value);
    }
  }

  encode_i8(value: i8): void { this.encode_i32(<i32>value); }
  encode_i16(value: i16): void { this.encode_i32(<i32>value); }

  encode_i64(value: i64): void {
    if (value <= <i64>i32.MAX_VALUE && value >= <i64>i32.MIN_VALUE) {
      this.encode_i32(<i32>value);
    } else {
      this.buffer.store<u8>(<u8>Format.INT64);
      this.buffer.store<i64>(value);
    }
  }
  
  encode_f32(value: f32): void {
    this.buffer.store<u8>(<u8>Format.FLOAT32);
    this.buffer.store<f32>(value);
  }

  encode_f64(value: f64): void {
    this.buffer.store<u8>(<u8>Format.FLOAT64);
    this.buffer.store<f64>(value);
  }

  static encode<T>(a: T): ArrayBuffer {
    const encoder = new MsgPackSerializer();
    encoder.encode<T>(a);
    return encoder.get_encoded_object();
  }
}
