export class Property{
  constructor(public name:string, public type:string){};
}

export abstract class Encodeable{
  constructor(){}
  
  public properties_i32:Map<string, i32> = new Map<string, i32>()
  public properties_i64:Map<string, i64> = new Map<string, i64>()
  public properties_str:Map<string, string> = new Map<string, string>()
 
  get_i32(prop:string):i32{ return this.properties_i32.get(prop) }
  get_i64(prop:string):i64{ return this.properties_i64.get(prop) }
  get_string(prop:string):string{ return this.properties_str.get(prop) }
  
  abstract getOwnProperties():Array<Property>
}

export abstract class Encoder<T>{
  constructor(){}

  //abstract encode_u8(value:u8):T
  //abstract encode_i8(value:i8):T
  //abstract encode_u16(value:u16):T
  //abstract encode_i16(value:i16):T
  //abstract encode_u32(value:u32):T
  abstract encode_i32(name:string, value:i32):T
  //abstract encode_u64(value:u64):T
  abstract encode_i64(name:string, value:i64):T
  //abstract encode_u128(value:u128):T
  abstract encode_string(name:string, value:String):T
  //abstract encode_array(name:string, value:Array<T>):T

  abstract merge_encoded(array:Array<T>):T

  encode(object:Encodeable):T{
    let properties:Array<Property> = object.getOwnProperties()
    let encoded:Array<T> = []

    for(let i=0; i<properties.length; i++){

      const prop:Property = properties[i]

      if(prop.type == 'i32'){ 
        let prop_value:i32 = object.get_i32(prop.name)
        encoded.push(this.encode_i32(prop.name, prop_value))
      }      

      if(prop.type == 'i64'){ 
        let prop_value:i64 = object.get_i64(prop.name)
        encoded.push(this.encode_i64(prop.name, prop_value))
      }

      if(prop.type == 'string'){ 
        let prop_value:string = object.get_string(prop.name)
        encoded.push(this.encode_string(prop.name, prop_value))
      }
    
    }

    return this.merge_encoded(encoded)
  }
}