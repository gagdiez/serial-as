import {JSONEncoder, JSONDecoder} from '../json'
import {Encoder, Decoder} from ".."
import { Nullables, LargerTest as Test, FooBar, initFooBar, Nested, Extends, MS } from '.';

describe("JSONEncoder Encoder", () => {
  it("should encode empty Sets and Maps", () => {
    const encoder:JSONEncoder = new JSONEncoder()
    const test:MS = new MS()
    let res:string = test.encode<string>(encoder)

    expect(res)
    .toBe('{"map":{},"set":{}}')

    const decoder:JSONDecoder = new JSONDecoder(res)
    let deco:MS = new MS()
    deco.decode<string>(decoder)
    expect(test)
    .toStrictEqual(deco)
  });

  it("should encode non-empty Sets and Maps", () => {
    const encoder:JSONEncoder = new JSONEncoder()
    const test:MS = new MS()
    test.map.set('hi', 1)
    test.set.add(256)
    test.set.add(4)

    let res:string = test.encode<string>(encoder)

    expect(res)
    .toBe('{"map":{"hi":1},"set":{256,4}}')

    const decoder:JSONDecoder = new JSONDecoder(res)
    let deco:MS = new MS()
    deco.decode<string>(decoder)
    expect(test)
    .toStrictEqual(deco)
  });
  
  it("should encode nullable", () => {
    const encoder:JSONEncoder = new JSONEncoder()
    const test:Nullables = new Nullables()
    let res:string = test.encode<string>(encoder)

    expect(res)
    .toBe('{\"u32Arr_null\":null,\"arr_null\":null,\"u64_arr\":null,\"map_null\":null,\"set_null\":null,\"obj_null\":null}')
  });
 
  it("should encode simple JSONEncoder", () => {
    const encoder:JSONEncoder = new JSONEncoder()
    const test:Test = new Test()
    let res:string = test.encode<string>(encoder)

    expect(res)
    .toBe('{\"number\":2,\"str\":\"testing\",\"arr\":[0,1],\"arpa\":[{\"s1\":0,\"s2\":1},{\"s1\":2,\"s2\":3}],\"f32_zero\":0.0}')

    const decoder:JSONDecoder = new JSONDecoder(res)
    let deco:Test = new Test()
    deco.decode<string>(decoder)
    expect(test)
    .toStrictEqual(deco)
  });

  it("should encode complex JSONEncoder", () => {
    const encoder:JSONEncoder = new JSONEncoder()
    const original = new FooBar();
    initFooBar(original);

    let res:string = original.encode<string>(encoder)

    expect(res)
    .toBe('{"foo":321,"bar":123,"u64Val":"4294967297","u64_zero":"0","i64Val":"-64","flag":true,"baz":"foo","uint8array":"aGVsbG8sIHdvcmxkIQ==","arr":[["Hello"],["World"]],"u32Arr":[42,11],"i32Arr":[],"u128Val":"128","uint8arrays":["aGVsbG8sIHdvcmxkIQ==","aGVsbG8sIHdvcmxkIQ=="],"u64Arr":["10000000000","100000000000"]}')

    const decoder:JSONDecoder = new JSONDecoder(res)
    let deco:FooBar = new FooBar()
    deco.decode<string>(decoder)
    expect(original)
    .toStrictEqual(deco)
  });

  it("should encode nested JSONEncoder", () => {
    const encoder:JSONEncoder = new JSONEncoder()
    const original = new Nested();
    initFooBar(original.f);
    let res:string = original.encode<string>(encoder)
    expect(res)
    .toBe('{"f":{"foo":321,"bar":123,"u64Val":"4294967297","u64_zero":"0","i64Val":"-64","flag":true,"baz":"foo","uint8array":"aGVsbG8sIHdvcmxkIQ==","arr":[["Hello"],["World"]],"u32Arr":[42,11],"i32Arr":[],"u128Val":"128","uint8arrays":["aGVsbG8sIHdvcmxkIQ==","aGVsbG8sIHdvcmxkIQ=="],"u64Arr":["10000000000","100000000000"]}}')

    const decoder:JSONDecoder = new JSONDecoder(res)
    let deco:Nested = new Nested()
    deco.decode<string>(decoder)
    expect(original)
    .toStrictEqual(deco)
  });

  it("should encode JSONEncoder with inheritence", () => {
    const encoder:JSONEncoder = new JSONEncoder()
    const original = new Extends();
    initFooBar(original);
    let res:string = original.encode<string>(encoder)
    expect(res)
    .toBe('{"foo":321,"bar":123,"u64Val":"4294967297","u64_zero":"0","i64Val":"-64","flag":true,"baz":"foo","uint8array":"aGVsbG8sIHdvcmxkIQ==","arr":[["Hello"],["World"]],"u32Arr":[42,11],"i32Arr":[],"u128Val":"128","uint8arrays":["aGVsbG8sIHdvcmxkIQ==","aGVsbG8sIHdvcmxkIQ=="],"u64Arr":["10000000000","100000000000"],"x":[true]}')

    const decoder:JSONDecoder = new JSONDecoder(res)
    let deco:Extends = new Extends()
    deco.decode<string>(decoder)
    expect(original)
    .toStrictEqual(deco)
  });
});