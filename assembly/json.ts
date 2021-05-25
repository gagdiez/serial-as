import {Encoder} from ".";

export class JSON extends Encoder<String>{

  merge_encoded(obj_name:string, encodes:Array<string>):string{
    let json:string[] = [obj_name , " {"]
    
    for(let i=0; i<encodes.length; i++){
      json.push(encodes[i])
      if(i!=encodes.length-1) json.push(', ')
    }

    json.push("}")

    return json.join()
  }

  encode_field(name:string, value:string):string{
    return `"${name}": ${value}`
  }

  encode_string(value:string):string{ return `"${value}"` }

  encode_i8(value:i8):string{ return value.toString() }
  encode_i16(value:i16):string{ return value.toString() }
  encode_i32(value:i32):string{ return value.toString() }
  encode_i64(value:i64):string{ return value.toString() }
  
  encode_u8(value:u8):string{ return value.toString() }
  encode_u16(value:u16):string{ return value.toString() }
  encode_u32(value:u32):string{ return value.toString() }
  encode_u64(value:u64):string{ return value.toString() }
}