# JSON-as

**json-as** is an assemblyscript implementation of the [JSON](https://json.org) serializer.


## How to use it

Install the package via `yarn add @serial-as/json` and add the `--transform @serial-as/transform` flag to your `asc` command.

```ts
import { stringify, parse } from '@serial-as/json'

@serializable
class Pair{
  x: i32 = 0,
  y: i32 = 0
}

let pair:Pair = {x:1, y:2}

// `serialized` is the string "{"x":1,"y":2}"
let serialized: string = stringify(object)  

// `decoded` is the Pair = {x:1, y:2}
let decoded: Pair = parse<Pair>(serialized)  
```
