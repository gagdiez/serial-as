import { TypeNode, ClassDeclaration, Source, FieldDeclaration, NodeKind, DeclarationStatement, CommonFlags } from "assemblyscript/dist/assemblyscript.js";
import { SimpleParser, BaseVisitor } from "visitor-as";
import { toString, isMethodNamed, getName } from 'visitor-as/dist/utils.js';
import { isStdlib } from "./utils.js";

function isField(node: DeclarationStatement): boolean {
  return node.kind == NodeKind.FIELDDECLARATION;
}

function isInstanceField(node: DeclarationStatement): boolean {
  return isField(node) && node.is(CommonFlags.INSTANCE);
}

export class MethodInjector extends BaseVisitor {
  encodeStmts!: string[];
  decodeStmts!: string[];
  currentClass!: ClassDeclaration;

  visitFieldDeclaration(node: FieldDeclaration): void {
    const name = toString(node.name);
    if (!node.type) {
      throw new Error(`Field ${name} is missing a type declaration  for ${toString(this.currentClass)}`);
    }
    
    const _type = getName(node.type);
    
    this.encodeStmts.push(`encoder.encode_field<${_type}>("${name}", this.${name})`);
    
    this.decodeStmts.push(`this.${name} = decoder.decode_field<${_type}>("${name}")`);
  }

  visitClassDeclaration(node: ClassDeclaration): void {
    if (isStdlib(node)) { return; }

    const fields = node.members.filter(isInstanceField);
    if (!fields) {
      return;
    }
    this.currentClass = node;

    this.encodeStmts = [];
    this.decodeStmts = [];
    super.visit(fields);

    const encodeMethod = `
    encode<__T>(encoder: __T): void {
      ${node.extendsType != null ? "super.encode<__T>(encoder);" : ""}
      ${this.encodeStmts.join(";\n\t")};
    }
    `
    const decodeMethod = `
    decode<__T>(decoder: __T): void {
      ${node.extendsType != null ? "super.decode(decoder);" : ""}
      ${this.decodeStmts.join(";\n\t")};
    }
    `
    if (!node.members.some(isMethodNamed("encode"))) { 
      const encodeMember = SimpleParser.parseClassMember(encodeMethod, node);
      node.members.push(encodeMember);
    }
    if (!node.members.some(isMethodNamed("decode"))) { 
      const decodeMember = SimpleParser.parseClassMember(decodeMethod, node);
      node.members.push(decodeMember);
    }
  }

  static visit(node: ClassDeclaration | Source): void {
    (new MethodInjector()).visit(node);
  }

}
