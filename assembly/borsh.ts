import {Encoder} from ".";
import { u128 } from "near-sdk-as";

export class Borsh extends Encoder<ArrayBuffer>{
  public offset:i32 = 0
  public inner_encode:ArrayBuffer = new ArrayBuffer(200)

  constructor(){
    super()
  }
  
  get_encoded_object():ArrayBuffer{
    return this.inner_encode.slice(0, this.offset)
  }

  encode_field<T>(name:string, value:T):void{
    this.encode<T>(value)
  }

  // Bool --
  encode_bool(value:bool): void{
    // Q3 ??????? 
  }

  // String --
  encode_string(value:string):void{
    const utf8_enc:ArrayBuffer = String.UTF8.encode(value)
    
    // repr(encoded.len() as u32)
    store<u32>(changetype<usize>(this.inner_encode) + this.offset,
               utf8_enc.byteLength)
    this.offset += 4
    
    // repr(encoded as Vec<u8>) 
    memory.copy(changetype<usize>(this.inner_encode) + this.offset,
                changetype<usize>(utf8_enc),
                utf8_enc.byteLength)
    this.offset += utf8_enc.byteLength
  }

  // Array --
  encode_array<K>(value:Array<K>):void{
    // repr(value.len() as u32) 
    store<u32>(changetype<usize>(this.inner_encode) + this.offset,
               value.length as u32)
    this.offset += 4

    //for el in x; repr(el as K)
    for(let i=0; i<value.length; i++){
      this.encode<K>(value[i])  // already updates this.offset
    }
  }

  // Null --
  encode_null(): void{ /* ?????? */ }

  // Set --
  encode_set<S>(set:Set<S>): void{
    let values: Array<S> = set.values();
    // repr(value.len() as u32) 
    store<u32>(changetype<usize>(this.inner_encode) + this.offset,
               values.length as u32)
    this.offset += 4
    
    //for el in x.sorted(); repr(el as S)
    for(let i=0; i<values.length; i++){
      this.encode<S>(values[i])  // already updates this.offset
    }
  }

  // Map --
  encode_map<K, V>(value:Map<K, V>): void{
    let keys = value.keys();

    // repr(encoded.len() as u32)
    store<u32>(changetype<usize>(this.inner_encode) + this.offset,
               keys.length)
    this.offset += 4

    // repr(k as K)
    // repr(v as V)
    for (let i = 0; i < keys.length; i++) {
      this.encode<K>(keys[i])
      this.encode<V>(value.get(keys[i]))
    }
  }

  // Object --
  encode_object<C>(object:C): void{   
    // @ts-ignore
    object.encode<string>(this)
  }

  encode_number<T>(value:T):void{
    // little_endian(x)
    store<T>(changetype<usize>(this.inner_encode) + this.offset, value)
    this.offset += sizeof<T>()
  }

  encode_u128(value:u128):void{
    // little_endian(x)
    store<u128>(changetype<usize>(this.inner_encode) + this.offset, value)
    this.offset += sizeof<u128>()
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

  // We override encode_array_like, for which we don't need these
  encode_u8array(value:Uint8Array): void{}
  encode_i8array(value:Int8Array): void{}
  encode_u16array(value:Uint16Array): void{}
  encode_i16array(value:Int16Array): void{}
  encode_u32array(value:Uint32Array): void{}
  encode_i32array(value:Int32Array): void{}
  encode_u64array(value:Uint64Array): void{}
  encode_i64array(value:Int64Array): void{}

}