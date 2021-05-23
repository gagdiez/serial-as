export abstract class Encoder<T>{
  constructor(){}

  //abstract encode_u8(value:u8):T
  //abstract encode_i8(value:i8):T
  //abstract encode_u16(value:u16):T
  //abstract encode_i16(value:i16):T
  //abstract encode_u32(value:u32):T
  abstract encode_i32(value:i32):T
  //abstract encode_u64(value:u64):T
  abstract encode_i64(value:i64):T
  //abstract encode_u128(value:u128):T
  abstract encode_string(value:string):T
  //abstract encode_array(value:Array<T>):T

  // Encodes the field `name` using its encoded value
  abstract encode_field(name:string, value:T):T

  // Merges all the partial encodings to create the Object's final encode
  abstract merge_encoded(obj_name:string, array:Array<T>):T
}