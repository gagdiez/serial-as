import { Deserializer } from "@serial-as/core";
import { u128 } from "as-bignum";
import * as base64 from "as-base64";

@lazy const CHAR_0: i32 = 48;
@lazy const CHAR_9: i32 = 57;
@lazy const CHAR_t: i32 = 't'.charCodeAt(0);
@lazy const CHAR_quotation:i32 = '"'.charCodeAt(0)
@lazy const CHAR_single_quotation:i32 = "'".charCodeAt(0)
@lazy const CHAR_escape:i32 = '\\'.charCodeAt(0)
@lazy const CHAR_minus:i32 = '-'.charCodeAt(0)
@lazy const CHAR_plus:i32 = '+'.charCodeAt(0)
@lazy const CHAR_point:i32 = '.'.charCodeAt(0)
@lazy const CHAR_comma:i32 = ','.charCodeAt(0)
@lazy const CHAR_ckey:i32 = '}'.charCodeAt(0)
@lazy const CHAR_e:i32 = 'e'.charCodeAt(0)
@lazy const CHAR_E:i32 = 'E'.charCodeAt(0)
@lazy const CHAR_cbraket:i32 = ']'.charCodeAt(0)

export class JSONBuffDeserializer extends Deserializer<Uint8Array>{

  public offset: u32 = 0
  public first: bool = true
  public nums: Set<i32> = new Set<i32>()
  public floats: Set<i32> = new Set<i32>()
  public ptr_buffer:usize

  constructor(encoded_object: Uint8Array) {
    super(encoded_object)

    this.ptr_buffer = changetype<usize>(this.encoded_object.buffer) + this.encoded_object.byteOffset
  }

  finished(): bool {
    return this.offset == <u32>this.encoded_object.length
  }

  current_char(): u8 {
    return this.encoded_object[this.offset]
  }

  escaped_char(): bool {
    if (this.offset == 0) { return false }
    return this.encoded_object[this.offset - 1] == CHAR_escape
  }

  is_float(char:i32):bool{
    return this.is_number(char) || char == CHAR_point || char == CHAR_e || char == CHAR_E || char == CHAR_minus || char == CHAR_plus
  }
  
  is_number(char:i32):bool{
    return CHAR_0 <= char && char <= CHAR_9
  }

  skip_spaces(): void {
    while (!this.finished() && this.current_char() == " ".charCodeAt(0)) {
      this.offset += 1
    }
  }

  decode<T>(): T {
    this.skip_spaces()
    const res: T = super.decode<T>()
    this.skip_spaces()
    return res
  }

  decode_field<T>(name: string): T {
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
    if (this.current_char() == CHAR_t) {
      // it is true
      this.offset += 4
      return true
    }
    // it is false
    this.offset += 5
    return false
  }

  // String --
  decode_string(): string {
    // "a\"string"
    this.offset += 1
    let start: u32 = this.offset

    while (true) {
      if ((this.current_char() == CHAR_quotation || this.current_char() == CHAR_single_quotation) && !this.escaped_char()) {
        break
      }
      this.offset += 1
    }

    let ret:string = String.UTF8.decodeUnsafe(this.ptr_buffer + start, this.offset - start);
    ret = ret.replace('\\"', '"')
    ret = ret.replace("\\'", "'")
    this.offset += 1
    return ret
  }

  // Array --
  decode_array<A extends ArrayLike<any>>(): A {
    //[v1,v2,...,v4] or "uint8_encoded_as64"
    let ret: A
    // @ts-ignore
    if (ret instanceof Uint8Array) {
      let u8arr = this.decode_string();
      return changetype<A>(base64.decode(u8arr))
    }

    this.offset += 1 // skip [
    this.skip_spaces()

    if (this.current_char() == CHAR_cbraket) {
      //empty array
      this.offset += 1
      return instantiate<A>(0)
    }

    // Not empty
    ret = instantiate<A>()

    while (this.current_char() != CHAR_cbraket) {
      if (this.current_char() == CHAR_comma) { this.offset += 1 }
      //@ts-ignore
      ret.push(this.decode<valueof<A>>())
    }

    this.offset += 1  // skip: ]

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
    return this.decode_array_to_type<ArrayBuffer>()
  }

  // Null --
  decode_nullable<T>(): T | null {
    if (this.current_char() == "n".charCodeAt(0)) {
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

    if (this.current_char() == CHAR_ckey) {
      //empty set
      this.offset += 1
      return new Set<T>()
    }

    // not empty
    let ret_set: Set<T> = new Set<T>()

    while (this.current_char() != CHAR_ckey) {
      if (this.current_char() == CHAR_comma) { this.offset += 1 }
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

    if (this.current_char() == CHAR_ckey) {
      //empty map
      this.offset += 1
      return new Map<K, V>()
    }

    // non empty
    let ret_map: Map<K, V> = new Map<K, V>()
    while (this.current_char() != CHAR_ckey) {
      if (this.current_char() == CHAR_comma) { this.offset += 1 }

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
    let object: C = instantiate<C>()
    object.decode(this)
    return object
  }

  decode_int<T extends number>(): T {
    let value:T = 0
    let sign:T = 1

    if(this.current_char() == CHAR_minus){
      sign = <T>-1
    }
    
    if(this.current_char() == CHAR_minus || this.current_char() == CHAR_plus){
      this.offset += 1 
    }

    // not much worst than comparing?
    while (!this.finished() && this.is_number(this.current_char())) {
      value *= 10
      value += <T>(this.current_char() - CHAR_0)
      this.offset += 1
    }

    return value * sign
  }

  decode_long<T extends number>(): T {
    this.offset += 1 
    let number: T = this.decode_int<T>()
    this.offset += 1
    return <T>number
  }

  decode_u128(): u128 {
    let number: string = this.decode<string>()
    return u128.from(number)
  }

  decode_float<T extends number>(): T {
    let start: u32 = this.offset

    // faster than performing regex?
    while (!this.finished() && this.is_float(this.current_char())) {
      this.offset += 1
    }

    let ret:string = String.UTF8.decodeUnsafe(this.ptr_buffer + start, this.offset - start);
    return <T>(parseFloat(ret))
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