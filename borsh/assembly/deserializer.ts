import {Deserializer} from "@serial-as/core";
import { u128 } from "as-bignum";
import { DecodeBuffer } from "./buffer";

export class BorshDeserializer extends Deserializer<ArrayBuffer>{
  private decoBuffer:DecodeBuffer;

  constructor(encoded_object:ArrayBuffer){
    super(encoded_object)
    this.decoBuffer = new DecodeBuffer(encoded_object)
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
    const encoded_string = this.decode_array_buffer();
    const decoded_string:string = String.UTF8.decode(encoded_string)

    // repr(decoded as Vec<u8>) 
    return decoded_string
  }

  // Array --
  decode_array<A extends ArrayLike<any>>(): A {
    // TODO: HANDLE NULL
    const length:u32 = this.decoBuffer.consume<u32>()

    let ret_array:A = instantiate<A>(length)

    //for el in x; repr(el as K)
    for(let i:u32=0; i < length; i++){
      // @ts-ignore
      ret_array[i] = this.decode<valueof<A>>()
    }

    return ret_array
  }

  decode_array_buffer(): ArrayBuffer { 
    const length:u32 = this.decoBuffer.consume<u32>()
    return this.decoBuffer.consume_slice(length);
  }

  decode_array_buffer_view<B extends ArrayBufferView>(): B {
    const length:u32 = this.decoBuffer.consume<u32>();
    // @ts-ignore
    const arrBufferView = instantiate<ArrayBuffer>(length, alignof<valueof<B>>());
    return changetype<B>(arrBufferView);

  }

  // Null --
  decode_nullable<T>(): T | null {
    let option = this.decoBuffer.consume<u8>();
    if (option) {
      return this.decode<T>()
    }
    return null;
   }

  // Set --
  decode_set<T>(): Set<T> {
    const length:u32 = this.decoBuffer.consume<u32>()

    let ret_set:Set<T> = new Set<T>()

    //for el in x.sorted(); repr(el as S)
    for(let i:u32=0; i<length; i++){
      ret_set.add(this.decode<T>())
    }

    return ret_set
  }

  // Map --
  decode_map<K, V>(): Map<K, V>{
    // TODO: HANDLE NULL
    const length:u32 = this.decoBuffer.consume<u32>()

    let ret_map:Map<K, V> = new Map<K, V>()

    // repr(k as K)
    // repr(v as V)
    for (let i:u32 = 0; i < length; i++) {
      const key = this.decode<K>()
      const value = this.decode<V>()
      ret_map.set(key, value)
    }
    return ret_map
  }

   // Object --
  decode_object<C extends object>(): C{
    let object:C = instantiate<C>()
    object.decode(this)
    return object
  }

  decode_number<T>():T {
    // little_endian(x)
    return this.decoBuffer.consume<T>()
  }

  decode_u128():u128{
    const lo = this.decoBuffer.consume<u64>();
    const hi = this.decoBuffer.consume<u64>();
    return new u128(lo, hi);
  }

  decode_typed_array<K>(): StaticArray<K> {
    const byteLength = this.decoBuffer.consume<u32>();
    const res = new StaticArray<K>(byteLength);
    this.decoBuffer.consume_copy(changetype<usize>(res), byteLength);
    return res;
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