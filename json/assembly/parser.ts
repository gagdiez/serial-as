// TODO: 
// - raise errors for Maps with non-key strings
// - add more error messages in parser.ts

export class Value{
  public fields: Map<string, Value> | null
  public value: string
  public array: Array<Value> | null

  constructor(val: string = "", map: Map<string, Value> | null = null,
              array: Array<Value> | null = null
  ){
    this.value = val
    this.fields = map
    this.array = array
  }

  has(field:string):bool{
    if(this.fields == null){ return false }
    return this.fields.has(field)
  }

  get(field:string):string{
    return this.fields.get(field).value
  }

  toString(): string{
    
    if(this.fields != null){
      const m: Map<string, Value> = <Map<string, Value>> this.fields
      const keys = m.keys()
      let print:string = ""
      for(let i=0; i<keys.length; i++){
        const key = keys[i]
        const val = m.get(key).toString()
        print = print + `${key} -> ${val}`
        if(i != keys.length -1 ){ print += ','}
      }
      return `{${print}}`
    }
    return this.value
  }
}

const WS1 = " "
const WS2 = '\u0020'
const WS3 = '\u000A'
const WS4 = '\u000D'
const WS5 = '\u0009'

export class JParser{

  public jstring: string = ""
  private offset:i32 = 0
  private nums:Set<string> = new Set<string>()
  private escaped: Map<string, string> = new Map<string, string>()

  constructor(jstring: string){
    this.jstring = jstring
    this.offset = 0

    this.nums.add("-")
    this.nums.add(".")
    this.nums.add("e")
    this.nums.add("E")
    for (let i: u8 = 0; i < 10; i++) {
      this.nums.add(i.toString())
    }

    const echar = ['"', "\\", "/", "b", "f", "n", "r", "t"]
    const escaped = ['\"', "\\", "\/", "\b", "\f", "\n", "\r", "\t"]
    for (let i:i32 = 0; i < escaped.length; i++){
      this.escaped.set(echar[i], escaped[i])
    }
  }

  finished(): bool {
    return this.offset == <u32>this.jstring.length
  }

  current_char(): string {
    return this.jstring.at(this.offset)
  }

  escaped_char(): bool {
    if (this.offset == 0) { return false }
    return this.jstring.at(this.offset - 1) == '\\'
  }

  is_white_space(char:string): boolean {
    return char == WS1 || char == WS2 || char == WS3 || char == WS4 || char == WS5
  }

  skip_spaces(): void {
    while (!this.finished()){
      let current = this.current_char()
      if(this.is_white_space(current)) {
        this.offset += 1
      }else{
        return
      }  
    }
  }

  static parse(str: string): Value{
    const parser = new JParser(str)
    return parser.parse_value()
  }

  parse_value(): Value {
    let ret: Value = new Value('')

    // Check if it is an empty string (or many white spaces)
    this.skip_spaces()
    if(this.offset == this.jstring.length){ return ret }

    const current_char: string = this.current_char()

    let P: boolean = false

    if(current_char == 't'){ ret = this.parse_true(); P = true }

    if(current_char == 'f'){ ret = this.parse_false(); P = true }

    if(current_char == 'n'){ ret = this.parse_null(); P = true }

    if(current_char == '"'){ ret = this.parse_string(); P = true }

    if(current_char == '['){ ret = this.parse_array(); P = true }

    if(current_char == '{'){ ret = this.parse_object(); P = true }

    if(this.nums.has(current_char)){ ret = this.parse_number(); P = true }
    
    if(P){
      this.skip_spaces()
      return ret
    }else{
      assert(false, "Expected boolean, null, string, array, object or number")
    }

    return ret
  }

  expect_to_be(actual:string, expected:string):void{
    assert(expected == actual, `Expected ${expected}, but got ${actual}`)
  }

  parse_true(): Value{
    const found: string = this.jstring.slice(this.offset, this.offset+4)
    this.expect_to_be(found, 'true')
    this.offset += 4
    return new Value('true')
  }

  parse_number(): Value{
    const start = this.offset
    while(!this.finished() && this.nums.has(this.current_char())){
      this.offset += 1
    }
    return new Value(this.jstring.slice(start, this.offset))
  }

  parse_false(): Value{
    const found: string = this.jstring.slice(this.offset, this.offset+5)
    this.expect_to_be(found, 'false')
    this.offset += 5
    return new Value('false')
  }

  parse_null(): Value{
    const found: string = this.jstring.slice(this.offset, this.offset+4)
    this.expect_to_be(found, 'null')
    this.offset += 4
    return new Value('null')
  }

  parse_array(): Value {
    //[v1,v2,...,v4] or "uint8_encoded_as64"
    let ret: Array<Value> = new Array<Value>()
    this.offset += 1 // skip [

    while (this.current_char() != ']') {
      if (this.current_char() == ',') { 
        this.offset += 1 
      }
      ret.push(this.parse_value())
    }

    this.expect_to_be(this.current_char(), ']')
    this.offset += 1  // skip: ]

    return new Value('', null, ret)
  }
  
  parse_object(): Value{
    let res = new Map<string, Value>()
    
    this.expect_to_be(this.current_char(), '{')
    this.offset += 1

    while(this.current_char() != '}'){
      this.skip_spaces()
      const key:string =  this.parse_string().value
      this.skip_spaces()

      this.expect_to_be(this.current_char(), ':')
      this.offset += 1 // skip :
      const value: Value =  this.parse_value()
      res.set(key, value)

      assert(this.current_char() == '}' || this.current_char() == ',')

      if(this.current_char() == ','){
        this.offset += 1 // skip ,
      }
    }
    this.offset += 1 // skip }
    this.skip_spaces()
    return new Value('', res)
  }

  // STRING ======================================
  parse_string(): Value {
    this.expect_to_be(this.current_char(), '"')
    let ret:Array<string> = []
    this.offset += 1 // skip "

    while (true) {
      const current = this.current_char()
      if (current == '"'){ break }

      if (current == '\\'){
        ret.push(this.parse_escaped())
      }else{
        ret.push(current)
        this.offset += 1
      }
    }
    this.expect_to_be(this.current_char(), '"')
    this.offset += 1 // skip "

    return new Value(ret.join(''))
  }

  parse_escaped(): string {
    this.offset += 1 // skip \

    const current = this.current_char();

    if (current == "u") {
      this.offset += 1 // skip u
      const hex = this.parse_4hex()      
      return hex
    }

    if(this.escaped.has(current)){
      this.offset += 1
      return this.escaped.get(current)
    }
    
    assert(false, `Unexpected escaped character ${current}`)
    return ""
  }

  parse_4hex(): string {
    assert(this.jstring.length > this.offset + 4, "Abrupt end of HEX")

    const CHAR_0 = "0".codePointAt(0)
    const CHAR_A = "A".codePointAt(0)
    const CHAR_A_LOWER = "a".codePointAt(0)

    let D: Array<i32> = new Array<i32>(4)

    for(let i=0; i<4; i++){
      let current = this.current_char()
      let byte = current.codePointAt(0)
      
      let digit = byte - CHAR_0;
      if (digit > 9) {
        digit = byte - CHAR_A + 10;
        if (digit < 10 || digit > 15) {
          digit = byte - CHAR_A_LOWER + 10;
        }
      }

      assert(digit >= 0 && digit < 16, "Unexpected \\u digit");
      D[i] = digit
      this.offset += 1
    }
    let charCode = D[0]*0x1000 + D[1]*0x100 + D[2]*0x10 + D[3];
    return String.fromCodePoint(charCode)
  }
}