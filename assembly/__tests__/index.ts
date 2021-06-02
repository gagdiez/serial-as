import { u128 } from "as-bignum";
import * as base64 from "as-base64";
import { Encoder, Decoder } from "..";

@serializable
export class Pair {
  public s1: i32;
  public s2: i32;
}

@serializable
export class Test {
  public number: i32;
  public str: string = "";
  public arr: Array<Pair> = [];
}

@serializable
export class LargerTest {
  public number: i32 = 2;
  public str: string = "testing";
  public arr: Array<i32> = [0, 1];
  public arpa: Array<Pair> = [
    { s1: 0, s2: 1 },
    { s1: 2, s2: 3 },
  ];
  public f32_zero: f32;
}

@serializable
export class FooBar {
  foo: i32 = 0;
  bar: u32 = 1;
  u64Val: u64 = 4294967297;
  u64_zero: u64;
  i64Val: i64 = -64;
  flag: bool;
  baz: string = "";
  uint8array: Uint8Array = new Uint8Array(0);
  arr: Array<Array<string>> = [];
  u32Arr: u32[] = [];
  i32Arr: i32[] = [];
  u128Val: u128 = u128.from("128");
  uint8arrays: Array<Uint8Array> = [];
  // TODO: Fix u64 array
  u64Arr: u64[] = [];
}

@serializable
export class Nested {
  f: FooBar = new FooBar();
}

@serializable
export class Nullables {
  u32Arr_null: u32[] | null;
  arr_null: string[] | null;
  u64_arr: Array<u64> | null;
  map_null: Map<string, string> | null;
  set_null: Set<string> | null;
  obj_null: Nested | null;
}

@serializable
export class Extends extends FooBar {
  x: bool[] = [1];
}

@serializable
export class MS {
  public map: Map<string, u32> = new Map<string, u32>();
  public set: Set<u32> = new Set<u32>();
}

export function initFooBar(f: FooBar): FooBar {
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

@serializable
export class WeirdMap {
  inner: Map<i32, string | null> = new Map();

  add(i: i32): void {
    this.inner.set(i, null);
  }
}
