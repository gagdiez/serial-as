import {Encoder} from ".";

export class Borsh<T> extends Encoder<T, ArrayBuffer>{
  public offset:i32 = 0

  constructor(){
    super()
  }

  merge_encoded(obj_name:string, encodes:Array<ArrayBuffer>):ArrayBuffer{
    let size:i32 = 0
    for(let i:i32=0; i < encodes.length; i++){ size += encodes[i].byteLength }
    
    let merged_buffer = new ArrayBuffer(size)
    let offset:i32 = 0

    for(let i:i32=0; i < encodes.length; i++){
      let src = changetype<usize>(encodes[i])
      let dst = changetype<usize>(merged_buffer) + <usize>offset
      memory.copy(dst, src, encodes[i].byteLength)
      offset += encodes[i].byteLength
    }
    return merged_buffer
  }
    
  encode_string(value:string):ArrayBuffer{
    // encoded = utf8_encoding(x) as Vec<u8>
    // repr(encoded.len() as u32)
    // repr(encoded as Vec<u8>)

    let utf8_enc:ArrayBuffer = String.UTF8.encode(value)
    let encoded:ArrayBuffer = new ArrayBuffer(utf8_enc.byteLength + 4)
    
    // repr(encoded.len() as u32)
    store<u32>(changetype<usize>(encoded), utf8_enc.byteLength)

    // repr(encoded as Vec<u8>) 
    const offset:i32 = 4
    memory.copy(changetype<usize>(encoded) + offset,
                changetype<usize>(utf8_enc),
                utf8_enc.byteLength)

    return encoded
  }

  encode_number<T>(value:T):ArrayBuffer{
    let buffer:ArrayBuffer = new ArrayBuffer(sizeof<T>())
    store<T>(changetype<usize>(buffer), value)
    return buffer
  }

  encode_i8(value:i8):ArrayBuffer{ return this.encode_number<i8>(value) }
  encode_i16(value:i16):ArrayBuffer{ return this.encode_number<i16>(value) }
  encode_i32(value:i32):ArrayBuffer{ return this.encode_number<i32>(value) }
  encode_i64(value:i64):ArrayBuffer{ return this.encode_number<i64>(value) }

  encode_u8(value:u8):ArrayBuffer{ return this.encode_number<u8>(value) }
  encode_u16(value:u16):ArrayBuffer{ return this.encode_number<u16>(value) }
  encode_u32(value:u32):ArrayBuffer{ return this.encode_number<u32>(value) }
  encode_u64(value:u64):ArrayBuffer{ return this.encode_number<u64>(value) }


  encode_field(name:string, value:ArrayBuffer):ArrayBuffer{
    return value
  }

}