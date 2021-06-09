import { u128 } from "as-bignum";

/**
 * Top level abstract Encoder class which defines default 
 * methods, `encode` and `encode_number`, which use tyu
 */
@global
export abstract class Serializer<R>{
  
  abstract get_encoded_object():R
  
  // Boolean
  abstract encode_bool(value: bool): void
  
  // Map --
  abstract encode_map<K, V>(value:Map<K, V>): void
  
  // Null --
  abstract encode_nullable<V>(value: V): void
  
  // Object --
  abstract encode_object<C extends object>(value:C): void
  abstract encode_field<T>(name:string, value:T):void

  // String --
  abstract encode_string(value:string): void

  // Set --
  abstract encode_set<T>(value:Set<T>): void

  // Arraylike --
  // @ts-ignore
  abstract encode_array<A extends ArrayLike<valueof<A>>>(value:A): void;

  /**
   * Encode a typed array. Default treats it as normal array.
   * @param value Subclass of ArrayBufferView
   */
  encode_arraybuffer_view<T extends ArrayBufferView>(value: T): void {
    // @ts-ignore
    this.encode_array(value);
  }

  /**
   * Encode a static array. Default treats it as normal array.
   * @param value Static Array
   */
  encode_static_array<T>(value: StaticArray<T>): void {
    // @ts-ignore
    this.encode_array(value);
  }

  // Number --
  abstract encode_u8(value:u8): void
  abstract encode_i8(value:i8): void
  abstract encode_u16(value:u16): void
  abstract encode_i16(value:i16): void
  abstract encode_u32(value:u32): void
  abstract encode_i32(value:i32): void
  abstract encode_u64(value:u64): void
  abstract encode_i64(value:i64): void
  abstract encode_u128(value:u128): void
  abstract encode_f32(value:f32): void
  abstract encode_f64(value:f64): void

  encode_number<N extends number>(value:N):void{
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


  // Encode --
  encode<V>(value: V): void {
    // @ts-ignore
    if (isBoolean<V>()){ this.encode_bool(value); return }

    // @ts-ignore
    if (isInteger<V>() || isFloat<V>()){ this.encode_number<V>(value); return }

    if (isNullable<V>()) { this.encode_nullable<V>(value); return }

    // @ts-ignore
    if (isString<V>()) { this.encode_string(value); return }
    
    // @ts-ignore
    if(value instanceof u128){ this.encode_u128(value); return }  // -> we need to get ride of this
    
    // @ts-ignore
    if (isDefined(value.encode)){ this.encode_object(value); return }

    // @ts-ignore
    if (value instanceof ArrayBufferView) { this.encode_arraybuffer_view(value); return;}

    // @ts-ignore
    if (value instanceof StaticArray) { this.encode_static_array<valueof<V>>(value); return;}

    // @ts-ignore
    if(isArrayLike<V>(value)){ this.encode_array<V>(value); return }

    // @ts-ignore
    if(value instanceof Set){ this.encode_set<indexof<V>>(value); return }

    // @ts-ignore
    if(value instanceof Map){ this.encode_map<indexof<V>, valueof<V>>(value); } else {
          ERROR(`Failed to encode ${value} with type ${nameof<V>()}.
        Perhaps you're missing an 'encode' method on your class`);
    }

  }

}