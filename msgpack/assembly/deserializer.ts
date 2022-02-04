import { Deserializer, allocObj, WRAP } from "@serial-as/core";
import { u128, u128Safe } from "as-bignum";
import { Value, MsgParser } from "./parser";

export class MsgPackDeserializer extends Deserializer<ArrayBuffer>{
  
  private current_value: Value

  constructor(encoded_object: ArrayBuffer) {
    super(encoded_object)
    this.current_value = MsgParser.parse(encoded_object)
  }

  decode<T>(): T {
    const res: T = super.decode<T>()
    return res
  }

  _decode_field<T>(name: string, defaultValue: T): T {
    const fields = this.current_value.fields
    if( fields == null){
      return defaultValue
    }

    if(!fields.has(name)){
      return defaultValue
    }
    
    const cv = this.current_value
    this.current_value = fields.get(name)
    const ret:T = this.decode<T>()
    this.current_value = cv
    return ret
  }

  // Bool --
  decode_bool(): bool {
    //if (this.current_value.value == "true") {
    //  return true
    //}
    //assert(this.current_value.value == "false",
    //       `Wrong boolean ${this.current_value}`)
    //return false
    return false
  }

  // String --
  decode_string(): string {
    return ""
  }

  // Array --
  decode_array<A extends ArrayLike<any>>(): A {
    //[v1,v2,...,v4] or "uint8_encoded_as64"
    return instantiate<A>(0)
  }

  decode_array_to_type<A>():A{
    return instantiate<A>(0)
  }

  decode_arraybuffer_view<A extends ArrayBufferView>(): A {   
    return this.decode_array_to_type<A>()
  }

  decode_static_array<T>():StaticArray<T>{
    return this.decode_array_to_type<StaticArray<T>>()
  }

  decode_arraybuffer(): ArrayBuffer{
    return this.decode_array_to_type<Uint8Array>().buffer
  }

  // Null --
  decode_nullable<T>(): T | null {
    return null
  }

  // Set --
  decode_set<T>(): Set<T> {
    let ret: Set<T> = new Set<T>()
    return ret
  }

  // Map --
  decode_map<K, V>(): Map<K, V> {
    return new Map<K, V>()
  }

  // Object --
  decode_object<C extends object>(): C {
    // {object}

    let object: C;
    object = allocObj<C>();
    if (object instanceof u128 || object instanceof u128Safe) {
      const obj = u128.from(this.decode_string());
      object.lo = obj.lo;
      object.hi = obj.hi;
    } else {
      object.decode(this);
    }

    return object
  }

  decode_int<T extends number>(): T {
    return <T>0
  }

  decode_long<T extends number>(): T {
    return <T>0
  }

  decode_u128(): u128 {
    return u128.from(0)
  }

  decode_float<T extends number>(): T {
    return <T>(parseFloat("0"))
  }

  // We override decode_number, for which we don't need these
  decode_u8(): u8 { return this.decode_int<u8>() }
  decode_i8(): i8 { return this.decode_int<i8>() }
  decode_u16(): u16 { return this.decode_int<u16>() }
  decode_i16(): i16 { return this.decode_int<i16>() }
  decode_u32(): u32 { return this.decode_int<u32>() }
  decode_i32(): i32 { return this.decode_int<i32>() }
  decode_u64(): u64 { return this.decode_long<u64>() }
  decode_i64(): i64 { return this.decode_long<i64>() }
  decode_f32(): f32 { return this.decode_float<f32>() }
  decode_f64(): f64 { return this.decode_float<f64>() }

  static decode<T>(a: ArrayBuffer): T {
    return (new MsgPackDeserializer(a)).decode<T>();
  }
}
