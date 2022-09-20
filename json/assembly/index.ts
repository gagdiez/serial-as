import { Serial } from '@serial-as/core/assembly';
import { ValueSerializer } from './serializer'
import { ValueDeserializer } from './deserializer'

import { JSON } from "assemblyscript-json/assembly";


/*
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