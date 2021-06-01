import { Encoder } from "./encoder";
import { Decoder } from "./decoder";

function emptyNew<T>(): T {
  return changetype<T>(__new(offsetof<T>(), idof<T>()));
}

/**
 * Top Level Seraializer
 */
export class Serializer<T, E extends Encoder<T>, D extends Decoder<T>> {
  
  encoder(): E {
    return emptyNew<E>();
  }

  decoder(t: T): D {
    return (emptyNew<D>()).init(t);
  }
}
