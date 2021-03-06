"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodInjector = void 0;
const as_1 = require("visitor-as/as");
const visitor_as_1 = require("visitor-as");
const utils_1 = require("visitor-as/dist/utils");
const utils_2 = require("./utils");
function isField(node) {
    return node.kind == as_1.NodeKind.FIELDDECLARATION;
}
function isInstanceField(node) {
    return isField(node) && node.is(as_1.CommonFlags.INSTANCE);
}
class MethodInjector extends visitor_as_1.BaseVisitor {
    visitFieldDeclaration(node) {
        const name = utils_1.toString(node.name);
        if (!node.type) {
            throw new Error(`Field ${name} is missing a type declaration  for ${utils_1.toString(this.currentClass)}`);
        }
        const _type = utils_1.getName(node.type);
        this.encodeStmts.push(`encoder.encode_field<${_type}>("${name}", this.${name})`);
        let defaultValue = node.initializer ? `, ${utils_1.toString(node.initializer)}` : "";
        this.decodeStmts.push(`this.${name} = decoder.decode_field<${_type}>("${name}"${defaultValue})`);
    }
    visitClassDeclaration(node) {
        if (utils_2.isStdlib(node)) {
            return;
        }
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
    `;
        const decodeMethod = `
    decode<__T>(decoder: __T): void {
      ${node.extendsType != null ? "super.decode(decoder);" : ""}
      ${this.decodeStmts.join(";\n\t")};
    }
    `;
        if (!node.members.some(utils_1.isMethodNamed("encode"))) {
            const encodeMember = visitor_as_1.SimpleParser.parseClassMember(encodeMethod, node);
            node.members.push(encodeMember);
        }
        if (!node.members.some(utils_1.isMethodNamed("decode"))) {
            const decodeMember = visitor_as_1.SimpleParser.parseClassMember(decodeMethod, node);
            node.members.push(decodeMember);
        }
    }
    static visit(node) {
        (new MethodInjector()).visit(node);
    }
}
exports.MethodInjector = MethodInjector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0aG9kSW5qZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWV0aG9kSW5qZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsc0NBQWtJO0FBQ2xJLDJDQUF1RDtBQUN2RCxpREFBeUU7QUFDekUsbUNBQW1DO0FBRW5DLFNBQVMsT0FBTyxDQUFDLElBQTBCO0lBQ3pDLE9BQU8sSUFBSSxDQUFDLElBQUksSUFBSSxhQUFRLENBQUMsZ0JBQWdCLENBQUM7QUFDaEQsQ0FBQztBQUVELFNBQVMsZUFBZSxDQUFDLElBQTBCO0lBQ2pELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsZ0JBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRUQsTUFBYSxjQUFlLFNBQVEsd0JBQVc7SUFLN0MscUJBQXFCLENBQUMsSUFBc0I7UUFDMUMsTUFBTSxJQUFJLEdBQUcsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDZCxNQUFNLElBQUksS0FBSyxDQUFDLFNBQVMsSUFBSSx1Q0FBdUMsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3BHO1FBRUQsTUFBTSxLQUFLLEdBQUcsZUFBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxNQUFNLElBQUksV0FBVyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRWpGLElBQUksWUFBWSxHQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssZ0JBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3BGLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSwyQkFBMkIsS0FBSyxNQUFNLElBQUksSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ25HLENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxJQUFzQjtRQUMxQyxJQUFJLGdCQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFL0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLE9BQU87U0FDUjtRQUNELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBRXpCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFcEIsTUFBTSxZQUFZLEdBQUc7O1FBRWpCLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUM3RCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7O0tBRWpDLENBQUE7UUFDRCxNQUFNLFlBQVksR0FBRzs7UUFFakIsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3hELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7S0FFakMsQ0FBQTtRQUNELElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7WUFDL0MsTUFBTSxZQUFZLEdBQUcseUJBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDakM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO1lBQy9DLE1BQU0sWUFBWSxHQUFHLHlCQUFZLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ2pDO0lBQ0gsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBK0I7UUFDMUMsQ0FBQyxJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7Q0FFRjtBQTFERCx3Q0EwREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUeXBlTm9kZSwgQ2xhc3NEZWNsYXJhdGlvbiwgU291cmNlLCBGaWVsZERlY2xhcmF0aW9uLCBOb2RlS2luZCwgRGVjbGFyYXRpb25TdGF0ZW1lbnQsIENvbW1vbkZsYWdzIH0gZnJvbSBcInZpc2l0b3ItYXMvYXNcIjtcbmltcG9ydCB7IFNpbXBsZVBhcnNlciwgQmFzZVZpc2l0b3IgfSBmcm9tIFwidmlzaXRvci1hc1wiO1xuaW1wb3J0IHsgdG9TdHJpbmcsIGlzTWV0aG9kTmFtZWQsIGdldE5hbWUgfSBmcm9tICd2aXNpdG9yLWFzL2Rpc3QvdXRpbHMnO1xuaW1wb3J0IHsgaXNTdGRsaWIgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5mdW5jdGlvbiBpc0ZpZWxkKG5vZGU6IERlY2xhcmF0aW9uU3RhdGVtZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLmtpbmQgPT0gTm9kZUtpbmQuRklFTERERUNMQVJBVElPTjtcbn1cblxuZnVuY3Rpb24gaXNJbnN0YW5jZUZpZWxkKG5vZGU6IERlY2xhcmF0aW9uU3RhdGVtZW50KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc0ZpZWxkKG5vZGUpICYmIG5vZGUuaXMoQ29tbW9uRmxhZ3MuSU5TVEFOQ0UpO1xufVxuXG5leHBvcnQgY2xhc3MgTWV0aG9kSW5qZWN0b3IgZXh0ZW5kcyBCYXNlVmlzaXRvciB7XG4gIGVuY29kZVN0bXRzITogc3RyaW5nW107XG4gIGRlY29kZVN0bXRzITogc3RyaW5nW107XG4gIGN1cnJlbnRDbGFzcyE6IENsYXNzRGVjbGFyYXRpb247XG5cbiAgdmlzaXRGaWVsZERlY2xhcmF0aW9uKG5vZGU6IEZpZWxkRGVjbGFyYXRpb24pOiB2b2lkIHtcbiAgICBjb25zdCBuYW1lID0gdG9TdHJpbmcobm9kZS5uYW1lKTtcbiAgICBpZiAoIW5vZGUudHlwZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBGaWVsZCAke25hbWV9IGlzIG1pc3NpbmcgYSB0eXBlIGRlY2xhcmF0aW9uICBmb3IgJHt0b1N0cmluZyh0aGlzLmN1cnJlbnRDbGFzcyl9YCk7XG4gICAgfVxuICAgIFxuICAgIGNvbnN0IF90eXBlID0gZ2V0TmFtZShub2RlLnR5cGUpO1xuICAgIFxuICAgIHRoaXMuZW5jb2RlU3RtdHMucHVzaChgZW5jb2Rlci5lbmNvZGVfZmllbGQ8JHtfdHlwZX0+KFwiJHtuYW1lfVwiLCB0aGlzLiR7bmFtZX0pYCk7XG4gICAgXG4gICAgbGV0IGRlZmF1bHRWYWx1ZTogc3RyaW5nID0gbm9kZS5pbml0aWFsaXplciA/IGAsICR7dG9TdHJpbmcobm9kZS5pbml0aWFsaXplcil9YDogXCJcIjtcbiAgICB0aGlzLmRlY29kZVN0bXRzLnB1c2goYHRoaXMuJHtuYW1lfSA9IGRlY29kZXIuZGVjb2RlX2ZpZWxkPCR7X3R5cGV9PihcIiR7bmFtZX1cIiR7ZGVmYXVsdFZhbHVlfSlgKTtcbiAgfVxuXG4gIHZpc2l0Q2xhc3NEZWNsYXJhdGlvbihub2RlOiBDbGFzc0RlY2xhcmF0aW9uKTogdm9pZCB7XG4gICAgaWYgKGlzU3RkbGliKG5vZGUpKSB7IHJldHVybjsgfVxuXG4gICAgY29uc3QgZmllbGRzID0gbm9kZS5tZW1iZXJzLmZpbHRlcihpc0luc3RhbmNlRmllbGQpO1xuICAgIGlmICghZmllbGRzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuY3VycmVudENsYXNzID0gbm9kZTtcblxuICAgIHRoaXMuZW5jb2RlU3RtdHMgPSBbXTtcbiAgICB0aGlzLmRlY29kZVN0bXRzID0gW107XG4gICAgc3VwZXIudmlzaXQoZmllbGRzKTtcblxuICAgIGNvbnN0IGVuY29kZU1ldGhvZCA9IGBcbiAgICBlbmNvZGU8X19UPihlbmNvZGVyOiBfX1QpOiB2b2lkIHtcbiAgICAgICR7bm9kZS5leHRlbmRzVHlwZSAhPSBudWxsID8gXCJzdXBlci5lbmNvZGU8X19UPihlbmNvZGVyKTtcIiA6IFwiXCJ9XG4gICAgICAke3RoaXMuZW5jb2RlU3RtdHMuam9pbihcIjtcXG5cXHRcIil9O1xuICAgIH1cbiAgICBgXG4gICAgY29uc3QgZGVjb2RlTWV0aG9kID0gYFxuICAgIGRlY29kZTxfX1Q+KGRlY29kZXI6IF9fVCk6IHZvaWQge1xuICAgICAgJHtub2RlLmV4dGVuZHNUeXBlICE9IG51bGwgPyBcInN1cGVyLmRlY29kZShkZWNvZGVyKTtcIiA6IFwiXCJ9XG4gICAgICAke3RoaXMuZGVjb2RlU3RtdHMuam9pbihcIjtcXG5cXHRcIil9O1xuICAgIH1cbiAgICBgXG4gICAgaWYgKCFub2RlLm1lbWJlcnMuc29tZShpc01ldGhvZE5hbWVkKFwiZW5jb2RlXCIpKSkgeyBcbiAgICAgIGNvbnN0IGVuY29kZU1lbWJlciA9IFNpbXBsZVBhcnNlci5wYXJzZUNsYXNzTWVtYmVyKGVuY29kZU1ldGhvZCwgbm9kZSk7XG4gICAgICBub2RlLm1lbWJlcnMucHVzaChlbmNvZGVNZW1iZXIpO1xuICAgIH1cbiAgICBpZiAoIW5vZGUubWVtYmVycy5zb21lKGlzTWV0aG9kTmFtZWQoXCJkZWNvZGVcIikpKSB7IFxuICAgICAgY29uc3QgZGVjb2RlTWVtYmVyID0gU2ltcGxlUGFyc2VyLnBhcnNlQ2xhc3NNZW1iZXIoZGVjb2RlTWV0aG9kLCBub2RlKTtcbiAgICAgIG5vZGUubWVtYmVycy5wdXNoKGRlY29kZU1lbWJlcik7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIHZpc2l0KG5vZGU6IENsYXNzRGVjbGFyYXRpb24gfCBTb3VyY2UpOiB2b2lkIHtcbiAgICAobmV3IE1ldGhvZEluamVjdG9yKCkpLnZpc2l0KG5vZGUpO1xuICB9XG5cbn1cbiJdfQ==