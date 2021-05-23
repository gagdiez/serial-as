import {Encoder} from ".";

export class JSON extends Encoder<String>{

  merge_encoded(obj_name:string, encodes:Array<string>):string{
    let json:string = obj_name + " {"
    
    for(let i=0; i<encodes.length; i++){
      json += encodes[i]
      if(i!=encodes.length-1) json += ', '
    }

    json += "}"

    return json
  }

  encode_field(name:string, value:string):string{
    return '"' + name + '":' + value
  }

  encode_string(value:string):string{ return '"' + value + '"' }
  encode_i32(value:i32):string{ return value.toString() }
  encode_i64(value:i64):string{ return value.toString() }
  
}