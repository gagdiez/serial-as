import {JSONSerializer} from './ser';
import {JSONDeserializer} from './deser';
import { Serial } from '@serial-as/core';


export class JSON{
  
  static encode<O>(object:O): string {
    let encoder:JSONSerializer = new JSONSerializer();
    encoder.encode(object)
    return encoder.get_encoded_object();
  }

  static decode<O>(t: string): O {
    const decoder:JSONDeserializer = new JSONDeserializer(t)
    return decoder.decode<O>()
  }
}