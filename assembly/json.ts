import {Property, Encoder} from ".";

export class JSON extends Encoder<String>{

  merge_encoded(encodes:Array<String>):String{
    let json:string = "{"
    
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

  encode_string(name:string, value:string):string{ return this.encode_field(name, '"' + value + '"') }
  encode_i32(name:string, value:i32):string{ return this.encode_field(name, value.toString()) }
  encode_i64(name:string, value:i64):string{ return this.encode_field(name, value.toString()) }
  
}