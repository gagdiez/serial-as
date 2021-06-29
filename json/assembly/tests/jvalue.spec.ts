import { ValueSerializer, ValueDeserializer } from "../obj";
import { u128 } from "as-bignum";
import {
  Numbers,
  init_numbers,
  aString,
  aBoolean,
  Arrays,
  init_arrays,
  ArrayViews,
  MapSet,
  Nullables,
  MixtureOne,
  MixtureTwo,
  Nested,
  Extends,
  MapNullValues,
  BigObj,
  HasConstructorArgs,
} from "@serial-as/tests";
import { initMixtureTwo } from "./utils";

function roundTrip<T>(t:T): void { 
  const encoded = ValueSerializer.encode(t);
  const newT = (new ValueDeserializer(encoded)).decode<T>();
  expect(newT).toStrictEqual(newT);
}

describe("JSONSerializer Serializing Types - Two", () => {
  it("should encode/decode numbers", () => {
    roundTrip<u8>(100)
    roundTrip<u16>(101)
    roundTrip<u32>(102)
    roundTrip<u64>(103)
    roundTrip<i8>(-100)
    roundTrip<i16>(-101)
    roundTrip<i32>(-102)
    roundTrip<i64>(-103)
  });

  it("should encode/decode floats", () => {
    roundTrip<f64>(7.23)
    roundTrip<f64>(10e2)
    roundTrip<f64>(10E2)

    roundTrip<f64>(123456e-5)

    roundTrip<f64>(123456E-5)
    
    roundTrip<f64>(0.0)
    roundTrip<f64>(7.23)
  });

    it("should encode/decode u128", () => {
    let N: u128 = u128.from("100")
    roundTrip(N);
  });

  it("should encode/decode just bools", () => {
    const nums: bool = true;
    roundTrip(nums)
  });

  it("should encode/decode just strings", () => {
    let str: string = '"h"i"';

    roundTrip(str);
  });

  it("should encode/decode just arrays", () => {
    const nums: bool[] = [true, false];

    roundTrip(nums);
  });

  it("should encode/decode just map", () => {
    const map: Map<i32, string> = new Map()
    map.set(1, "hi")

    roundTrip(map);
  });
})

describe("JSONSerializer Serializing Objects", () => {
  it("should encode/decode numbers", () => {
    const nums: Numbers = new Numbers()
    init_numbers(nums)
    roundTrip(nums);
  });

  it("should encode/decode strings", () => {
    const str: aString = { str: "h\"i" }
    roundTrip(str);
  });

  it("should encode/decode booleans", () => {
    const bool: aBoolean = new aBoolean()
    roundTrip(bool);
  });

  it("should encode/decode Arrays", () => {
    const arrays: Arrays = new Arrays()
    init_arrays(arrays)
    roundTrip(arrays);
  });

  it("should encode ArrayViews", () => {
    const arrays: ArrayViews = new ArrayViews()
    roundTrip(arrays);
  });

  it("should encode/decode empty Sets and Maps", () => {
    const map_set: MapSet = new MapSet()
    roundTrip(map_set);
  });

  it("should encode/decode non-empty Sets and Maps", () => {
    const map_set: MapSet = new MapSet()
    map_set.map.set('hi', 1)
    map_set.set.add(256)
    map_set.set.add(4)
    roundTrip(map_set);
  });

  it("should encode nullable", () => {
    const nullables: Nullables = new Nullables()
    roundTrip(nullables);
  });

  it("should encode defined nullable", () => {
    let nullables: Nullables = new Nullables()
    nullables.u32Arr_null = [1]
    roundTrip(nullables);
  });

  it("should encode/decode simple Mixtures", () => {
    const mix: MixtureOne = new MixtureOne()
    roundTrip(mix);
  });

  it("should encode/decode complex Mixtures", () => {
    const mix: MixtureTwo = new MixtureTwo();
    initMixtureTwo(mix);
    roundTrip(mix);
  });

  it("should decode Mixtures with spaces", () => {
    const mix: MixtureTwo = new MixtureTwo();
    initMixtureTwo(mix);
    roundTrip(mix)
  });

  it("should encode/decode nested JSONSerializer", () => {
    const nested: Nested = new Nested();
    initMixtureTwo(nested.f);
    roundTrip(nested);
  });

  it("should encode/decode JSONSerializer with inheritence", () => {
    const ext: Extends = new Extends();
    initMixtureTwo(ext);
    roundTrip(ext);
  });

  it("should encode/decode Maps with null values", () => {
    const map: MapNullValues = new MapNullValues();
    map.inner.set(1, null)
    roundTrip(map);
  });

  it("should encode/decode Maps with non-null values", () => {
    const map: MapNullValues = new MapNullValues();
    map.inner.set(1, "h\"i")
    roundTrip(map);
  });

  it("should handle big objects", () => {
    const bigObj = new BigObj();
    roundTrip(bigObj);
  });

  it("should handle objects with constructors", () => {
    const num: u32 = 42;
    const str = "hello world";
    const obj = new HasConstructorArgs(num, str);
    roundTrip(obj);
  });
});