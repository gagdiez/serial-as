// TODO: 
// - raise errors for Maps with non-key strings
// - add more error messages in parser.ts

@lazy const WS1 = " "
@lazy const WS2 = '\u0020'
@lazy const WS3 = '\u000A'
@lazy const WS4 = '\u000D'
@lazy const WS5 = '\u0009'

@lazy const CHAR_minus:i32 = '-'.charCodeAt(0)
@lazy const CHAR_0: i32 = 48;
@lazy const CHAR_9: i32 = 57;
@lazy const CHAR_e:i32 = 'e'.charCodeAt(0)
@lazy const CHAR_E:i32 = 'E'.charCodeAt(0)
@lazy const CHAR_point:i32 = '.'.charCodeAt(0)

function escaped_char(char: string): string {
  let charCode = char.charCodeAt(0)
  switch (charCode) {
    case '"'.charCodeAt(0): return '\"';
    case "\\".charCodeAt(0): return "\\";
    case "b".charCodeAt(0): return "\b";
    case "f".charCodeAt(0): return "\f";
    case "n".charCodeAt(0): return "\n";
    case "r".charCodeAt(0): return "\r";
    case "t".charCodeAt(0): return "\t";
    default: return char;
  }
}

function is_number(char: string): bool{
  let charcode = char.charCodeAt(0)
  return (CHAR_0 <= charcode && charcode <= CHAR_9) ||
         charcode == CHAR_point || charcode == CHAR_minus ||
         charcode == CHAR_e || charcode == CHAR_E
}

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

export class JParser{

  public jstring: string = ""
  private offset:i32 = 0
  private nums:Set<string> = new Set<string>()
  private escaped: Map<string, string> = new Map<string, string>()

  constructor(jstring: string){
    this.jstring = jstring
    this.offset = 0
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

    let charcode = current_char.charCodeAt(0)
    if((CHAR_0 <= charcode && charcode <= CHAR_9) || charcode == CHAR_minus){
       ret = this.parse_number(); P = true
    }
    
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
    while(!this.finished() && is_number(this.current_char())){
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

    while (!this.finished()) {
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

    this.offset += 1
    return escaped_char(current)
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