import {Encoder} from ".";

export class JSON extends Encoder<string>{

  public first:bool = true
  public started:bool = false
  public finished:bool = false
  public partial_encode:string[] = []

  constructor(){ super() }

  start(class_name:string):void{
    assert(!this.started, "Already started")
    this.partial_encode = [`${class_name} {`]
    this.started = true
  }

  end():void{
    assert(this.started, "Please start the encoder")
    assert(!this.finished, "The encoder has finished")
    this.partial_encode.push("}")
    this.finished = true
  }

  get_encoded_object():string{
    if(!this.finished){this.end()}
    return this.partial_encode.join('')
  }

  encode_field<K>(name:string, value:K):void{
    assert(this.started, "Please start the encoder")
    if(!this.first){this.partial_encode.push(", ")}
    this.partial_encode.push(`"${name}":`)
    this.encode<K>(value)
    this.first = false
  }

  encode_string(value:string):void{
    this.partial_encode.push(`"${value}"`)
  }

  encode_number<K extends number>(value:K):void{
    this.partial_encode.push(value.toString())
  }

  encode_array<K>(value:Array<K>):void{
    this.partial_encode.push(`[`)

    for(let i=0; i<value.length; i++){
      this.encode<K>(value[i])
      if(i != value.length-1){ this.partial_encode.push(`,`) }
    }

    this.partial_encode.push(`]`)
  }


    // We override encode_number, for which we don't need these
    encode_u8(value:u8): void{}
    encode_i8(value:i8): void{}
    encode_u16(value:u16): void{}
    encode_i16(value:i16): void{}
    encode_u32(value:u32): void{}
    encode_i32(value:i32): void{}
    encode_u64(value:u64): void{}
    encode_i64(value:i64): void{}
    encode_f32(value:f32): void{}
    encode_f64(value:f64): void{}


}