import { ClassDeclaration, Source, FieldDeclaration } from "visitor-as/as";
import { BaseVisitor } from "visitor-as";
export declare class MethodInjector extends BaseVisitor {
    encodeStmts: string[];
    decodeStmts: string[];
    currentClass: ClassDeclaration;
    visitFieldDeclaration(node: FieldDeclaration): void;
    visitClassDeclaration(node: ClassDeclaration): void;
    static visit(node: ClassDeclaration | Source): void;
}
