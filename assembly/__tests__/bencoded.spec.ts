import {BorshEncoder, BorshDecoder} from '../borsh'
import {Encoder, Decoder} from '../index'
import { u128, base64 } from "near-sdk-as";

@serializable
class Pair{
  public s1:i32;
  public s2:i32;
}

@serializable
class Test{
  public number:i32;
  public str:string = "";
  public arr:Array<Pair> = [];
}

@serializable
class MS{
  public map:Map<string, u32> = new Map<string, u32>();
  public set:Set<u32> = new Set<u32>();
}

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
  //u128Val: u128 = u128.from("100000000000");
  uint8arrays: Array<Uint8Array> = [];
  u64Arr: u64[] = [];
}  

function initFooBar(f: FooBar): void { 
  f.foo = 321;
  f.bar = 123;
  f.flag = true;
  f.baz = "testing"; 
  f.uint8array[0] = 1
  f.uint8array[1] = 2
  //f.u128Val = u128.from(128); -> 4 bytes???
  f.arr = [["testing"], ["testing"]];
  f.u32Arr = [42, 11]
  f.uint8arrays = [f.uint8array, f.uint8array]
  f.u64Arr = [10000000000, 100000000000];
}

describe("Borsh Encoder", () => {
  it("should encode simple borsh", () => {
    const p1:Pair = {s1:0, s2:1}
    const p2:Pair = {s1:2, s2:3}
    let test:Test = {number:256, str:"testing", arr:[p1, p2]}

    // borsh
    // number:i32 = 256 -> [0, 1, 0, 0]
    // str:string = "testing" 
    //  -> sizeof utf8_encoded as u32 = [7, 0, 0, 0]
    //  -> encoded as utf8 in a u8[] = [116, 101, 115, 116, 105, 110, 103]
    // arr:Array<Pair> = [p1, p2]
    //  -> sizeof [p1, p2] as u32  = [2, 0, 0, 0]
    //  -> p1:Pair = {0, 1} -> [0, 0, 0, 0] + [1, 0, 0, 0]
    //  -> p2:Pair = {2, 3} -> [2, 0, 0, 0] + [3, 0, 0, 0]
    
    let expected:u8[] = [0, 1, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103,
                         2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0]

    // Create expected array buffer
    let expected_buffer:ArrayBuffer = new ArrayBuffer(expected.length)

    for(let i:i32 = 0; i<expected.length; i++){
      store<u8>(changetype<usize>(expected_buffer) + i*sizeof<u8>(), expected[i])
    }

    const encoder = new BorshEncoder()
    let res:ArrayBuffer = test.encode<ArrayBuffer>(encoder)
    expect(res).toStrictEqual(expected_buffer)

    const decoder = new BorshDecoder(res)
    let decoded_test:Test = new Test()
    decoded_test.decode<ArrayBuffer>(decoder)

    expect(decoded_test).toStrictEqual(test)
  });

  it("should encode maps and sets", () => {
    let test:MS = new MS()
    test.map.set("testing", 0)
    
    test.set.add(0)
    test.set.add(1)

    // borsh
    // map:Map<string, u32> = ('testing', 0)
    // -> sizeof [1, 0, 0, 0]
    // -> 'testing' [7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103]
    // -> 0 = [0, 0, 0, 0] 
    // set:Set<u32> = {0, 1}
    // -> sizeof [2, 0, 0, 0] + [0, 0, 0, 0] + [1, 0, 0, 0]
    
    let expected:u8[] = [1, 0, 0, 0,
                         7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103, 0, 0, 0, 0,
                         2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]

    // Create expected array buffer
    let expected_buffer:ArrayBuffer = new ArrayBuffer(expected.length)

    for(let i:i32 = 0; i<expected.length; i++){
      store<u8>(changetype<usize>(expected_buffer) + i*sizeof<u8>(), expected[i])
    }

    const encoder = new BorshEncoder()
    let res:ArrayBuffer = test.encode<ArrayBuffer>(encoder)
    expect(res).toStrictEqual(expected_buffer)

    const decoder = new BorshDecoder(res)
    let decoded_test:MS = new MS()
    decoded_test.decode<ArrayBuffer>(decoder)

    expect(decoded_test).toStrictEqual(test)
  });

  it("should encode complex borsh", () => {
    const encoder:BorshEncoder = new BorshEncoder()
    const original = new FooBar();
    initFooBar(original);

    let res:ArrayBuffer = original.encode<ArrayBuffer>(encoder)

    /* borsh
        foo: i32 = 321 -> [65, 1, 0, 0];
        bar: u32 = 123 -> [123, 0, 0 ,0];
        u64Val: u64 = 4294967297 -> [1, 0, 0, 0, 1, 0, 0 ,0];
        i64Val: i64 = -64 -> [192, 255, 255, 255, 255, 255, 255, 255];
        flag: bool = true -> [1];
        baz: string = "testing" -> [7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103];
        uint8array: Uint8Array = [1, 2] -> [2, 0, 0, 0, 1, 2];
        arr: Array<Array<string>> = [["testing"], ["testing"]];
         -> [2, 0, 0, 0]
         -> [1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103] x2
        u32Arr: u32[] = [42, 11] -> [2, 0, 0, 0, 42, 0, 0, 0, 11, 0, 0, 0]
        i32Arr: i32[] = [] -> [0, 0, 0, 0];
        u128Val: u128 = 128 -> ;[128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        uint8arrays: Array<Uint8Array> = [[1, 2], [1, 2]]
         -> [2, 0, 0, 0]
         -> [2, 0, 0, 0, 1, 2] x2
        u64Arr: u64[] = [10000000000, 100000000000]
          -> [2, 0, 0, 0]
          -> [0, 228, 11, 84, 2, 0, 0, 0]
          -> [0, 232, 118, 72, 23, 0, 0, 0]
          */
    
                  //             i32,          u32,                 u64val
    let expected:u8[] = [65, 1, 0, 0, 123, 0, 0 ,0, 1, 0, 0, 0, 1, 0, 0 , 0,
                         // i64val
                         192, 255, 255, 255, 255, 255, 255, 255,
                   // bool,                                        string 
                         1, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103,
                         // Uint8Array,
                         2, 0, 0, 0, 1, 2,
                         // Array<Array<string>>
                         2, 0, 0, 0, 
                         1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103,
                         1, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103,
                         //                            u32Arr,     i32Arr
                         2, 0, 0, 0, 42, 0, 0, 0, 11, 0, 0, 0, 0, 0, 0, 0,
                         // u128
                         //128, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                         // Array<Uint8Array>
                         2, 0, 0, 0, 2, 0, 0, 0, 1, 2, 2, 0, 0, 0, 1, 2,
                         // u64Arr
                         2, 0, 0, 0, 0, 228, 11, 84, 2, 0, 0, 0, 0, 232, 118, 72, 23, 0, 0, 0
                        ]

    // Create expected array buffer
    let expected_buffer:ArrayBuffer = new ArrayBuffer(expected.length)

    for(let i:i32 = 0; i<expected.length; i++){
      store<u8>(changetype<usize>(expected_buffer) + i*sizeof<u8>(), expected[i])
    }

    expect(res).toStrictEqual(expected_buffer)

    const decoder = new BorshDecoder(res)
    let decoded_test:FooBar = new FooBar()
    decoded_test.decode<ArrayBuffer>(decoder)

    expect(decoded_test).toStrictEqual(original)
  });
});