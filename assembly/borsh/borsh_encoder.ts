import {Encoder} from "..";
import { u128 } from "near-sdk-as";

class Buffer {
  public offset:u32 = 0;
  public buffer_size:u32 = 2;
  public start:usize = heap.alloc(this.buffer_size);

  resize_if_necessary(needed_space:u32):void{
    if(this.buffer_size - this.offset < needed_space){
      this.buffer_size = max(this.buffer_size*2, this.buffer_size + needed_space)
      this.start = heap.realloc(this.start, this.buffer_size)
    }
  }
  
  store<T>(value:T):void{
    this.resize_if_necessary(sizeof<T>())
    store<T>(this.start + this.offset, value)
    this.offset += sizeof<T>()
  }

  copy(src:usize, nBytes:u32):void{
    this.resize_if_necessary(nBytes)
    memory.copy(this.start + this.offset, src, nBytes)
    this.offset += nBytes
  }

  get_used_buffer():ArrayBuffer{
    return changetype<ArrayBuffer>(this.start).slice(0, this.offset)
  }
}


export class BorshEncoder extends Encoder<ArrayBuffer>{
  public buffer:Buffer = new Buffer()
  
  get_encoded_object():ArrayBuffer{
    return this.buffer.get_used_buffer()
  }

  encode_field<T>(name:string, value:T):void{
    this.encode<T>(value)
  }

  // Bool --
  encode_bool(value:bool): void{
    // little endian
    this.buffer.store<bool>(value)
  }

  // String --
  encode_string(value:string):void{
    const utf8_enc:ArrayBuffer = String.UTF8.encode(value)
    
    // repr(encoded.len() as u32)
    this.buffer.store<u32>(utf8_enc.byteLength)
    
    // repr(encoded as Vec<u8>) 
    this.buffer.copy(changetype<usize>(utf8_enc), utf8_enc.byteLength)
  }

  // Array --
  encode_array<A extends ArrayLike<any> | null>(value:A):void{
    if(value == null){return this.encode_null()}

    // repr(value.len() as u32)
    this.buffer.store<u32>(value.length)

    //for el in x; repr(el as K)
    for(let i=0; i<value.length; i++){
      this.encode<A>(value[i])
    }
  }

  // Null --
  encode_null(): void{ /* ?????? */ }

  // Set --
  encode_set<S extends Set<any> | null>(set:S): void{
    if(set == null){return this.encode_null()}

    let values = set.values();

    // repr(value.len() as u32) 
    this.buffer.store<u32>(values.length)
    
    //for el in x.sorted(); repr(el as S)
    for(let i=0; i<values.length; i++){
      this.encode<S>(values[i])
    }
  }

  // Map --
  encode_map<M extends Map<any, any> | null>(map:M): void{
    if(map == null){return this.encode_null()}

    let keys = map.keys();

    // repr(keys.len() as u32)
    this.buffer.store<u32>(keys.length)

    // repr(k as K)
    // repr(v as V)
    for (let i = 0; i < keys.length; i++) {
      this.encode<K>(keys[i])
      this.encode<V>(map.get(keys[i]))
    }
  }

  // Object --
  encode_object<C>(object:C): void{   
    // @ts-ignore
    object.encode<ArrayBuffer>(this)
  }

  encode_number<T>(value:T):void{
    // little_endian(x)    
    this.buffer.store<T>(value)
  }

  encode_u128(value:u128):void{
    // little_endian(x)
    this.buffer.store<u128>(value)
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