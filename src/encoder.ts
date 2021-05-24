import { ClassDeclaration, FieldDeclaration, MethodDeclaration } from "visitor-as/as";
import { SimpleParser } from "visitor-as/dist/simpleParser";

import { ClassDecorator } from "visitor-as/dist/decorator";

import { toString, isMethodNamed, getName } from 'visitor-as/dist/utils';


export abstract class Encoder extends ClassDecorator {
  currentClass?: ClassDeclaration;
  fields: string[];

  constructor(public encoder:string="JSON",
              public res_type:string="string"){
    super()
  }

  visitFieldDeclaration(node: FieldDeclaration): void {
    const name = getName(node);
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
    const _type = getName(node.type!);
    this.fields.push(`encoder.encode_field<${getName(this.currentClass!)}, ${_type}>("${name}", this.${name})`);
  }

  visitClassDeclaration(node: ClassDeclaration): void {
    if (!node.members || node.members.some(isMethodNamed("encode"))) {
      return;
    }
    
    this.currentClass = node;
    const class_name:string = getName(node)

    this.fields = [];
    this.visit(node.members);

    const method = `
      encode<__T>(encoder: Encoder<__T>): __T {
        let encoder = new ${this.encoder}()
        let pr:Array<__T> = new Array<__T>();
        
        ${this.fields.join(";\n\t")};
        super.encode<__T>(encoder);
        return encoder.merge_encoded('${class_name}', pr)
      }
    `
    let member = SimpleParser.parseClassMember(method, node);

    node.members.push(member);
  }
 
  visitMethodDeclaration(node: MethodDeclaration): void { }
}