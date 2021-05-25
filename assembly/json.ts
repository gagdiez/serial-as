import {Encoder} from ".";

export class JSON extends Encoder<string[], string>{

  public first:bool = true
  public started:bool = false
  public finished:bool = false

  constructor(){ super([]) }

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

  encode_field(name:string, value:string):void{
    assert(this.started, "Please start the encoder")
    if(!this.first){this.partial_encode.push(", ")}
    this.partial_encode.push(`"${name}":${value}`)
    this.first = false
  }

  encode_string(name:string, value:string):void{
    this.encode_field(name, `"${value}"`)
  }

  encode_number<K extends number>(name:string, value:K):void{
    this.encode_field(name, value.toString())
  }
}