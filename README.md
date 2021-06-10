# Serial-as

**serial-as** simplifies creating serialized encoders/decoders for the assemblyscript language. Furthermore, it readily implements a JSON, and a [Borsh](borsh.io) (de)serializer.

## What is a (de)Serializer
A (de)Serialized is an object that encodes/decodes intanciated objects into a predefined type. For example, a JSON serializer encodes objects into strings, and decodes JSON-encoded strings into objects.


```ts
import JSON from "serial-as"

class Pair{
  x: i32 = 0,
  y: i32 = 0
}

let pair:Pair = {x:1, y:2}

// serialized is the string "{"x":1,"y":2}"
let serialized:string = JSON.serialize(object)  

// decoded is the Pair = {x:1, y:2}
let decoded:Pair = JSON.deserialize<Pair>(serialized)  
```
## How to use **serial-a**

**serial-as**  simplifies creating (de)serializers by abstracting away the logic of visiting objects, and exposing the Encoder and Decoder classes. By implementing their abstract methods, one indicates how basic types (number, string, bool, etc) are to be (de)serialized. For example, the methods needed to implement a decoder are:

```ts
constructor(encoded_object:any){}

// Decode Field
abstract decode_field<T>(name:string):T

// Boolean
abstract decode_bool(): bool

// Map --
abstract decode_map<K, V>(): Map<K, V>

// Null --
abstract decode_nullable<T>(): T | null

// Object
abstract decode_object<C extends object>(): C

// String --
abstract decode_string(): string

// Set --
abstract decode_set<T>(): Set<T>

// Number --
abstract decode_u8(): u8
abstract decode_i8(): i8
abstract decode_u16(): u16
abstract decode_i16(): i16
abstract decode_u32(): u32
abstract decode_i32(): i32
abstract decode_u64(): u64
abstract decode_i64(): i64
abstract decode_u128(): u128
abstract decode_f32(): f32
abstract decode_f64(): f64

// Array --
abstract decode_array<A extends ArrayLike<any>>(): A;
```

Similar methods must be implemented for the encoder.

## Under the hood
After implementing both the Encoder and Decoder objects, **serial-as** will use its implemented [transform](https://www.assemblyscript.org/transforms.html) to visit objects decorated as `@serializable`. **serial-as** will visit each field in the object, and encode/decode its value into an internal object. This is however completely hidden away from the user, which only needs to call the "serialize" and "deserialize" functions of the (de)serializer.