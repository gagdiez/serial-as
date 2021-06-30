import { TypeNode, ClassDeclaration, FieldDeclaration, NodeKind, DeclarationStatement } from "visitor-as/as";
import { SimpleParser, BaseVisitor } from "visitor-as";
import { toString, isMethodNamed, getName } from 'visitor-as/dist/utils';


function getTypeName(type: TypeNode): string {
  let _type = getName(type);
  const OR_NULL = /\|.*null/;
  if (type.isNullable && !OR_NULL.test(_type)) {
    _type = `${_type} | null`;
  }
  return _type
}


function isField(node: DeclarationStatement): boolean {
  return node.kind == NodeKind.FIELDDECLARATION;
}

export class MethodInjector extends BaseVisitor {
  encodeStmts: string[];
  decodeStmts: string[];

  visitFieldDeclaration(node: FieldDeclaration): void {
    const name = toString(node.name);
    if (!node.type) {
      throw new Error(`Field ${name} is missing a type declaration`);
    }
    
    const _type = getTypeName(node.type);
    
    this.encodeStmts.push(`encoder.encode_field<${_type}>("${name}", this.${name})`);
    
    let defaultValue: string = node.initializer ? `, ${toString(node.initializer)}`: "";
    this.decodeStmts.push(`this.${name} = decoder.decode_field<${_type}>("${name}"${defaultValue})`);
  }

  visitClassDeclaration(node: ClassDeclaration): void {
    const fields = node.members.filter(isField);

    if (!fields) {
      return;
    }

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

  static visit(node: ClassDeclaration): void {
    (new MethodInjector()).visit(node);
  }

}
