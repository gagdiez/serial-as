import { Encoder } from "./encoder"

import { registerDecorator } from "visitor-as";

class JSONEncoder extends Encoder{
  constructor(){super("JSON", "string")}
  get name(): string { return "jencoded" }
}

export = registerDecorator(new JSONEncoder())