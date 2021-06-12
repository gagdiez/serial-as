import { JSONSerializer } from './serializer';
import { JSONDeserializer } from './deserialize';

export {JSONSerializer, JSONDeserializer}

export class JSON {

  static encode<O>(object: O): string {
    let encoder: JSONSerializer = new JSONSerializer();
    encoder.encode(object)
    return encoder.get_encoded_object();
  }

  static decode<O>(t: string): O {
    const decoder: JSONDeserializer = new JSONDeserializer(t)
    return decoder.decode<O>()
  }
}