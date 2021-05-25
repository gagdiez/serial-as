

function isNull<T>(t: T): bool {
  if (isNullable<T>() || isReference<T>()) {
    return changetype<usize>(t) == 0;
  }
  return false;
}
export abstract class Encoder<T>{
  constructor(){}

  static encode<From, T>(f: From, name: string, encoder: Encoder<T>): T {
    if (isBoolean<From>()) {
      // @ts-ignore
      encoder.setBoolean(value);
    } else if (isInteger<From>() || isFloat<From>()) {
      let x = f as unknown as number;
      if (f instanceof u8) {
        encoder.encode_u8(x);
      } else if (f instanceof i8) {
        encoder.encode_i8(x);
      } else if (f instanceof u16) {
        encoder.encode_u16(x);
      } else if (f instanceof i16) {
        encoder.encode_i16(x);
      } else if (f instanceof u32) {
        encoder.encode_u32(x);
      } else if (f instanceof i32) {
        encoder.encode_i32(x);
      } else if (f instanceof u64) {
        encoder.encode_u64(x);
      } else if (f instanceof i64) {
        encoder.encode_i64(x);
      } else if (f instanceof f32) {
        encoder.encode_f32(x);
      } else if (f instanceof f64) {
        encoder.encode_f64(x);
      }
    } else if (isString<From>()) {
        if (isNull<From>(f)) {
          encoder.encode_null();
        } else {
          encoder.encode_string(f as unknown as string);
        }
    } else if (isReference<T>()) {
           // @ts-ignore
           if (isDefined(f.encode)) {
            if (isNullable<T>()) {
              if (f != null) {
                encoder.encode_object(f)
              } else {
                encoder.encode_null();
              }
            } else {
              encoder.encode_object(f)
            }
          } else if (isArrayLike<T>(f)) {
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
          }
      // encoder.encode_object<T>(name, changetype<T>(f));
    }
    return changetype<T>(null)
  }

  abstract encode_number<Num extends number>(value: Num): void;
  abstract encode_bool(value: bool): void
  abstract encode_null(): void

  encode_u8(value:u8): void { this.encode_number(value); }
  encode_i8(value:i8): void { this.encode_number(value); }
  encode_u16(value:u16): void { this.encode_number(value); }
  encode_i16(value:i16): void { this.encode_number(value); }
  encode_u32(value:u32): void { this.encode_number(value); }
  encode_i32(value:i32): void { this.encode_number(value); }
  encode_u64(value:u64): void { this.encode_number(value); }
  encode_i64(value:i64): void { this.encode_number(value); }
  encode_f32(value:f32): void { this.encode_number(value); }
  encode_f64(value:f64): void { this.encode_number(value); }
  // ?? ?? ?? abstract encode_u128(value:u128): void
  abstract encode_string(value:string): void
  //abstract encode_array(value:Array<T>): void

  // Encodes the field `name` using its encoded value
  abstract encode_field<_Class, _Field>(name:string, value: _Field): void;

  encode_object<_Class extends Object>(_class: _Class): void {
    this.pushObject();
    _class.encode(this);
    this.popObject();
  }

  encode_arr(){
    this.pushArray();
    this.encode_array();
    this.popArray();
  }

  abstract encode_array(): void;

  abstract pushArray(): void;
  abstract pushObject(): void;
  abstract popObject(): void;
  abstract popArray(): void;

  // Merges all the partial encodings to create the Object's final encode
  abstract merge_encoded(obj_name:string | null):T
}