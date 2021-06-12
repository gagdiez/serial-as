import { ClassDeclaration } from "visitor-as/as";
import { registerDecorator, Decorator } from "visitor-as";

import {MethodInjector} from "./methodInjector";



class Encoder extends Decorator {
  
  visitClassDeclaration(node: ClassDeclaration): void {
    MethodInjector.visit(node);
  }

  get name(): string { return "serializable" }

  get sourceFilter() {
    return (_:any) => true;
  }
 
}

export = registerDecorator(new Encoder())