function isNull<T>(t: T): bool {
  if (isNullable<T>() || isReference<T>()) {
    return changetype<usize>(t) == 0;
  }
  return false;
}


export abstract class Encoder<R>{
  // An Encoder has an internal state of type I, and returns
  // encoded object of type R
  constructor(){}

  //abstract encode_array(value:Array<T>): void

  // Encodes the field `name` using its encoded value
  //abstract encode_field<_Class, _Field>(name:string, value: _Field): void;

  /* encode_object<_Class extends Object>(_class: _Class): void {
    this.pushObject();
    _class.encode(this);
    this.popObject();
  }

  encode_arr(){
    this.pushArray();
    this.encode_array();
    this.popArray();
  }

  abstract pushArray(): void;
  abstract pushObject(): void;
  abstract popObject(): void;
  abstract popArray(): void; */

  abstract start(class_name:string):void
  abstract end():void
  abstract get_encoded_object():R
  abstract encode_field<V>(name:string, value:V):void

  // Boolean
  //abstract encode_bool(value: bool): void

  // Number --
  abstract encode_u8(value:u8): void
  abstract encode_i8(value:i8): void
  abstract encode_u16(value:u16): void
  abstract encode_i16(value:i16): void
  abstract encode_u32(value:u32): void
  abstract encode_i32(value:i32): void
  abstract encode_u64(value:u64): void
  abstract encode_i64(value:i64): void
  abstract encode_f32(value:f32): void
  abstract encode_f64(value:f64): void

  encode_number<V extends number>(value:V):void{
    // @ts-ignore
    if (value instanceof u8){ this.encode_u8(value); return }
    // @ts-ignore
    if (value instanceof i8){ this.encode_i8(value); return }
    // @ts-ignore
    if (value instanceof u16){ this.encode_u16(value); return }
    // @ts-ignore
    if (value instanceof i16){ this.encode_i16(value); return }
    // @ts-ignore
    if (value instanceof u32){ this.encode_u32(value); return }
    // @ts-ignore
    if (value instanceof i32){ this.encode_i32(value); return }
    // @ts-ignore
    if (value instanceof u64){ this.encode_u64(value); return }
    // @ts-ignore
    if (value instanceof i64){ this.encode_i64(value); return }
    // @ts-ignore
    if (value instanceof f32){ this.encode_f32(value); return }
    // @ts-ignore
    if (value instanceof f64){ this.encode_f64(value); return }
  }

  // Null --
  //abstract encode_null(): void

  // String --
  abstract encode_string(value:string): void

  // Array --
  abstract encode_array<K>(value:Array<K>): void

  encode<V>(value: V): void {
    // This function encodes a value:V into the encoder.encoded_object:R

    // @ts-ignore
    if (isBoolean<V>()){ this.encode_boolean(value); return }

    // @ts-ignore
    if (isInteger<V>() || isFloat<V>()){ this.encode_number<V>(value); return }

    // @ts-ignore
    if (isString<V>()) { this.encode_string(value); return }

    //if (isNull<V>(value)){ return encoder.encode_null() }
    
    if (isReference<V>()) {
      // @ts-ignore
      //if (isDefined(value.encode)){ return this.encode_object(value) }

      if (isArrayLike<V>(value)){ this.encode_array<valueof<V>>(value); return }
    }
      //   if (f instanceof Uint8Array) {
      //     // @ts-ignore
      //     encoder.setString(name, base64.encode(<Uint8Array>f));
      //   } else {
      //     encoder.pushArray(name);
      //     for (let i: i32 = 0; i < f.length; i++) {
      //       // @ts-ignore
      //       encode<valueof<T>, JSONEncoder>(f[i], null, encoder);
      //     }
      //     encoder.popArray();
      //   }
      // } else {
      //   // Is an object
      //   if (f instanceof u128) {
      //     // @ts-ignore
      //     encoder.setString(name, f.toString());
      //   } else if (f instanceof Map) {
      //     assert(
      //       // @ts-ignore
      //       nameof<indexof<T>>() == "String",
      //       "Can only encode maps with string keys"
      //     );
      //     let keys = f.keys();
      //     encoder.pushObject(name);
      //     for (let i = 0; i < keys.length; i++) {
      //       // @ts-ignore
      //       encode<valueof<T>, JSONEncoder>(
      //         f.get(keys[i]),
      //         keys[i],
      //         encoder
      //       );
      //     }
      //     encoder.popObject();
      //   } else if (f instanceof Set) {
      //     // @ts-ignore
      //     let values: Array<indexof<T>> = f.values();
      //     encoder.pushArray(name);
      //     for (let i = 0; i < values.length; i++) {
      //       // @ts-ignore
      //       encode<indexof<T>, JSONEncoder>(values[i], null, encoder);
      //     }
      //     encoder.popArray();
      //   }
      //}
      // encoder.encode_object<T>(name, changetype<T>(f));
    //}
  }
}