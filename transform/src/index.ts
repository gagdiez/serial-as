import { ClassDeclaration, Parser, CommonFlags } from "assemblyscript/dist/assemblyscript";
import { registerDecorator, Decorator, ASTTransformVisitor } from "visitor-as";

import {MethodInjector} from "./methodInjector";
import { getName, isLibrary, not } from "visitor-as/dist/utils";
import { isStdlib } from "./utils";



class Transformer extends ASTTransformVisitor {
  visitClassDeclaration(node: ClassDeclaration): void {
      MethodInjector.visit(node);
  }

  afterParse(_: Parser): void { 
    _.sources.forEach(source => this.visit(source));
  }
  
}

export default Transformer;