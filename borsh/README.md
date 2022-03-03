# Borsh-as

**borsh-as** is an assemblyscript implementation of the [borsh](https://borsh.io) serializer.

## How to use it

Install the package via `yarn add @serial-as/borsh` and add the `--transform @serial-as/transform` flag to your `asc` command.

```ts
import { BorshSerializer, BorshDeserializer } from '@serial-as/borsh'

@serializable
class Pair{
  x: i32 = 0,
  y: i32 = 0
}

let pair: Pair = {x:1, y:2}

// `serialized` is the u8 buffer [0, 0, 0, 1, 0, 0, 0, 2]
let serialized: ArrayBuffer = BorshSerializer.encode(object)  

// `decoded` is the Pair = {x:1, y:2}
let decoded: Pair = BorshDeserializer.decode<Pair>(serialized)  
```

## Limitations

Assemblyscript does not have Enums, nor allows to predefine the length of an array. Because of this, Borsh-as has the following limitations:

- Does **not** deserialize Enums.
- Does **not** deserialize fixed-size arrays.
