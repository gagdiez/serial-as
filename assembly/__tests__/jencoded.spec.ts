import { u128 } from "as-bignum";
import { Encoder, Decoder } from ".."
import * as base64 from "as-base64";
import { JSONEncoder, JSONDecoder } from "../json"

import { Numbers, aString, MapSet, aBoolean, Arrays, ArrayViews, Nullables, MixtureOne, MixtureTwo, Nested, Extends, MapNullValues } from ".";


function check_encode<T>(object: T, expected: string): void {
  // Checks that encoding an object returns the expected encoding
  const encoder: JSONEncoder = new JSONEncoder()
  let res: string = object.encode<string>(encoder)

  expect(res).toBe(expected)
}

function check_decode<T>(encoded: string, original: T): void {
  // Checks that an encoding returns the expected object
  const decoder: JSONDecoder = new JSONDecoder(encoded)
  let deco: T = instantiate<T>()
  deco.decode<string>(decoder)
  expect(deco).toStrictEqual(original)
}

function initMixtureTwo(f: MixtureTwo): MixtureTwo {
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

describe("JSONEncoder Encoder", () => {
  it("should encode/decode numbers", () => {
    const nums: Numbers = new Numbers()
    const expected: string = '{"u8":1,"u16":2,"u32":3,"u64":"4","u128":"5","i8":-1,"i16":-2,"i32":-3,"i64":"-4","f32":6.0,"f64":7.1}'

    check_encode<Numbers>(nums, expected)
    check_decode<Numbers>(expected, nums)
  });

  it("should encode/decode strings", () => {
    const str: aString = { str: "h\"i" }
    const expected: string = '{"str":"h\\"i"}'

    check_encode<aString>(str, expected)
    check_decode<aString>(expected, str)
  });

  it("should encode/decode booleans", () => {
    const bool: aBoolean = new aBoolean()
    const expected: string = '{"bool":true}'

    check_encode<aBoolean>(bool, expected)
    check_decode<aBoolean>(expected, bool)
  });

  it("should encode/decode Arrays", () => {
    const arrays: Arrays = new Arrays()

    const expected: string = '{"u8Arr":[1,2],"u16Arr":[3,4],"u32Arr":[5,6],"u64Arr":["7","8"],"u128Arr":["9","10"],"i8Arr":[-1,-2],"i16Arr":[-3,-4],"i32Arr":[-5,-6],"i64Arr":["-7","-8"],"f32Arr":[1.0,2.0],"f64Arr":[3.1,4.2],"arrI32":[0,1],"arrArr":[[]],"arrUint8":[],"arrObj":[{"s1":0,"s2":1},{"s1":2,"s2":3}]}'
    check_encode<Arrays>(arrays, expected)
    check_decode<Arrays>(expected, arrays)
  });

  it("should encode ArrayViews", () => {
    const arrays: ArrayViews = new ArrayViews()

    const expected: string = '{"uint8array":"AAA=","uint16array":[0,0],"uint32array":[0,0],"uint64array":["0","0"],"int8array":[0,0],"int16array":[0,0],"int32array":[0,0],"int64array":["0","0"]}'
    check_encode<ArrayViews>(arrays, expected)
    //check_decode<ArrayViews>(expected, arrays)
  });

  it("should encode/decode empty Sets and Maps", () => {
    const map_set: MapSet = new MapSet()
    const expected: string = '{"map":{},"set":{}}'

    check_encode<MapSet>(map_set, expected)
    check_decode<MapSet>(expected, map_set)
  });

  it("should encode/decode non-empty Sets and Maps", () => {
    const map_set: MapSet = new MapSet()
    map_set.map.set('hi', 1)
    map_set.set.add(256)
    map_set.set.add(4)

    const expected: string = '{"map":{"hi":1},"set":{256,4}}'

    check_encode<MapSet>(map_set, expected)
    check_decode<MapSet>(expected, map_set)
  });

  it("should encode nullable", () => {
    const nullables: Nullables = new Nullables()
    const expected: string = '{"u32Arr_null":null,"arr_null":null,"u64_arr":null,"map_null":null,"set_null":null,"obj_null":null}'

    check_encode<Nullables>(nullables, expected)
    //check_decode<Nullables>(expected, nullables)
  });

  it("should encode/decode simple Mixtures", () => {
    const mix: MixtureOne = new MixtureOne()
    const expected: string = '{\"number\":2,\"str\":\"testing\",\"arr\":[0,1],\"arpa\":[{\"s1\":0,\"s2\":1},{\"s1\":2,\"s2\":3}],\"f32_zero\":0.0}'

    check_encode<MixtureOne>(mix, expected)
    check_decode<MixtureOne>(expected, mix)
  });

  it("should encode/decode complex Mixtures", () => {
    const mix: MixtureTwo = new MixtureTwo();
    initMixtureTwo(mix);

    const expected: string = '{"foo":321,"bar":123,"u64Val":"4294967297","u64_zero":"0","i64Val":"-64","flag":true,"baz":"foo","uint8array":"aGVsbG8sIHdvcmxkIQ==","arr":[["Hello"],["World"]],"u32Arr":[42,11],"i32Arr":[],"u128Val":"128","uint8arrays":["aGVsbG8sIHdvcmxkIQ==","aGVsbG8sIHdvcmxkIQ=="],"u64Arr":["10000000000","100000000000"]}'

    check_encode<MixtureTwo>(mix, expected)
    check_decode<MixtureTwo>(expected, mix)
  });

  it("should encode/decode nested JSONEncoder", () => {
    const nested: Nested = new Nested();
    initMixtureTwo(nested.f);

    const expected: string = '{"f":{"foo":321,"bar":123,"u64Val":"4294967297","u64_zero":"0","i64Val":"-64","flag":true,"baz":"foo","uint8array":"aGVsbG8sIHdvcmxkIQ==","arr":[["Hello"],["World"]],"u32Arr":[42,11],"i32Arr":[],"u128Val":"128","uint8arrays":["aGVsbG8sIHdvcmxkIQ==","aGVsbG8sIHdvcmxkIQ=="],"u64Arr":["10000000000","100000000000"]}}'

    check_encode<Nested>(nested, expected)
    check_decode<Nested>(expected, nested)
  });

  it("should encode/decode JSONEncoder with inheritence", () => {
    const ext: Extends = new Extends();
    initMixtureTwo(ext);

    const expected: string = '{"foo":321,"bar":123,"u64Val":"4294967297","u64_zero":"0","i64Val":"-64","flag":true,"baz":"foo","uint8array":"aGVsbG8sIHdvcmxkIQ==","arr":[["Hello"],["World"]],"u32Arr":[42,11],"i32Arr":[],"u128Val":"128","uint8arrays":["aGVsbG8sIHdvcmxkIQ==","aGVsbG8sIHdvcmxkIQ=="],"u64Arr":["10000000000","100000000000"],"x":[true]}'

    check_encode<Extends>(ext, expected)
    check_decode<Extends>(expected, ext)
  });

  it("should encode/decode Maps with null values", () => {
    const map: MapNullValues = new MapNullValues();
    map.inner.set(1, null)

    const expected: string = '{"inner":{1:null}}'

    check_encode<MapNullValues>(map, expected)
    //check_decode<MapNullValues>(expected, map)
  });
});