import {BorshEncoder, BorshDecoder} from '@serial-as/borsh'
import { BigObj, MapSet, MixtureOne, Numbers, aString, aBoolean, Arrays, ArrayViews, Nullables, MixtureTwo, Nested, Extends, MapNullValues } from '.';
import { u128 } from 'as-bignum';

@serializable
export class FooBar {
  foo: i32 = 0;
  bar: u32 = 1;
  u64Val: u64 = 4294967297;
  i64Val: i64 = -64;
  flag: bool;
  baz: string = "";
  uint8array: Uint8Array = new Uint8Array(2);
  arr: Array<Array<string>> = [];
  u32Arr: u32[] = [];
  i32Arr: i32[] = [];
  u128Val: u128 = u128.Zero;
  uint8arrays: Array<Uint8Array> = [];
  u64Arr: u64[] = [];
}

function initMixtureTwo(f: MixtureTwo): void { 
  f.foo = 321;
  f.bar = 123;
  f.flag = true;
  f.baz = "testing"; 
  f.uint8array[0] = 1
  f.uint8array[1] = 2
  f.arr = [["testing"], ["testing"]];
  f.u32Arr = [42, 11]
  f.u128Val = u128.from(128);
  f.uint8arrays = [f.uint8array, f.uint8array]
  f.u64Arr = [10000000000, 100000000000];
}

function u8toArrayBuffer(arr:u8[]):ArrayBuffer{
  // Create expected array buffer
  const buffer:ArrayBuffer = new ArrayBuffer(arr.length)

  for(let i:i32 = 0; i<arr.length; i++){
    store<u8>(changetype<usize>(buffer) + i*sizeof<u8>(), arr[i])
  }
  return buffer
}

function check_encode<T>(object:T, expected:ArrayBuffer):void{
  // Checks that encoding an object returns the expected encoding
  const encoder:BorshEncoder = new BorshEncoder()
  encoder.encode(object)
  let res:ArrayBuffer = encoder.get_encoded_object()

  expect(res).toStrictEqual(expected)
}

function check_decode<T>(encoded:ArrayBuffer, original:T):void{
  // Checks that an encoding returns the expected object
  const decoder:BorshDecoder = new BorshDecoder(encoded)
  let deco:T = decoder.decode<T>()
  expect(deco).toStrictEqual(original)
}


function check_single_number<T = number>(N:T):void{

  let expected:ArrayBuffer = new ArrayBuffer(sizeof<T>())
  store<T>(changetype<usize>(expected), N)

  check_encode<T>(N, expected)
  check_decode<T>(expected, N)
}

describe("BorshEncoder Serializing Types", () => {
  it("should encode/decode single numbers", () => {
    check_single_number<u8>(100)
    check_single_number<u16>(101)
    check_single_number<u32>(102)
    check_single_number<u64>(103)
    check_single_number<i8>(-100)
    check_single_number<i16>(-101)
    check_single_number<i32>(-102)
    check_single_number<i64>(-103)
  });

  it("should encode/decode floats", () => {
    check_single_number<f64>(7.23)
    check_single_number<f64>(10e2)
    check_single_number<f64>(10E2)
  })

  it("should encode/decode floats", () => {
    let num:u128 = u128.from("200")
    let expected:ArrayBuffer = u8toArrayBuffer([200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    check_encode(num, expected)
    check_decode(expected, num)
  })

  it("should encode/decode just bools", () => {
    const nums:bool = true;
    const expected:ArrayBuffer = u8toArrayBuffer([1]);

    check_encode(nums, expected)
    check_decode(expected, nums) 
  });

  it("should encode/decode just arrays", () => {
    const nums:bool[] = [true, false];
    const expected:ArrayBuffer = u8toArrayBuffer([2, 0, 0, 0, 1, 0])

    check_encode(nums, expected)
    check_decode(expected, nums) 
  });
})


describe("Borsh serialize objects", () => {
  it("should encode/decode numbers", () => {
    const nums:Numbers = new Numbers()
    const expected:ArrayBuffer = u8toArrayBuffer([1, 2, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 254, 255, 253, 255, 255, 255, 252, 255, 255, 255, 255, 255, 255, 255, 0, 0, 192, 64, 102, 102, 102, 102, 102, 102, 28, 64])

    check_encode<Numbers>(nums, expected)
    check_decode<Numbers>(expected, nums) 
  });

  it("should encode/decode strings", () => {
    const str:aString = {str:"h\"i"}
    const expected:ArrayBuffer = u8toArrayBuffer([3, 0, 0, 0, 104, 34, 105])
 
    check_encode<aString>(str, expected)
    check_decode<aString>(expected, str)
  });

  it("should encode/decode booleans", () => {
    const bool:aBoolean = new aBoolean()
    const expected:ArrayBuffer = u8toArrayBuffer([1])
 
    check_encode<aBoolean>(bool, expected)
    check_decode<aBoolean>(expected, bool)
  });

  it("should encode Arrays", () => {
    const arrays:Arrays = new Arrays()
    const expected:ArrayBuffer = u8toArrayBuffer([2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 3, 0, 4, 0, 2, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 2, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 255, 254, 2, 0, 0, 0, 253, 255, 252, 255, 2, 0, 0, 0, 251, 255, 255, 255, 250, 255, 255, 255, 2, 0, 0, 0, 249, 255, 255, 255, 255, 255, 255, 255, 248, 255, 255, 255, 255, 255, 255, 255, 2, 0, 0, 0, 0, 0, 128, 63, 0, 0, 0, 64, 2, 0, 0, 0, 205, 204, 204, 204, 204, 204, 8, 64, 205, 204, 204, 204, 204, 204, 16, 64, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0])

    check_encode<Arrays>(arrays, expected)
    check_decode<Arrays>(expected, arrays)
  });

  it("should encode ArrayViews", () => {
    const arrays:ArrayViews = new ArrayViews()

    const expected:ArrayBuffer = u8toArrayBuffer([2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    check_encode<ArrayViews>(arrays, expected)
    check_decode<ArrayViews>(expected, arrays)
  });

  it("should encode/decode empty Sets and Maps", () => {
    const map_set:MapSet = new MapSet()
    const expected:ArrayBuffer = u8toArrayBuffer([0, 0, 0, 0, 0, 0, 0, 0])

    check_encode<MapSet>(map_set, expected)
    check_decode<MapSet>(expected, map_set)
  });

  it("should encode/decode non-empty Sets and Maps", () => {
    const map_set:MapSet = new MapSet()
    map_set.map.set("testing", 0)
    map_set.set.add(0)
    map_set.set.add(1)

    // computed manually
    // map:Map<string, u32> = ('testing', 0) -> sizeof [1, 0, 0, 0] -> 'testing' [7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103] -> 0 = [0, 0, 0, 0] 
    // set:Set<u32> = {0, 1} -> sizeof [2, 0, 0, 0] + [0, 0, 0, 0] + [1, 0, 0, 0]
    const expected:ArrayBuffer = u8toArrayBuffer([1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0])

    check_encode<MapSet>(map_set, expected)
    check_decode<MapSet>(expected, map_set)
  });

  it("should encode nullable", () => {
    const nullables:Nullables = new Nullables()
    const expected:ArrayBuffer = u8toArrayBuffer([0, 0, 0, 0, 0, 0])
    
    check_encode<Nullables>(nullables, expected)
    check_decode<Nullables>(expected, nullables)
  });

  it("should encode/decode simple Mixtures", () => {
    const mix:MixtureOne = new MixtureOne()
    
    // computed manually
    // i32 = 2 -> [2, 0, 0, 0]
    // str = testing -> [7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103]
    // arr = [0,1] -> [2, 0, 0, 0] + [0, 0, 0, 0] + [1, 0, 0, 0]
    // arpa = {[0, 1], [2, 3]} = [2, 0, 0, 0] + [0, 0, 0, 0, 1, 0, 0, 0] + [2, 0, 0, 0, 3, 0, 0, 0]
    // f32 = 0 -> [0, 0, 0, 0]
    const expected:ArrayBuffer = u8toArrayBuffer([2, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0])

    check_encode<MixtureOne>(mix, expected)
    check_decode<MixtureOne>(expected, mix)
  });

   it("should encode/decode complex Mixtures", () => {
    const mix:MixtureTwo = new MixtureTwo();
    initMixtureTwo(mix);

    // computed by hand                                   i32,          u32,                  u64val,                    u64,                                 i64val, B,                                        string,       Uint8Array,
    const expected:ArrayBuffer = u8toArrayBuffer([65, 1, 0, 0, 123, 0, 0 ,0, 1, 0, 0, 0, 1, 0, 0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 255, 255, 255, 255, 255, 255, 255, 1, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 2, 0, 0, 0, 1, 2,
                                                  // Array<Array<string>>
                                                  2, 0, 0, 0, 1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103,
                                                  //                            u32Arr,     i32Arr,                                             u128,
                                                  2, 0, 0, 0, 42, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                                  // Array<Uint8Array>,                                                                                      // u64Arr
                                                  2, 0, 0, 0, 2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 0, 228, 11, 84, 2, 0, 0, 0, 0, 232, 118, 72, 23, 0, 0, 0])

    check_encode<MixtureTwo>(mix, expected)
    check_decode<MixtureTwo>(expected, mix)
  });

  it("should encode/decode nested JSONEncoder", () => {
    const nested:Nested = new Nested();
    initMixtureTwo(nested.f);

    // Same as previous test
    const expected:ArrayBuffer = u8toArrayBuffer([65, 1, 0, 0, 123, 0, 0 ,0, 1, 0, 0, 0, 1, 0, 0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 255, 255, 255, 255, 255, 255, 255, 1, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 2, 0, 0, 0, 42, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 0, 228, 11, 84, 2, 0, 0, 0, 0, 232, 118, 72, 23, 0, 0, 0])

    check_encode<Nested>(nested, expected)
    check_decode<Nested>(expected, nested)
  });

  it("should encode/decode JSONEncoder with inheritence", () => {
    const ext:Extends = new Extends();
    initMixtureTwo(ext);

    // As previous test + [true] -> [1, 0, 0, 0, 1]
    const expected:ArrayBuffer = u8toArrayBuffer([65, 1, 0, 0, 123, 0, 0 ,0, 1, 0, 0, 0, 1, 0, 0 , 0, 0, 0, 0, 0, 0, 0, 0, 0, 192, 255, 255, 255, 255, 255, 255, 255, 1, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 2, 0, 0, 0, 42, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 0, 228, 11, 84, 2, 0, 0, 0, 0, 232, 118, 72, 23, 0, 0, 0, 1, 0, 0, 0, 1])

    check_encode<Extends>(ext, expected)
    check_decode<Extends>(expected, ext)
  });

  it("should encode/decode Maps with null values", () => {
    const map:MapNullValues = new MapNullValues();
    map.inner.set(1, null)

    const expected:ArrayBuffer = u8toArrayBuffer([1, 0, 0, 0, 1, 0, 0, 0, 0])

    check_encode<MapNullValues>(map, expected)
    check_decode<MapNullValues>(expected, map)
  });

  it("should handle big objects", () => {
    const bigObj = new BigObj();
    let expected:u8[] = []

    for(let i:i32=0; i < 16; i++){ expected.push(<u8>255) }
    expected = expected.concat([232, 3, 0, 0])
    for(let i:i32=0; i < 1000; i++){ expected.push(<u8>i*2) }

    let expected_arr:ArrayBuffer = u8toArrayBuffer(expected)

    check_encode<BigObj>(bigObj, expected_arr)
    check_decode<BigObj>(expected_arr, bigObj)
  })

});