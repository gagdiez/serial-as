import { ClassDeclaration, Parser } from "assemblyscript/dist/assemblyscript.js";
import { ASTTransformVisitor } from "visitor-as";
export default class Transformer extends ASTTransformVisitor {
    visitClassDeclaration(node: ClassDeclaration): void;
    afterParse(_: Parser): void;
}
