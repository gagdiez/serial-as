# Borsh-as

**borsh-as** is an assemblyscript implementation of the [borsh](borsh.io) serializer.

## How to use it

```ts
import { Borsh } from '@serial-as/borsh'

@serializable
class Pair{
  x: i32 = 0,
  y: i32 = 0
}

let pair:Pair = {x:1, y:2}

// serialized is the u8 buffer [0, 0, 0, 1, 0, 0, 0, 2]
let serialized:ArrayBuffer = Borsh.serialize(object)  

// decoded is the Pair = {x:1, y:2}
let decoded:Pair = Borsh.deserialize<Pair>(serialized)  
```

## Limitations
Assemblyscript does not have Enums, nor allows to predefine the lenght of an array. Because of this, Borsh-as has the following limitations:

- Does **not** deserialize Enums.
- Does **not** deserialize fixed-size arrays.