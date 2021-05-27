import {JSON} from '../json'
import {Encoder} from '../index'
import { u128, base64 } from "near-sdk-as";


@encodable
class Pair{
  public s1:i32;
  public s2:i32;
}

@encodable
class Test{
  public number:i32=2;
  public str:string="testing";
  public arr:Array<i32>=[0,1];
  public arpa:Array<Pair>=[{s1:0, s2:1}, {s1:2, s2:3}];
  public f32_zero: f32;
}

@encodable
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

@encodable
export class Nullables {
  u32Arr_null: u32[] | null;
  arr_null: Array<string> | null;
  map_null: Map<string, string> | null;
  set_null: Set<string> | null;
}


describe("JSON Encoder", () => {
  it("should encode nullable", () => {
    const encoder:JSON = new JSON()
    const test:Nullables = new Nullables()
    let res:string = test.encode<string>(encoder)

    expect(res)
    .toBe('{\"u32Arr_null\":null,\"arr_null\":null,\"map_null\":null,\"set_null\":null}')
  });

  it("should encode simple json", () => {
    const encoder:JSON = new JSON()
    const test:Test = new Test()
    let res:string = test.encode<string>(encoder)

    expect(res)
    .toBe('{\"number\":2,\"str\":\"testing\",\"arr\":[0,1],\"arpa\":[{\"s1\":0,\"s2\":1},{\"s1\":2,\"s2\":3}],\"f32_zero\":0.0}')
  });

  it("should encode complex json", () => {
    const encoder:JSON = new JSON()
    const original = new FooBar();
    original.u32Arr = [42, 11];
    original.foo = 321;
    original.bar = 123;
    original.flag = true;
    original.baz = "foo";
    original.uint8array = base64.decode("aGVsbG8sIHdvcmxkIQ==");
    original.u128Val = new u128(128);
    original.arr = [["Hello"], ["World"]];
    original.uint8arrays = new Array<Uint8Array>(2);
    original.uint8arrays[0] = base64.decode("aGVsbG8sIHdvcmxkIQ==");
    original.uint8arrays[1] = base64.decode("aGVsbG8sIHdvcmxkIQ==");
    original.u64Arr = [10000000000, 100000000000];

    let res:string = original.encode<string>(encoder)

    expect(res)
    .toBe('{"foo":321,"bar":123,"u64Val":"4294967297","u64_zero":"0","i64Val":"-64","flag":true,"baz":"foo","uint8array":"aGVsbG8sIHdvcmxkIQ==","arr":[["Hello"],["World"]],"u32Arr":[42,11],"i32Arr":[],"u128Val":"128","uint8arrays":["aGVsbG8sIHdvcmxkIQ==","aGVsbG8sIHdvcmxkIQ=="],"u64Arr":["10000000000","100000000000"]}')
  });
});