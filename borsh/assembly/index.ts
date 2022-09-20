import { Serial } from '@serial-as/core/assembly'

import { BorshSerializer } from './serializer'
import { BorshDeserializer } from './deserializer'

export class Borsh extends Serial<ArrayBuffer, BorshSerializer, BorshDeserializer>{}

export { BorshSerializer, BorshDeserializer };