import {BorshSerializer} from './serializer'
import {BorshDeserializer} from './deserializer'

export class Borsh{
  
  static encode<O>(object:O): ArrayBuffer {
    let encoder:BorshSerializer = new BorshSerializer();
    encoder.encode(object)
    return encoder.get_encoded_object();
  }

  static decode<O>(t: ArrayBuffer): O {
    const decoder:BorshDeserializer = new BorshDeserializer(t)
    return decoder.decode<O>()
  }
}