import {BorshEncoder} from './encoder'
import {BorshDecoder} from './decoder'
import {Serializer} from '@serial-as/core';
export {BorshEncoder, BorshDecoder};
export * from "./buffer";

export class BorshSerializer extends Serializer<ArrayBuffer, BorshEncoder, BorshDecoder> {
  private static singleton: BorshSerializer = new BorshSerializer();

  static decoder(t: ArrayBuffer): BorshDecoder { return BorshSerializer.singleton.decoder(t); }
  static encoder(): BorshEncoder { return BorshSerializer.singleton.encoder(); }
}