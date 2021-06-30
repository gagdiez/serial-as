import { Deserializer, allocObj } from "@serial-as/core";
import { u128 } from "as-bignum";
import * as base64 from "as-base64";

export class JSONDeserializer extends Deserializer<string>{

  public offset: u32 = 0
  public first: bool = true
  public nums: Set<string> = new Set<string>()
  public floats: Set<string> = new Set<string>()

  constructor(encoded_object: string) {
    super(encoded_object)
    this.nums.add("-")
    this.nums.add("+")

    this.floats.add("-")
    this.floats.add("+")

    this.floats.add(".")
    this.floats.add("e")
    this.floats.add("E")

    for (let i: u8 = 0; i < 10; i++) {
      this.nums.add(i.toString())
      this.floats.add(i.toString())
    }
  }

  finished(): bool {
    return this.offset == <u32>this.encoded_object.length
  }

  current_char(): string {
    return this.encoded_object.at(this.offset)
  }

  escaped_char(): bool {
    if (this.offset == 0) { return false }
    return this.encoded_object.at(this.offset - 1) == '\\'
  }

  skip_spaces(): void {
    while (!this.finished() && this.current_char() == " ") {
      this.offset += 1
    }
  }

  decode<T>(): T {
    this.skip_spaces()
    const res: T = super.decode<T>()
    this.skip_spaces()
    return res
  }

  _decode_field<T>(name: string, _defaultValue: T): T {
    // "name":value,

    this.skip_spaces()

    if (this.first) {
      this.offset += 1
      this.first = false
    }

    this.skip_spaces()

    // pass over "name"
    this.offset += name.length + 2

    this.skip_spaces()

    // pass over :
    this.offset += 1

    this.skip_spaces()

    // get value
    const ret: T = this.decode<T>()

    this.skip_spaces()

    // pass over , or }
    this.offset += 1

    return ret
  }

  // Bool --
  decode_bool(): bool {
    if (this.encoded_object.at(this.offset) == "t") {
      // it is true,
      this.offset += 4
      return true
    }
    // it is false,
    this.offset += 5
    return false
  }

  // String --
  decode_string(): string {
    // "a\"string"
    this.offset += 1
    let start: u32 = this.offset

    while (true) {
      if ((this.current_char() == '"' || this.current_char() == "'") && !this.escaped_char()) {
        break
      }
      this.offset += 1
    }

    let ret: string = this.encoded_object.slice(start, this.offset)
    ret = ret.replaceAll('\\"', '"')
    ret = ret.replaceAll("\\'", "'")
    this.offset += 1
    return ret
  }

  // Array --
  decode_array<A extends ArrayLike<any>>(): A {
    //[v1,v2,...,v4] or "uint8_encoded_as64"
    let ret: A

    this.offset += 1 // skip [
    this.skip_spaces()

    if (this.current_char() == ']') {
      //empty array
      this.offset += 1
      return instantiate<A>(0)
    }

    // Not empty
    ret = instantiate<A>()

    while (this.current_char() != ']') {
      if (this.current_char() == ',') { this.offset += 1 }
      //@ts-ignore
      ret.push(this.decode<valueof<A>>())
    }

    this.offset += 1  // skip: ]

    return ret
  }

  decode_array_to_type<A>():A{
    // @ts-ignore
    let decoded:Array<valueof<A>> = this.decode_array<Array<valueof<A>>>()

    let ret:A = instantiate<A>(decoded.length)

    for(let i:i32 = 0; i < decoded.length; i++){
      // @ts-ignore
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
    if (this.current_char() == "n") {
      this.offset += 4  // skip null
      return null
    }
    return this.decode<NonNullable<T>>()
  }

  // Set --
  decode_set<T>(): Set<T> {
    // {val,val,val}
    this.offset += 1  // skip {

    this.skip_spaces()

    if (this.current_char() == '}') {
      //empty set
      this.offset += 1
      return new Set<T>()
    }

    // not empty
    let ret_set: Set<T> = new Set<T>()

    while (this.current_char() != '}') {
      if (this.current_char() == ',') { this.offset += 1 }
      ret_set.add(this.decode<T>())
    }

    this.offset += 1  // skip }

    return ret_set
  }

  // Map --
  decode_map<K, V>(): Map<K, V> {
    // {key:val,key:val}
    this.offset += 1  // skip {

    this.skip_spaces()

    if (this.current_char() == '}') {
      //empty map
      this.offset += 1
      return new Map<K, V>()
    }

    // non empty
    let ret_map: Map<K, V> = new Map<K, V>()
    while (this.current_char() != '}') {
      if (this.current_char() == ',') { this.offset += 1 }

      const key = this.decode<K>()
      this.offset += 1  // skip :
      const value = this.decode<V>()
      ret_map.set(key, value)
    }

    this.offset += 1  // skip }

    return ret_map
  }

  // Object --
  decode_object<C extends object>(): C {
    // {object}
    this.first = true
    let object: C = allocObj<C>()
    object.decode(this)
    return object
  }

  decode_int<T extends number>(): T {

    let start: u32 = this.offset
    // faster than performing regex?
    while (!this.finished() && this.nums.has(this.current_char())) {
      this.offset += 1
    }

    return <T>parseInt(this.encoded_object.slice(start, this.offset))
  }

  decode_long<T extends number>(): T {
    let num: string = this.decode<string>()
    return <T>(isSigned<T>() ? I64.parseInt(num) : U64.parseInt(num));
  }

  decode_u128(): u128 {
    let number: string = this.decode<string>()
    return u128.from(number)
  }

  decode_float<T extends number>(): T {
    let start: u32 = this.offset

    // faster than performing regex?
    while (!this.finished() && this.floats.has(this.current_char())) {
      this.offset += 1
    }

    return <T>(parseFloat(this.encoded_object.slice(start, this.offset)))
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
}