export class Value{
  public fields: Map<string, Value> | null
  public value: ArrayBuffer

  constructor(value: ArrayBuffer = new ArrayBuffer(0), map: Map<string, Value> | null = null){
    this.value = value
    this.fields = map
  }

  has(field:string): bool{
    if(this.fields == null){ return false }
    return this.fields.has(field)
  }

  get(field:string): ArrayBuffer{
    return this.fields.get(field).value
  }
}

export class MsgParser{

  public msgbuffer: ArrayBuffer = new ArrayBuffer(0)
 
  constructor(msgbuffer: ArrayBuffer){
    this.msgbuffer = msgbuffer
  }

  static parse(str: ArrayBuffer): Value{
    const parser = new MsgParser(str)
    return parser.parse_value()
  }

  parse_value(): Value {
    let ret: Value = new Value()

    // Parse msgbuffer and return a Value
    return ret
  }
}