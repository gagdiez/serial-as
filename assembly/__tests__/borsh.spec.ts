/* import { Encodeable, Property } from '..'
import {Borsh} from '../borsh'

// @ encodable?
export class Test extends Encodeable{
  constructor(public number:i32, public str:string){
    super();
    this.properties_i32.set('number', this.number)
    this.properties_str.set('str', this.str)
  }
  
  getOwnProperties():Array<Property>{
    return [new Property('number', 'i32'),
            new Property('str', 'string')]
  }
}

describe("Borsh Encoder", () => {
  it("should encode borsh", () => {
    let borsh:Borsh = new Borsh()
    let test:Test = new Test(2, "testing")

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

    expect(borsh.encode(test)).toStrictEqual(expected_buffer)
  });
});
 */