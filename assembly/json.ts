import {Encoder} from ".";
import { base64, u128 } from "near-sdk-as";

export class JSON extends Encoder<string>{

  public starting_object:bool = true
  public inner_encode:string[] = []

  constructor(){
    super()
  }

  get_encoded_object():string{
    return this.inner_encode.join('')
  }

  encode_field<K>(name:string, value:K):void{
    if(this.starting_object){
      this.inner_encode.push("{")
    }
    else{ 
      this.inner_encode[this.inner_encode.length-1] = ","
    }
    
    this.inner_encode.push(`"${name}":`)
    this.encode<K>(value)
    this.inner_encode.push("}")
    this.starting_object = false
  }

  // Bool --
  encode_bool(value:bool): void{
    this.inner_encode.push(value.toString()) 
  }

  // String --
  encode_string(value:string):void{
    this.inner_encode.push(`"${value}"`)
  }

  encode_u128(value:u128):void{
    this.inner_encode.push(value.toString())
  }

  // Array --
  encode_array<K>(value:Array<K>):void{
    this.inner_encode.push(`[`)

    for(let i=0; i<value.length; i++){
      this.encode<K>(value[i])
      if(i != value.length-1){ this.inner_encode.push(`,`) }
    }

    this.inner_encode.push(`]`)
  }

  // Null --
  encode_null(): void{ this.inner_encode.push("null") }

  // Set --
  encode_set<S>(set:Set<S>): void{
    let values: Array<S> = set.values();
    this.inner_encode.push(`{`)
    for (let i = 0; i < values.length; i++) {
      this.encode<S>(values[i])
      if(i != values.length-1){ this.inner_encode.push(`,`) }
    }
    this.inner_encode.push(`}`)
  }

  // Map --
  encode_map<K, V>(value:Map<K, V>): void{
    assert(isString<K>(), "We can only encode maps with string keys")
    this.inner_encode.push(`{`)

    let keys = value.keys();

    for (let i = 0; i < keys.length; i++) {
      this.inner_encode.push(`${keys[i]}:`)
      this.encode<V>(value.get(keys[i]))
      if(i != keys.length-1){ this.inner_encode.push(`,`) }
    }

    this.inner_encode.push(`}`)
  }

  // Object --
  encode_object<C>(object:C): void{
    this.starting_object = true
    
    // @ts-ignore
    object.encode<string>(this)
  }

  // We override encode_number, for which we don't need these
  encode_u8(value:u8): void{ this.inner_encode.push(value.toString()) }
  encode_i8(value:i8): void{ this.inner_encode.push(value.toString()) }
  encode_u16(value:u16): void{ this.inner_encode.push(value.toString()) }
  encode_i16(value:i16): void{ this.inner_encode.push(value.toString()) }
  encode_u32(value:u32): void{ this.inner_encode.push(value.toString()) }
  encode_i32(value:i32): void{ this.inner_encode.push(value.toString()) }
  encode_u64(value:u64): void{ this.inner_encode.push(value.toString()) }
  encode_i64(value:i64): void{ this.inner_encode.push(value.toString()) }
  encode_f32(value:f32): void{ this.inner_encode.push(value.toString()) }
  encode_f64(value:f64): void{ this.inner_encode.push(value.toString()) }

  encode_u8array(value:Uint8Array): void{
    this.inner_encode.push(base64.encode(value))
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