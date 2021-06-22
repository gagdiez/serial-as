# JSON-as

**json-as** is an assemblyscript implementation of the [JSON](json.org) serializer.


## How to use it

```ts
import JSON from "serial-as"

@serializable
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