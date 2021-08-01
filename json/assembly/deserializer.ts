import { Deserializer, allocObj, defaultValue } from "@serial-as/core";
import { u128, u128Safe } from "as-bignum";
import * as base64 from "as-base64";
import { JParser, Value } from "./parser";


export class JSONDeserializer extends Deserializer<string>{

  private current_value: Value

  constructor(encoded_object: string) {
    super(encoded_object)
    this.current_value = JParser.parse(encoded_object)
  }

  decode<T>(): T {
    const res: T = super.decode<T>()
    return res
  }

  decode_field<T>(name: string): T {
    const fields = this.current_value.fields
    if( fields == null){
      return defaultValue<T>()
    }

    if(!fields.has(name)){
      return defaultValue<T>()
    }
    
    const cv = this.current_value
    this.current_value = fields.get(name)
    const ret:T = this.decode<T>()
    this.current_value = cv
    return ret
  }

  // Bool --
  decode_bool(): bool {
    if (this.current_value.value == "true") {
      return true
    }
    assert(this.current_value.value == "false",
           `Wrong boolean ${this.current_value}`)
    return false
  }

  // String --
  decode_string(): string {
    return this.current_value.value
  }

  // Array --
  decode_array<A extends ArrayLike<any>>(): A {
    //[v1,v2,...,v4] or "uint8_encoded_as64"
    const cv = this.current_value
    const arr = this.current_value.array

    if (arr == null){
      return instantiate<A>(0)
    }

    let ret: A = instantiate<A>(arr.length)

    for(let i=0; i < arr.length; i++){
      this.current_value = arr[i]
      //@ts-ignore
      ret[i] = this.decode<valueof<A>>()
    }

    this.current_value = cv

    return ret
  }

  decode_array_to_type<A>():A{
    let decoded:Array<valueof<A>> = this.decode_array<Array<valueof<A>>>()

    let ret:A = instantiate<A>(decoded.length)

    for(let i:i32 = 0; i < decoded.length; i++){
      ret[i] = decoded[i]
    }

    return ret
  }

  decode_arraybuffer_view<A extends ArrayBufferView>(): A {
    let ret:A

    // @ts-ignore
    if (ret instanceof Uint8Array) {
      let u8arr = this.decode_string();
      return changetype<A>(base64.decode(u8arr))
    }
    
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
    if (this.current_value.value == "null") {
      return null
    }
    return this.decode<NonNullable<T>>()
  }

  // Set --
  decode_set<T>(): Set<T> {
    //[v1,v2,...,v4]
    const cv = this.current_value
    const arr = this.current_value.array

    let ret: Set<T> = new Set<T>()

    if (arr == null){
      return ret
    }

    for(let i=0; i < arr.length; i++){
      this.current_value = arr[i]
      ret.add(this.decode<T>())
    }

    this.current_value = cv

    return ret
  }

  // Map --
  decode_map<K, V>(): Map<K, V> {
    // {key:val,key:val}
    // ERROR IF K IS NOT STRING

    const cv = this.current_value
    const fields = this.current_value.fields

    if (fields == null) {
      //empty map
      return new Map<K, V>()
    }

    // non empty
    const keys = fields.keys()
    let ret_map: Map<K, V> = new Map<K, V>()

    for(let i=0; i < keys.length; i++) {
      const k = keys[i]

      this.current_value = fields.get(k)

      const value = this.decode<V>()
      ret_map.set(<K>k, value)
    }

    this.current_value = cv

    return ret_map
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
    return <T>parseInt(this.current_value.value)
  }

  decode_long<T extends number>(): T {
    let number: string = this.decode<string>()
    return <T>(parseInt(number))
  }

  decode_u128(): u128 {
    let number: string = this.decode<string>()
    return u128.from(number)
  }

  decode_float<T extends number>(): T {
    return <T>(parseFloat(this.current_value.value))
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

  static decode<T>(s: string): T {
    const decoder = new JSONDeserializer(s);
    return decoder.decode<T>();
  }
}