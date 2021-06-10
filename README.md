# Serial-as

**serial-as** simplifies creating serialized encoders/decoders for the assemblyscript language. Furthermore, it readily implements a JSON, and a [Borsh](borsh.io) (de)serializer.

## Installing and Testing
```bash
yarn install
yarn test
```

## What is a Serializer
A (de)Serialized is an object that encodes/decodes `objects` into a predefined type. For example, the JSON serializer encodes `objects` into `strings`, and decodes JSON-encoded `strings` into `objects`.

## How to create a Serializer
Extend the classes `Serializer` and `Deserealizer` exported by `serial-as` and implement their methods. Then, use your Serializer and Deserealizer to instantiate a `Serial` object. For example, to create a serializer that encodes/decodes objects into encoded `strings` you will write the following code.

```ts
import { Serializer, Deserializer } from "@serial-as/core";

class MySerializer extends Serializer<string>{
  /* implement methods to convert types into string */
}

class MyDeserializer extends Deserializer<string>{
  /* implement methods to parse a string into an object */
}

export class MySerial<string, MySerializer, MyDeserializer> { }
```

In order to implement `MyDeserializer` you will need to implement the abstract methods of the `Deserializer` class. Among others, you must implement 
- `decode_bool():bool`
- `abstract decode_map<K, V>():Map<K, V>`
- `decode_string():string`
- `decode_i32():i32`
- etc.

You can use as examples the Borsh and JSON serializers included in this repository. Simply copy one of the folders, and change the methods implemented on them.

## How to use your (De)Serializer
In order for an object to be serializable you need to decorate it with the `@serializable` tag. After this, the object can be used with any Serial object.

```ts
@serializable
class Pair{
  x: i32 = 0,
  y: i32 = 0
}

let pair:Pair = {x:1, y:2}

// Pair can also be used with your implemented serializer
const myserial:MySerial = new MySerial()

// serialize the object into a string
let serialized:string = myserial.serialize(object)  

// decoded must be the Pair = {x:1, y:2}
let decoded:Pair = myserial.deserialize<Pair>(serialized)
```

Once more, you can use the Borsh and JSON implementation included in this repository as a guide.

## Under the Hood
Under the hood, **serial-as** implements a [transform](https://www.assemblyscript.org/transforms.html) to visit `@serializable` objects and encode/decode their fields. To do so, the transform uses the methods implemented in the Serializer/Deserializer classes.