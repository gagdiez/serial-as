import { JSONSerializer } from '@serial-as/json';
import { JSONBuffDeserializer } from './deserialize';


export class JSON {

  static encode<O>(object: O): Uint8Array {
    let encoder: JSONSerializer = new JSONSerializer();
    encoder.encode(object)

    let encoded:string = encoder.get_encoded_object();

    let buffer = String.UTF8.encode(encoded, false);
    
    if (buffer.byteLength === 0){
      return new Uint8Array(0);
    }else{
      return Uint8Array.wrap(buffer);
    }   
  }

  static decode<O>(t: Uint8Array): O {
    let decoder: JSONBuffDeserializer = new JSONBuffDeserializer(t)
    return decoder.decode<O>()
  }
}