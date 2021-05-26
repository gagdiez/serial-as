import {Encoder} from ".";
import { u128 } from "near-sdk-as";

export class JSON extends Encoder<string>{

  public first:bool = true
  public finished:bool=false
  public partial_encode:string[] = []

  constructor(){
    super()
    this.partial_encode.push('{')
  }

  get_encoded_object():string{
    if(!this.finished){
      this.partial_encode.push('}')
      this.finished = true
    }
    return this.partial_encode.join('')
  }

  encode_field<K>(name:string, value:K):void{
    if(this.finished){
      this.partial_encode.pop()
    }

    if(!this.first){this.partial_encode.push(", ")}
    this.partial_encode.push(`"${name}":`)
    this.encode<K>(value)
    this.first = false
  }

  // Bool --
  encode_bool(value:bool): void{
    this.partial_encode.push(value.toString()) 
  }

  // String --
  encode_string(value:string):void{
    this.partial_encode.push(`"${value}"`)
  }

  // Number --
  encode_number<K extends number>(value:K):void{
    this.partial_encode.push(value.toString())
  }

  encode_u128(value:u128):void{
    this.partial_encode.push(value.toString())
  }

  // Array --
  encode_array<K>(value:Array<K>):void{
    this.partial_encode.push(`[`)

    for(let i=0; i<value.length; i++){
      this.encode<K>(value[i])
      if(i != value.length-1){ this.partial_encode.push(`,`) }
    }

    this.partial_encode.push(`]`)
  }

  // Null --
  encode_null(): void{ this.partial_encode.push("null") }

  // Set --
  encode_set<S>(set:Set<S>): void{
    let values: Array<S> = set.values();
    this.partial_encode.push(`{`)
    for (let i = 0; i < values.length; i++) {
      this.encode<S>(values[i])
      if(i != values.length-1){ this.partial_encode.push(`,`) }
    }
    this.partial_encode.push(`}`)
  }

  // Map --
  encode_map<K, V>(value:Map<K, V>): void{
    assert(isString<K>(), "We can only encode maps with string keys")
    this.partial_encode.push(`{`)

    let keys = value.keys();

    for (let i = 0; i < keys.length; i++) {
      this.partial_encode.push(`${keys[i]}:`)
      this.encode<V>(value.get(keys[i]))
      if(i != keys.length-1){ this.partial_encode.push(`,`) }
    }

    this.partial_encode.push(`}`)
  }

  // Object --
  encode_object<C>(object:C): void{
    this.first = true
    // @ts-ignore
    object.encode<string>(this)
    this.finished = false
  }

  // We override encode_number, for which we don't need these
  encode_u8(value:u8): void{}
  encode_i8(value:i8): void{}
  encode_u16(value:u16): void{}
  encode_i16(value:i16): void{}
  encode_u32(value:u32): void{}
  encode_i32(value:i32): void{}
  encode_u64(value:u64): void{}
  encode_i64(value:i64): void{}
  encode_f32(value:f32): void{}
  encode_f64(value:f64): void{}

  encode_u8array(value:Uint8Array): void{
    this.partial_encode.push(`[`)

    for(let i=0; i<value.length; i++){
      this.encode<u8>(value[i])
      if(i != value.length-1){ this.partial_encode.push(`,`) }
    }

    this.partial_encode.push(`]`)
  }

  // TODO: RAISE ERROR
  encode_i8array(value:Int8Array): void{}
  encode_u16array(value:Uint16Array): void{}
  encode_i16array(value:Int16Array): void{}
  encode_u32array(value:Uint32Array): void{}
  encode_i32array(value:Int32Array): void{}
  encode_u64array(value:Uint64Array): void{}
  encode_i64array(value:Int64Array): void{}
}