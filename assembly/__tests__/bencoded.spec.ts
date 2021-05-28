import {BorshEncoder} from '../borsh'
import {Encoder} from '../index'
import { u128, base64 } from "near-sdk-as";

@serializable
class Pair{
  public s1:i32;
  public s2:i32;
}

@serializable
class Test{
  public number:i32;
  public str:string;
  //public arr:Array<Pair>;
}


describe("Borsh Encoder", () => {
  it("should encode borsh", () => {
    let test:Test = {number:2, str:"testing"}

    // borsh
    // 2 -> [2, 0, 0, 0]
    // "testing" 
    //  -> sizeof utf8_encoded as u32+ utf8_encoded as u8[]
    //  -> [7, 0, 0, 0] + [116, 101, 115, 116, 105, 110, 103] utf8 as u8
    
    let expected:u8[] = [2, 0, 0, 0, 7, 0, 0, 0, 116, 101, 115, 116, 105, 110, 103]

    // Create expected array buffer
    let expected_buffer:ArrayBuffer = new ArrayBuffer(expected.length)

    for(let i:i32 = 0; i<expected.length; i++){
      store<u8>(changetype<usize>(expected_buffer) + i*sizeof<u8>(), expected[i])
    }

    const encoder = new BorshEncoder()
    let res:ArrayBuffer = test.encode<ArrayBuffer>(encoder)
    expect(res).toStrictEqual(expected_buffer)
  });
});