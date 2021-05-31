import {Decoder} from "..";
import { u128 } from "near-sdk-as";

class DecoBuffer {
  public offset:u32 = 0;
  public start:usize;

  constructor(public ptr_arrBuffer:usize){
    this.start = ptr_arrBuffer
  }
 
  consume<T>():T{
    const off = this.offset
    this.offset += sizeof<T>()
    return load<T>(this.start + off)    
  }

  consume_slice(length:u32):ArrayBuffer{
    const off = this.offset
    this.offset += length
    return changetype<ArrayBuffer>(this.start).slice(off, off + length)
  }
}

export class BorshDecoder extends Decoder<ArrayBuffer>{

  private decoBuffer:DecoBuffer;

  constructor(encoded_object:ArrayBuffer){
    super(encoded_object)
    this.decoBuffer = new DecoBuffer(changetype<usize>(encoded_object))
  }

  decode_field<T>(name:string):T{
    return this.decode<T>()
  }

  // Bool --
  decode_bool(): bool{
    // little endian
    return this.decoBuffer.consume<bool>()
  }

  // String --
  decode_string():string{
    const lenght:u32 = this.decoBuffer.consume<u32>()

    const encoded_string = this.decoBuffer.consume_slice(lenght)
    const decoded_string:string = String.UTF8.decode(encoded_string)
    
    // repr(decoded as Vec<u8>) 
    return decoded_string
  }

  // Array --
  decode_array<A extends ArrayLike<any> | null>():A{
    // TODO: HANDLE NULL
    const length:u32 = this.decoBuffer.consume<u32>()

    let ret_array:A = instantiate<A>(length)

    //for el in x; repr(el as K)
    for(let i:u32=0; i < length; i++){
      ret_array[i] = this.decode<valueof<A>>()
    }

    return ret_array
  }

  // Null --
  decode_null(): void{ /* ?????? */ }

  // Set --
  decode_set<S extends Set<any> | null>(): S{
    // TODO: HANDLE NULL
    const length:u32 = this.decoBuffer.consume<u32>()

    let ret_set:Set<valueof<S>> = new Set<valueof<S>>()

    //for el in x.sorted(); repr(el as S)
    for(let i:u32=0; i<length; i++){
      ret_set.add(this.decode<valueof<S>>())
    }

    return ret_set
  }

  // Map --
  decode_map<M extends Map<any, any> | null>(): M{
    // TODO: HANDLE NULL
    const length:u32 = this.decoBuffer.consume<u32>()

    let ret_map:Map<indexof<M>, valueof<M>> = new Map<indexof<M>, valueof<M>>()

    // repr(k as K)
    // repr(v as V)
    for (let i:u32 = 0; i < length; i++) {
      const key = this.decode<indexof<M>>()
      const value = this.decode<valueof<M>>()
      ret_map.set(key, value)
    }
    return ret_map
  }

   // Object --
  decode_object<C>(): C{
    let object:C = instantiate<C>()
    object.decode<ArrayBuffer>(this)
    return object
  }

  decode_number<T>():T{
    // little_endian(x)
    return this.decoBuffer.consume<T>()
  }

  decode_u128():u128{
    return this.decoBuffer.consume<u128>()
  }

  // We override decode_number, for which we don't need these
  decode_u8(): u8{ return 0 }
  decode_i8(): i8{ return 0 }
  decode_u16(): u16{ return 0 }
  decode_i16(): i16{ return 0 }
  decode_u32(): u32{ return 0 }
  decode_i32(): i32{ return 0 }
  decode_u64(): u64{ return 0 }
  decode_i64(): i64{ return 0 }
  decode_f32(): f32{ return 0 }
  decode_f64(): f64{ return 0 }
}