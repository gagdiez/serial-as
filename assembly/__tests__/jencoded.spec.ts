import {JSON} from '../json'
import {Encoder} from '../index'
import { u128, base64 } from "near-sdk-as";


@jencoded
class Pair{
  public s1:i32;
  public s2:i32;
}

@jencoded
class Test{
  public number:i32=2;
  public str:string="testing";
  public arr:Array<i32>=[0,1];
  public arpa:Array<Pair>=[{s1:0, s2:1}, {s1:2, s2:3}];
  public f32_zero: f32;
}

@jencoded
export class FooBar {
  foo: i32 = 0;
  bar: u32 = 1;
  u64Val: u64 = 4294967297;
  u64_zero: u64;
  i64Val: i64 = -64;
  f32: f32 = 3.14;
  f64: f64 = 3.141592653589793238462643383279;
  f32_zero: f32;
  f64_zero: f64;
  flag: bool;
  baz: string = "123";
  uint8array: Uint8Array = base64.decode("aGVsbG8sIHdvcmxkIQ==");
  u128:u128 = u128.Zero
  arr: Array<Array<string>> = [["Hello"], ["World"]];
  u32Arr: u32[] = [1, 2];
  i32Arr: i32[] = [1, 2];
  uint8arrays: Array<Uint8Array> = [base64.decode("aGVsbG8sIHdvcmxkIQ=="), base64.decode("aGVsbG8sIHdvcmxkIQ==")];
}

describe("JSON Encoder", () => {
  it("should encode json", () => {
    const encoder:JSON = new JSON()
    const test:FooBar = new FooBar()
    let res:string = test.encode<string>(encoder)

    expect(res)
    .toBe("Test {\"number\":2, \"str\":\"testing\", \"arr\":[0,1]}")
  });
});