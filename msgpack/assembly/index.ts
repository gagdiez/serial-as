import { Serial } from '@serial-as/core'

import { MsgPackSerializer } from './serializer'
import { MsgPackDeserializer } from './deserializer'

export class MsgPack extends Serial<ArrayBuffer, MsgPackSerializer, MsgPackDeserializer>{}

export { MsgPackSerializer, MsgPackDeserializer };