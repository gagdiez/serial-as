import { TypeNode, ClassDeclaration, FieldDeclaration, MethodDeclaration } from "visitor-as/as";
import { SimpleParser, ClassDecorator, registerDecorator } from "visitor-as";
import { toString, isMethodNamed, getName } from 'visitor-as/dist/utils';


function getTypeName(type: TypeNode): string {
  let _type = getName(type);
  const OR_NULL = /\|.*null/;
  if (type.isNullable && !OR_NULL.test(_type)) {
    _type = `${_type} | null`;
  }
  return _type
}


class Encoder extends ClassDecorator {
  currentClass?: ClassDeclaration;
  encodeStmts: string[];
  decodeStmts: string[];

/*   constructor(public encoder:string="JSON",
              public res_type:string="string"){
    super();
  } */

  visitFieldDeclaration(node: FieldDeclaration): void {
    const name = toString(node.name);
    if (!node.type) {
      throw new Error(`Field ${name} is missing a type declaration`);
    }
    
    const _type = getTypeName(node.type);
    
    this.encodeStmts.push(`
      encoder.encode_field<${_type}>("${name}", this.${name})
    `);
    this.decodeStmts.push(`
      this.${name} = decoder.decode_field<${_type}>("${name}")
    `);
  }

  visitClassDeclaration(node: ClassDeclaration): void {
    if (!node.members || node.members.some(isMethodNamed("encode"))) {
      return;
    }
    
    this.currentClass = node;
    const class_name:string = getName(node)

    this.encodeStmts = [];
    this.decodeStmts = [];
    this.visit(node.members);

    const encodeMethod = `
    encode<__T>(encoder: Encoder<__T>): __T {
      ${node.extendsType != null? "super.encode<__T>(encoder);" : ""}
      ${this.encodeStmts.join(";\n\t")};
      return encoder.get_encoded_object()
    }
    `
    const decodeMethod = `
    decode<__T>(decoder: Decoder<__T>): void {
      ${this.decodeStmts.join(";\n\t")};
      ${node.extendsType != null? "super.decode<__T>(decoder);" : ""}
    }
    `
    const encodeMember = SimpleParser.parseClassMember(encodeMethod, node);
    node.members.push(encodeMember);
    
    const decodeMember = SimpleParser.parseClassMember(decodeMethod, node);
    node.members.push(decodeMember);
  }

  get name(): string { return "serializable" }
 
  visitMethodDeclaration(node: MethodDeclaration): void { }
}

export = registerDecorator(new Encoder())