import { ClassDeclaration, FieldDeclaration, MethodDeclaration } from "../as";
import { SimpleParser } from "visitor-as/dist/simpleParser";

import { ClassDecorator } from "visitor-as/dist/decorator";

import { toString, isMethodNamed } from 'visitor-as/dist/utils';


export abstract class Encoder extends ClassDecorator {
  currentClass?: ClassDeclaration;
  fields: string[];

  constructor(public encoder:string="JSON",
              public res_type:string="string"){
    super()
  }

  visitFieldDeclaration(node: FieldDeclaration): void {
    const name = toString(node.name);
    if (!node.type) {
      throw new Error(`Field ${name} is missing a type declaration`);
    }

    //TODO:
    // if type == Array<T>:
    //   if T == basic_type: (i.e. int, string, float)
    //     arr = [encoder.encode<T>('', v) for v in node.value]
    //   else:
    //     assert(v has method encode, "ERROR")
    //     arr = [v.encode() for v in node.value]
    //   pr.push encoder.encode_field(node.name, encoder.encode_array(arr))
    // else:
    const _type = toString(node.type!);
    this.fields.push(`
      pr.push(
        encoder.encode_field(
          '${name}',
          encoder.encode_${_type}(this.${name})
        )
      )`);
  }

  visitClassDeclaration(node: ClassDeclaration): void {
    if (!node.members || node.members.some(isMethodNamed("encode"))) {
      return;
    }
    
    this.currentClass = node;
    const class_name:string = toString(node.name!)

    this.fields = [];
    this.visit(node.members);

    const method = `
      encode():${this.res_type}{
        let encoder = new ${this.encoder}()
        let pr:Array<${this.res_type}> = new Array<${this.res_type}>();
        
        ${this.fields.join(";\n\t")};
        return encoder.merge_encoded('${class_name}', pr)
      }
    `
    let member = SimpleParser.parseClassMember(method, node);

    node.members.push(member);
  }
 
  visitMethodDeclaration(node: MethodDeclaration): void { }
}