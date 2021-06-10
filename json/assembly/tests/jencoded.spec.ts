import { u128 } from "as-bignum";
import * as base64 from "as-base64";
import { JSON } from '@serial-as/json'
import {
  Numbers,
  init_numbers,
  aString,
  MapSet,
  aBoolean,
  Arrays,
  ArrayViews,
  Nullables,
  MixtureOne,
  MixtureTwo,
  Nested,
  Extends,
  MapNullValues,
  BigObj,
  init_arrays,
} from "@serial-as/tests";

function check_encode<T>(object: T, expected: string): void {
  // Checks that encoding an object returns the expected encoding
  let res: string = JSON.encode(object);

  expect(res).toBe(expected)
}

function check_decode<T>(encoded: string, original: T): void {
  // Checks that an encoding returns the expected object
  let deco: T = JSON.decode<T>(encoded);
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



function check_single_number<T extends number>(N: T): void {

  let expected: string = N.toString();

  // @ts-ignore
  if (N instanceof u64 || N instanceof i64) {
    expected = `"${expected}"`
  }

  check_encode<T>(N, expected)
  check_decode<T>(expected, N)
}

describe("JSONSerializer Serializing Types", () => {
  it("should encode/decode numbers", () => {
    check_single_number<u8>(100)
    check_single_number<u16>(101)
    check_single_number<u32>(102)
    check_single_number<u64>(103)
    check_single_number<i8>(-100)
    check_single_number<i16>(-101)
    check_single_number<i32>(-102)
    check_single_number<i64>(-103)

    check_decode<u8>(" 123 ", 123)
  });

  it("should encode/decode floats", () => {
    check_single_number<f64>(7.23)
    check_single_number<f64>(10e2)
    check_single_number<f64>(10E2)
    check_decode<f64>(" 7.23 ", 7.23)
  })

  it("should encode/decode u128", () => {
    let N: u128 = u128.from("100")
    let expected: string = '"100"'
    check_encode(N, expected)
    check_decode(expected, N)
  });

  it("should encode/decode just bools", () => {
    const nums: bool = true;
    const expected: string = 'true';

    check_encode(nums, expected)
    check_decode(expected, nums)
  });

  it("should encode/decode just strings", () => {
    const str: string = 'h\"i';
    const expected: string = '"h\\"i"';

    check_encode(str, expected)
    check_decode(expected, str)
  });

  it("should encode/decode just arrays", () => {
    const nums: bool[] = [true, false];
    const expected: string = '[true,false]'

    check_encode(nums, expected)
    check_decode(expected, nums)
  });

  it("should encode/decode just map", () => {
    const map: Map<i32, string> = new Map()
    map.set(1, "hi")

    const expected: string = '{1:"hi"}'

    check_encode(map, expected)
    check_decode(expected, map)
  });

  it("should handle spaces", () => {
    const nums: bool[] = [true, false];
    const arr_encoded: string = ' [ true , false ] '

    check_decode(arr_encoded, nums)

    const map_encoded: string = ' { 1 : "hel\\"lo" } '

    let map: Map<i32, string> = new Map()
    map.set(1, 'hel\"lo')

    check_decode(map_encoded, map)
  });

})

describe("JSONSerializer Serializing Objects", () => {
  it("should encode/decode numbers", () => {
    const nums: Numbers = new Numbers()
    init_numbers(nums)
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
    init_arrays(arrays)

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
    check_decode<Nullables>(expected, nullables)
  });

  it("should encode defined nullable", () => {
    let nullables: Nullables = new Nullables()
    nullables.u32Arr_null = [1]
    const expected: string = '{"u32Arr_null":[1],"arr_null":null,"u64_arr":null,"map_null":null,"set_null":null,"obj_null":null}'

    check_encode<Nullables>(nullables, expected)
    check_decode<Nullables>(expected, nullables)
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

  it("should decode Mixtures with spaces", () => {
    const mix: MixtureTwo = new MixtureTwo();
    initMixtureTwo(mix);

    const encoded_spaces: string = '{ "foo": 321, "bar":123, "u64Val" : "4294967297","u64_zero":     "0","i64Val": "-64", "flag":    true , "baz":"foo","uint8array":"aGVsbG8sIHdvcmxkIQ==","arr":[["Hello"],["World"]],"u32Arr":[42,11],"i32Arr":[],"u128Val":"128","uint8arrays":["aGVsbG8sIHdvcmxkIQ==","aGVsbG8sIHdvcmxkIQ=="],"u64Arr":["10000000000","100000000000"]}'

    check_decode<MixtureTwo>(encoded_spaces, mix)
  });

  it("should encode/decode nested JSONSerializer", () => {
    const nested: Nested = new Nested();
    initMixtureTwo(nested.f);

    const expected: string = '{"f":{"foo":321,"bar":123,"u64Val":"4294967297","u64_zero":"0","i64Val":"-64","flag":true,"baz":"foo","uint8array":"aGVsbG8sIHdvcmxkIQ==","arr":[["Hello"],["World"]],"u32Arr":[42,11],"i32Arr":[],"u128Val":"128","uint8arrays":["aGVsbG8sIHdvcmxkIQ==","aGVsbG8sIHdvcmxkIQ=="],"u64Arr":["10000000000","100000000000"]}}'

    check_encode<Nested>(nested, expected)
    check_decode<Nested>(expected, nested)
  });

  it("should encode/decode JSONSerializer with inheritence", () => {
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
    check_decode<MapNullValues>(expected, map)
  });


  it("should handle big objects", () => {
    const bigObj = new BigObj();

    // computed using rust
    let expected: string = '{"big_num":"340282366920938463463374607431768211455","typed_arr":"AAIEBggKDA4QEhQWGBocHiAiJCYoKiwuMDI0Njg6PD5AQkRGSEpMTlBSVFZYWlxeYGJkZmhqbG5wcnR2eHp8foCChIaIioyOkJKUlpianJ6goqSmqKqsrrCytLa4ury+wMLExsjKzM7Q0tTW2Nrc3uDi5Obo6uzu8PL09vj6/P4AAgQGCAoMDhASFBYYGhweICIkJigqLC4wMjQ2ODo8PkBCREZISkxOUFJUVlhaXF5gYmRmaGpsbnBydHZ4enx+gIKEhoiKjI6QkpSWmJqcnqCipKaoqqyusLK0tri6vL7AwsTGyMrMztDS1NbY2tze4OLk5ujq7O7w8vT2+Pr8/gACBAYICgwOEBIUFhgaHB4gIiQmKCosLjAyNDY4Ojw+QEJERkhKTE5QUlRWWFpcXmBiZGZoamxucHJ0dnh6fH6AgoSGiIqMjpCSlJaYmpyeoKKkpqiqrK6wsrS2uLq8vsDCxMbIyszO0NLU1tja3N7g4uTm6Ors7vDy9Pb4+vz+AAIEBggKDA4QEhQWGBocHiAiJCYoKiwuMDI0Njg6PD5AQkRGSEpMTlBSVFZYWlxeYGJkZmhqbG5wcnR2eHp8foCChIaIioyOkJKUlpianJ6goqSmqKqsrrCytLa4ury+wMLExsjKzM7Q0tTW2Nrc3uDi5Obo6uzu8PL09vj6/P4AAgQGCAoMDhASFBYYGhweICIkJigqLC4wMjQ2ODo8PkBCREZISkxOUFJUVlhaXF5gYmRmaGpsbnBydHZ4enx+gIKEhoiKjI6QkpSWmJqcnqCipKaoqqyusLK0tri6vL7AwsTGyMrMztDS1NbY2tze4OLk5ujq7O7w8vT2+Pr8/gACBAYICgwOEBIUFhgaHB4gIiQmKCosLjAyNDY4Ojw+QEJERkhKTE5QUlRWWFpcXmBiZGZoamxucHJ0dnh6fH6AgoSGiIqMjpCSlJaYmpyeoKKkpqiqrK6wsrS2uLq8vsDCxMbIyszO0NLU1tja3N7g4uTm6Ors7vDy9Pb4+vz+AAIEBggKDA4QEhQWGBocHiAiJCYoKiwuMDI0Njg6PD5AQkRGSEpMTlBSVFZYWlxeYGJkZmhqbG5wcnR2eHp8foCChIaIioyOkJKUlpianJ6goqSmqKqsrrCytLa4ury+wMLExsjKzM7Q0tTW2Nrc3uDi5Obo6uzu8PL09vj6/P4AAgQGCAoMDhASFBYYGhweICIkJigqLC4wMjQ2ODo8PkBCREZISkxOUFJUVlhaXF5gYmRmaGpsbnBydHZ4enx+gIKEhoiKjI6QkpSWmJqcnqCipKaoqqyusLK0tri6vL7AwsTGyMrMzg=="}'

    check_encode<BigObj>(bigObj, expected)
    check_decode<BigObj>(expected, bigObj)
  })
});