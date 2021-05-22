import { Parser,   ClassDeclaration,
  FieldDeclaration,
  MethodDeclaration, } from "../as";
import { SimpleParser } from "visitor-as/dist/simpleParser";

import { ClassDecorator, registerDecorator } from "visitor-as/dist/decorator";

import { not, isLibrary, className, toString, isMethodNamed } from 'visitor-as/dist/utils';
import { ConstructorExpression } from "assemblyscript";


class Encoder extends ClassDecorator {
  currentClass?: ClassDeclaration;
  fields: string[];

  constructor(public used_encoder:string="JSON"){
    super()
  }

  visitFieldDeclaration(node: FieldDeclaration): void {
    const name = toString(node.name);
    if (!node.type) {
      throw new Error(`Field ${name} is missing a type declaration`);
    }
    //let rhs = `this.${name}.toString()`;
    //this.fields.push(`sb.push(\`${name}: \${${rhs}}\`)`);
    const _type = toString(node.type!);
    this.fields.push(`encoder.encode_${_type}('${name}', this.${name})`);
  }

  visitClassDeclaration(node: ClassDeclaration): void {
    if (!node.members || node.members.some(isMethodNamed("encode"))) {
      return;
    }
    
    this.currentClass = node;
    this.fields = [];
    this.visit(node.members);

    let fields_plus_inbetween = []
    for(let i=0; i < this.fields.length; i++){
      fields_plus_inbetween.push(this.fields[i])
      if(i!=this.fields.length-1){ fields_plus_inbetween.push(`encoder.between()`)}
    }

    const method = `
      encode():string {
        let encoder = new ${this.used_encoder}()
        encoder.start()
        ${fields_plus_inbetween.join(";\n\t")};
        encoder.end()
        
        return encoder.encoded
      }
    `
    let member = SimpleParser.parseClassMember(method, node);

    node.members.push(member);
  }

  visitMethodDeclaration(node: MethodDeclaration): void { }
}

class JSON_Encoder extends Encoder{
  constructor(){super("JSON")}
  get name(): string { return "jencoded"; }
}

class Borsh_Encoder extends Encoder{
  constructor(){super("Borsh")}
  get name(): string { return "bencoded"; }
}

export = function(){registerDecorator(new JSON_Encoder()) || registerDecorator(new Borsh_Encoder()) }