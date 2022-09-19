import { ClassDeclaration, Parser } from "assemblyscript/dist/assemblyscript";
import { ASTTransformVisitor } from "visitor-as";
declare class Transformer extends ASTTransformVisitor {
    visitClassDeclaration(node: ClassDeclaration): void;
    afterParse(_: Parser): void;
}
export default Transformer;
