import { Parser,   ClassDeclaration,
  FieldDeclaration,
  MethodDeclaration, } from "../as";
import { SimpleParser } from "visitor-as/dist/simpleParser";

import { ClassDecorator, registerDecorator } from "visitor-as/dist/decorator";

import { not, isLibrary, className, toString, isMethodNamed } from 'visitor-as/dist/utils';


class ToStringCallTransform extends ClassDecorator {
  currentClass?: ClassDeclaration;
  fields: string[];

  visitFieldDeclaration(node: FieldDeclaration): void {
    const name = toString(node.name);
    if (!node.type) {
      throw new Error(`Field ${name} is missing a type declaration`);
    }
    let rhs = `this.${name}.toString()`;
    this.fields.push(`sb.push(\`${name}: \${${rhs}}\`)`);
  }

  visitClassDeclaration(node: ClassDeclaration): void {
    if (!node.members || node.members.some(isMethodNamed("toString"))) {
      return;
    }
    
    this.currentClass = node;
    this.fields = [];
    this.visit(node.members);
    const method = `
      toString(): string {
        const sb = new Array<string>();
        ${this.fields.join(";\n\t")};
        return \`${className(node)}:\\n\\t\${sb.join("\\n\\t")}\`
      }
    `
    let member = SimpleParser.parseClassMember(method, node);

    node.members.push(member);
  }

  visitMethodDeclaration(node: MethodDeclaration): void { }

  get name(): string { return "tostring"; }
  
}


export = registerDecorator(new ToStringCallTransform());