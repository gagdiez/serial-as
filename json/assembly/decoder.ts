import {Decoder} from "@encoder-as/core";
import { u128 } from "as-bignum";
import * as base64 from "as-base64";

export class JSONDecoder extends Decoder<string>{

  public offset:u32 = 0
  public first:bool = true
  public nums:Set<string> = new Set<string>()

  constructor(encoded_object:string){
    super(encoded_object)
    this.nums.add("-")
    this.nums.add(".")
    for(let i:u8=0; i < 10; i++){
      this.nums.add(i.toString())
    }
  }

  decode_field<T>(name:string):T{
    if(this.first){
      this.offset += 1
      this.first = false
    }

    // "name":value,
    // pass over "name":
    this.offset += name.length + 3

    // get value
    const ret:T = this.decode<T>()
    
    // pass over , or }
    this.offset += 1
    return ret
  }

  // Bool --
  decode_bool(): bool{
    if(this.encoded_object.at(this.offset) == "t"){
      // it is true,
      this.offset += 4
      return true
    }
    // it is false,
    this.offset += 5
    return false
  }

  // String --
  decode_string():string{
    // "a\"string"
    this.offset += 1
    let start:u32 = this.offset

    // TODO: FIX, this doesn't work for \"
    while(true){
      if(this.encoded_object.at(this.offset) == '"' && this.encoded_object.at(this.offset-1) != '\\'){
        break
      }
      this.offset += 1
    }
    
    let ret:string = this.encoded_object.slice(start, this.offset)
    ret = ret.replace('\\"', '"')
    this.offset += 1
    return ret
  }

  // Array --
  decode_array<A extends ArrayLike<any>>(): A {
    //[v1,v2,...,v4] or "uint8_encoded_as64"
    let ret:A
    if(ret instanceof Uint8Array){
      let u8arr = this.decode_string();
      return changetype<A>(base64.decode(u8arr))
    }

    if(this.encoded_object.at(this.offset+1) == ']'){
      //empty array
      this.offset += 2
      return instantiate<A>(0)
    }

    // Not empty
    ret = instantiate<A>()

    while(this.encoded_object.at(this.offset) != ']'){
      this.offset += 1
      ret.push(this.decode<valueof<A>>())
    }

    this.offset += 1  // skip ]
  
    return ret
  }

  // Null --
  decode_nullable<T>(): T | null{
    if (this.encoded_object.slice(this.offset, this.offset+5) != "null,"){
      return this.decode<T>()
    }
    return null
   }

  // Set --
  decode_set<T>(): Set<T> {
    // {val,val,val}
    if(this.encoded_object.at(this.offset+1) == '}'){
      //empty set
      this.offset += 2
      return new Set<T>()
    }

    let ret_set:Set<T> = new Set<T>()

    while(this.encoded_object.at(this.offset) != '}'){
      this.offset += 1
      ret_set.add(this.decode<T>())
    }

    this.offset += 1  // skip }

    return ret_set
  }

  // Map --
  decode_map<K, V>(): Map<K, V>{
    // {key:val,key:val}
    if(this.encoded_object.at(this.offset+1) == '}'){
      //empty map
      this.offset += 2
      return new Map<K, V>()
    }

    let ret_map:Map<K, V> = new Map<K, V>()
    while(this.encoded_object.at(this.offset) != '}'){
      this.offset += 1
      const key = this.decode<K>()
      this.offset += 1  // skip :
      const value = this.decode<V>()
      ret_map.set(key, value)
    }

    this.offset += 1  // skip }

    return ret_map
  }

   // Object --
  decode_object<C extends object>(): C{
    // {object}
    this.first = true
    let object:C = instantiate<C>()
    object.decode<string>(this)
    return object
  }

  decode_int<T extends number>():T{

    let start:u32 = this.offset
    // faster than performing regex?
    while(this.offset < <u32>this.encoded_object.length && this.nums.has(this.encoded_object.at(this.offset))){
      this.offset += 1
    }

    return <T>parseInt(this.encoded_object.slice(start, this.offset))
  }

  decode_long<T extends number>():T{
    let number:string = this.decode_string()
    return <T>(parseInt(number))
  }
  
  decode_u128():u128{
    let number:string = this.decode_string()
    return u128.from(number)
  }

  decode_float<T extends number>():T{
    let start:u32 = this.offset

    // faster than performing regex?
    while(this.nums.has(this.encoded_object.at(this.offset))){
      this.offset += 1
    }

    return <T>(parseFloat(this.encoded_object.slice(start, this.offset)))
  }

  // We override decode_number, for which we don't need these
  decode_u8(): u8{ return this.decode_int<u8>() }
  decode_i8(): i8{ return this.decode_int<i8>() }
  decode_u16(): u16{ return this.decode_int<u16>() }
  decode_i16(): i16{ return this.decode_int<i16>() }
  decode_u32(): u32{ return this.decode_int<u32>() }
  decode_i32(): i32{ return this.decode_int<i32>() }
  decode_u64(): u64{ return this.decode_long<u64>() }
  decode_i64(): i64{ return this.decode_long<i64>() }
  decode_f32(): f32{ return this.decode_float<f32>() }
  decode_f64(): f64{ return this.decode_float<f64>() }
}