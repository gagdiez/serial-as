import { Deserializer, allocObj, WRAP, defaultValue } from "@serial-as/core/assembly";
import { u128, u128Safe } from "as-bignum/assembly";
import * as base64 from "as-base64/assembly";
import { JSON } from "assemblyscript-json/assembly";

export class ValueDeserializer extends Deserializer<JSON.Value>{
  valStack: JSON.Value[] = [];

  constructor(val: JSON.Value) {
    super(val);
    this.pushVal(val);
  }

  pushVal(obj: JSON.Value): void { 
    this.valStack.push(obj);
  }

  popVal(): JSON.Value {
    return this.valStack.pop();
  }

  get currentVal(): JSON.Value {
    return this.valStack[this.valStack.length - 1];
  }

  get currentObj(): JSON.Obj {
    assert(this.currentVal.isObj, `Expected JSON.Obj but found ${this.currentVal.stringify()}`);
    return <JSON.Obj> this.currentVal;
  }

  get currentArr(): JSON.Arr {
    assert(this.currentVal.isArr, `Expected JSON.Arr but found ${this.currentVal.stringify()}`);
    return (<JSON.Arr>this.currentVal);
  }

  decode_field<T>(name: string): T {
    // "name":value,
    const obj = this.currentObj;
    if (!obj.has(name)) { return defaultValue<T>(); }
    this.pushVal(obj.get(name)!);
    const res = this.decode<T>();
    this.popVal();
    return res;
  }

  // Bool --
  decode_bool(): bool {
    assert(this.currentVal.isBool, `Expected JSON.Bool but found ${this.currentVal.stringify()}`);
    return (<JSON.Bool>this.currentVal).valueOf();
  }

  // String --
  decode_string(): string {
    assert(this.currentVal.isString, `Expected JSON.Str but found ${this.currentVal.stringify()}`);
    return (<JSON.Str>this.currentVal).valueOf();
  }

  // Array --
  decode_array<A extends ArrayLike<any>>(): A {
    const arr = this.currentArr.valueOf();
    let ret:A = instantiate<A>(arr.length);
    for(let i:i32 = 0; i < arr.length; i++){
      this.pushVal(arr[i]);
      // @ts-ignore
      ret[i] = this.decode<valueof<A>>();
      this.popVal();
    }
    return ret
  }

  decode_array_to_type<A>(): A {
    // @ts-ignore
    let decoded:Array<valueof<A>> = this.decode_array<Array<valueof<A>>>()

    let ret:A = instantiate<A>(decoded.length)

    for(let i:i32 = 0; i < decoded.length; i++){
      // @ts-ignore
      ret[i] = decoded[i]
    }

    return ret
  }

  decode_arraybuffer_view<A extends ArrayBufferView>(): A {
    let ret:A

    // @ts-ignore
    if (ret instanceof Uint8Array) {
      let u8arr = this.decode_string();
      return changetype<A>(base64.decode(u8arr))
    }
    // @ts-ignore
    return WRAP<A, valueof<A>>(this.decode_arraybuffer_view<Uint8Array>().buffer);
  }

  decode_static_array<T>():StaticArray<T>{
    return this.decode_array_to_type<StaticArray<T>>()
  }

  decode_arraybuffer(): ArrayBuffer{
    return this.decode_arraybuffer_view<Uint8Array>().buffer
  }

  // Null --
  decode_nullable<T>(): T | null {
    if (this.currentVal.isNull) {
      return null
    }
    return this.decode<NonNullable<T>>()
  }

  // Set --
  decode_set<T>(): Set<T> {
    const arr = this.decode_array<T[]>();
    const ret_set = new Set<T>();
    for (let i = 0; i < arr.length; i++) {
      ret_set.add(arr[i]);
    }
    return ret_set
  }

  // Map --
  decode_map<K, V>(): Map<K, V> {
    const obj = this.currentObj;
    const keys = obj.keys;
    const ret_map = new Map<K, V>();
    for (let i = 0; i < keys.length; i++) {
      const name = keys[i];
      const encodedName = isString<K>() ? `"${name}"` : name;
      const key = ValueDeserializer.decode<K>(encodedName);
      const val = obj.get(name) as JSON.Value;
      this.pushVal(val);
      // @ts-ignore
      ret_map.set(key, this.decode<V>());
      this.popVal();
    }
    
    return ret_map
  }

  // Object --
  decode_object<C extends object>(): C {
    let object: C;
    object = allocObj<C>();
    if (object instanceof u128 || object instanceof u128Safe) {
      const obj = u128.from(this.decode_string());
      object.lo = obj.lo;
      object.hi = obj.hi;
    } else {
      object.decode(this);
    }
    return object;
  }

  decode_int<T extends number>(): T {
    assert(this.currentVal.isInteger, `Expected JSON.Integer but found ${this.currentVal.stringify()}`);
    return <T>(<JSON.Integer>this.currentVal).valueOf();
  }

  decode_long<T extends number>(): T {
    let num: string = this.decode<string>()
    return <T>(isSigned<T>() ? I64.parseInt(num) : U64.parseInt(num));
  }

  decode_float<T extends number>(): T {
    assert(
      this.currentVal.isFloat || this.currentVal.isInteger,
      `Expected JSON.Float || JSON.Integer but found ${this.currentVal.stringify()}`,
    );

    if (this.currentVal.isFloat) {
      return <T>(<JSON.Float>this.currentVal).valueOf();
    }
    return <T>(<JSON.Integer>this.currentVal).valueOf();
  }


  // We override decode_number, for which we don't need these
  decode_u8(): u8 {   return this.decode_int<u8>() }
  decode_i8(): i8 {   return this.decode_int<i8>() }
  decode_u16(): u16 { return this.decode_int<u16>() }
  decode_i16(): i16 { return this.decode_int<i16>() }
  decode_u32(): u32 { return this.decode_int<u32>() }
  decode_i32(): i32 { return this.decode_int<i32>() }
  decode_u64(): u64 { return this.decode_long<u64>() }
  decode_i64(): i64 { return this.decode_long<i64>() }
  decode_f32(): f32 { return this.decode_float<f32>() }
  decode_f64(): f64 { return this.decode_float<f64>() }

  /**
   * 
   * @param s string or JSON.Value
   * @returns T
   */
  static decode<T, From = string>(s: From): T {
    let val: JSON.Value = JSON.Value.Null();
    if (s instanceof JSON.Value) {
      val = s;
    } else if (isString<From>()) {
      val = JSON.parse(s);
    } else {
      ERROR("ValueDeserializer can only decode `string` and `JSON` Values.")
    }

    const decoder = new ValueDeserializer(val);
    return decoder.decode<T>();
  }
}