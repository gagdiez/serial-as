import { Serializer } from "./serializer";
import { Deserializer } from "./deserializer";

export * from "./utils"
export { Serializer, Deserializer }

export class Serial<__R, E extends Serializer<__R>, D extends Deserializer<__R>> {

  encode<O>(value: O): __R {
    let encoder: E = instantiate<E>();
    encoder.encode(value)
    return encoder.get_encoded_object();
  }

  decode<O>(t: __R): O {
    const decoder: D = instantiate<D>(t)
    return decoder.decode<O>()
  }
}