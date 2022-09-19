import { ClassDeclaration, Parser, CommonFlags } from "assemblyscript/dist/assemblyscript.js";
import { registerDecorator, Decorator, ASTTransformVisitor } from "visitor-as";

import {MethodInjector} from "./methodInjector.js";
import { getName, isLibrary, not } from "visitor-as/dist/utils.js";
import { isStdlib } from "./utils.js";



export default class Transformer extends ASTTransformVisitor {
  visitClassDeclaration(node: ClassDeclaration): void {
      MethodInjector.visit(node);
  }

  afterParse(_: Parser): void { 
    _.sources.forEach(source => this.visit(source));
  }
  
}
