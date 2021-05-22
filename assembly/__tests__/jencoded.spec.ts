import {JSON} from '../json'

@jencoded
class Pair{
  public s1:i32;
  public s2:i32;
}

@jencoded
class Test{
  public number:i32;
  public str:string;
  //public arr:Array<Pair>;
}

describe("JSON Encoder", () => {
  it("should encode json", () => {
    let p1:Pair = {s1:0, s2:1}
    let p2:Pair = {s1:2, s2:3}

    //let test:Test = {str:"testing", number:2, arr:[p1, p2]}
    let test:Test = {str:"testing", number:2}
    let json:String = test.encode()
    //expect(json).toBe("{\"number\":2, \"str\":\"testing\"}")
    expect(json).toBe("{\"number\":2, \"str\":\"testing\"}")
  });
});