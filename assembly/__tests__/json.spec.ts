import { Encodeable, Property } from '..'
import {JSON} from '../json'

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

describe("JSON Encoder", () => {
  it("should encode json", () => {
    let json:JSON = new JSON()
    let test:Test = new Test(2, "testing")
    
    expect(json.encode(test)).toBe("{\"number\":2, \"str\":\"testing\"}")
  });
});