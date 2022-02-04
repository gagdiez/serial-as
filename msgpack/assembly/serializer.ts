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
    value? this.buffer.store<u8>(Format.TRUE) : this.buffer.store<u8>(Format.FALSE)
  }

  // String --
  encode_string(value: string): void {
    assert(false, "Not implemented")
  }

  // Array --
  encode_array<K extends ArrayLike<any>>(value: K): void {
    assert(false, "Not implemented")
  } 

  encode_arraybuffer(value:ArrayBuffer): void {
    assert(false, "Not implemented")
  }

  encode_arraybuffer_view<T extends ArrayBufferView>(value:T): void {
    let arr: Uint8Array;
    if (value instanceof Uint8Array) {
      arr = value;
    }else{
      arr = Uint8Array.wrap(value.buffer);
    }    
    assert(false, "Not implemented")
  }

  encode_static_array<T>(value:StaticArray<T>): void {
    this.encode_array<StaticArray<T>>(value);
  }

  // Null --
  encode_nullable<T>(t: T): void {
    if (isNull(t)) {
      this.buffer.store<u8>(Format.NIL);
    } else {
      // @ts-ignore
      this.encode<NonNullable<T>>(<NonNullable<T>>t);
    }
  }

  // Set --
  encode_set<T>(value: Set<T>): void {
    assert(false, "Not implemented")
  }

  // Map --
  encode_map<K, V>(value: Map<K, V>): void {
    assert(false, "Not implemented")
  }

  // Object --
  encode_object<C extends object>(value: C): void {
    if (value instanceof u128 || value instanceof u128Safe) {
      this.encode_string(value.toString());
      return;
    }
    assert(false, "Not implemented")
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
      this.buffer.store<i32>(<i32>value);
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
      this.buffer.store<u32>(<u32>value);
    }
  }

  encode_u8(value: u8): void { this.encode_u32(<u32>value); }
  encode_u16(value: u16): void { this.encode_u32(<u32>value); }

  encode_u64(value: u64): void { assert(false, "Not implemented yet")}

  encode_i8(value: i8): void { this.encode_i32(<i32>value); }
  encode_i16(value: i16): void { this.encode_i32(<i32>value); }

  encode_i64(value: i64): void { assert(false, "Not implemented yet") }
  
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