import {Property, Encoder} from ".";

export class JSON extends Encoder<String>{
  constructor(){ super("") }

  start():void{ this.encoded = "{"}
  between():void{ this.encoded += ", "}
  end():void{ this.encoded += "}"}

  encode_field(name:string, value:string):void{
    this.encoded +=  '"' + name + '":' + value
  }

  encode_string(name:string, value:string):void{ this.encode_field(name, '"' + value + '"') }
  encode_i32(name:string, value:i32):void{ this.encode_field(name, value.toString()) }
  encode_i64(name:string, value:i64):void{ this.encode_field(name, value.toString()) }
}