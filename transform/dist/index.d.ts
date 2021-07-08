import { ClassDeclaration, Parser } from "visitor-as/as";
import { ASTTransformVisitor } from "visitor-as";
declare class Transformer extends ASTTransformVisitor {
    visitClassDeclaration(node: ClassDeclaration): void;
    afterParse(_: Parser): void;
}
export = Transformer;
