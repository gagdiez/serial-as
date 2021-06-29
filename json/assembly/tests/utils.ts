import { MixtureTwo } from "@serial-as/tests";
import * as base64 from "as-base64";
import { u128 } from "as-bignum";

export function initMixtureTwo(f: MixtureTwo): MixtureTwo {
  f.u32Arr = [42, 11];
  f.foo = 321;
  f.bar = 123;
  f.flag = true;
  f.baz = "foo";
  f.uint8array = base64.decode("aGVsbG8sIHdvcmxkIQ==");
  f.u128Val = new u128(128);
  f.arr = [["Hello"], ["World"]];
  f.uint8arrays = new Array<Uint8Array>(2);
  f.uint8arrays[0] = base64.decode("aGVsbG8sIHdvcmxkIQ==");
  f.uint8arrays[1] = base64.decode("aGVsbG8sIHdvcmxkIQ==");
  f.u64Arr = [10000000000, 100000000000];
  return f;
}