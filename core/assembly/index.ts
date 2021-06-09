import { Serializer } from "./ser";
import { Deserializer } from "./deser";

export * from "./utils";
export {Serializer, Deserializer}

function emptyNew<T>(): T {
  return changetype<T>(__new(offsetof<T>(), idof<T>()));
}

/**
 * Top Level Seraializer
 */
export class Serial<T, E extends Serializer<T>, D extends Deserializer<T>> {
  
  encoder(): E {
    return emptyNew<E>();
  }

  decoder(t: T): D {
    return (emptyNew<D>()).init(t);
  }
}



