# MSGPACK-as

**msgpack-as** is an assemblyscript implementation of the [MsgPack](msgpack.org) serializer.


## How to use it

```ts
import MSGPACK from "serial-as"

@serializable
class Pair{
  x: i32 = 0,
  y: i32 = 0
}

let pair:Pair = {x:1, y:2}

// serialized is the byte array 82 a1 78 01 a1 79 02
let serialized:string = MSGPACK.serialize(object)  

// decoded is the Pair = {x:1, y:2}
let decoded:Pair = MSGPACK.deserialize<Pair>(serialized)  
```