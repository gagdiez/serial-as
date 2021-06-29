import { Serializer } from "@serial-as/core"
import { u128 } from "as-bignum";
import * as base64 from "as-base64";
import { JSON } from "assemblyscript-json";

function isNull<T>(t: T): boolean {
  if (!isNullable<T>()) return false;
  return changetype<usize>(t) == 0;
}

export class ValueSerializer extends Serializer<JSON.Value> {
  valueStack: JSON.Value[] = [];
  public starting_object: bool = true;
  public inner_encode: string[] = [];

  peek(): JSON.Value {
    return this.valueStack[this.valueStack.length - 1];
  }

  push(v: JSON.Value): void { this.valueStack.push(v); }

  encodeAndPop<T>(t: T): JSON.Value {
    this.encode<T>(t);
    return this.valueStack.pop();
  }

  get_encoded_object(): JSON.Value {
    assert(this.valueStack.length == 1);
    return this.valueStack.pop();
  }

  encode_field<K>(name: string, value: K): void {
    const obj = this.peek() as JSON.Obj;
    obj.set(name, this.encodeAndPop<K>(value));
  }

  // Bool --
  encode_bool(value: bool): void {
    this.push(JSON.Value.Bool(value));
  }

  // String --
  encode_string(value: string): void {
    this.push(JSON.Value.String(value));
  }

  // Array --
  encode_array<K extends ArrayLike<any>>(value: K): void {
    const arr = JSON.Value.Array();
    for (let i = 0; i < value.length; i++) {
      // @ts-ignore
      arr.push(this.encodeAndPop<valueof<K>>(value[i]));
    }
    this.push(arr);
  } 

  encode_arraybuffer(value:ArrayBuffer): void {
    this.encode_arraybuffer_view<Uint8Array>(Uint8Array.wrap(value))   
  }

  encode_arraybuffer_view<T extends ArrayBufferView>(value:T): void {
    let arr: Uint8Array;
    if (value instanceof Uint8Array) {
      arr = value;
    }else{
      arr = Uint8Array.wrap(value.buffer);
    }    
    this.encode_string(base64.encode(arr));
  }

  encode_static_array<T>(value:StaticArray<T>): void {
    this.encode_array<StaticArray<T>>(value);
  }

  // Null --
  encode_nullable<T>(t: T): void {
    if (isNull(t)) {
      this.push(JSON.Value.Null());
    } else {
      // @ts-ignore
      this.encode<NonNullable<T>>(<NonNullable<T>>t);
    }
  }

  // Set --
  encode_set<T>(value: Set<T>): void {
    let values = value.values();
    this.encode_array(values);
  }

  // Map --
  encode_map<K, V>(value: Map<K, V>): void {

    this.push(JSON.Value.Object());
    let keys = value.keys();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = value.get(key);
      // @ts-ignore
      this.encode_field<V>(key.toString(), val);
    }
  }

  // Object --
  encode_object<C extends object>(value: C): void {
    this.push(JSON.Value.Object());
    value.encode(this);
  }

  encode_small_int<N extends number>(value: N): void { 
    this.push(JSON.Value.Integer(value));
  }

  encode_u8(value: u8): void { this.encode_small_int(value); }
  encode_i8(value: i8): void { this.encode_small_int(value); }
  encode_u16(value: u16): void { this.encode_small_int(value); }
  encode_i16(value: i16): void { this.encode_small_int(value); }
  encode_u32(value: u32): void { this.encode_small_int(value); }
  encode_i32(value: i32): void { this.encode_small_int(value); }
  encode_u64(value: u64): void { this.encode_string(value.toString()); }
  encode_i64(value: i64): void { this.encode_string(value.toString()); }
  encode_u128(value: u128): void { this.encode_string(value.toString()); }
  encode_f32(value: f32): void { this.push(JSON.Value.Float(value)); }
  encode_f64(value: f64): void { this.push(JSON.Value.Float(value)); }

  static encode<T>(value: T): JSON.Value {
    const ser = new ValueSerializer();
    ser.encode(value);
    return ser.get_encoded_object();
  }
}