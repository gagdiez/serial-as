// import { JSONSerializer } from './serializer';
// import { JSONDeserializer } from './deserialize';
import { Serial } from '@serial-as/core';
import { ValueDeserializer, ValueSerializer } from './value'
import { JSON } from "assemblyscript-json";

// TODO figure out complier issue that prevented these exports.
// export {JSONSerializer, JSONDeserializer}


  /**
   * 
   * @param s string or JSON.Value
   * @returns 
   */
export function parse<T, From = string>(s: From): T {
    return ValueDeserializer.decode<T, From>(s);
  }

export function stringify<T>(s: T): string {
    return ValueSerializer.encode(s).stringify();
  }

export class JSONValueSerializer extends Serial <JSON.Value, ValueSerializer, ValueDeserializer> {}