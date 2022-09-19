import { ASTTransformVisitor } from "visitor-as";
import { MethodInjector } from "./methodInjector";
class Transformer extends ASTTransformVisitor {
    visitClassDeclaration(node) {
        MethodInjector.visit(node);
    }
    afterParse(_) {
        _.sources.forEach(source => this.visit(source));
    }
}
export default Transformer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFnQyxtQkFBbUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUvRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFNaEQsTUFBTSxXQUFZLFNBQVEsbUJBQW1CO0lBQzNDLHFCQUFxQixDQUFDLElBQXNCO1FBQ3hDLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELFVBQVUsQ0FBQyxDQUFTO1FBQ2xCLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7Q0FFRjtBQUVELGVBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2xhc3NEZWNsYXJhdGlvbiwgUGFyc2VyLCBDb21tb25GbGFncyB9IGZyb20gXCJhc3NlbWJseXNjcmlwdC9kaXN0L2Fzc2VtYmx5c2NyaXB0XCI7XHJcbmltcG9ydCB7IHJlZ2lzdGVyRGVjb3JhdG9yLCBEZWNvcmF0b3IsIEFTVFRyYW5zZm9ybVZpc2l0b3IgfSBmcm9tIFwidmlzaXRvci1hc1wiO1xyXG5cclxuaW1wb3J0IHtNZXRob2RJbmplY3Rvcn0gZnJvbSBcIi4vbWV0aG9kSW5qZWN0b3JcIjtcclxuaW1wb3J0IHsgZ2V0TmFtZSwgaXNMaWJyYXJ5LCBub3QgfSBmcm9tIFwidmlzaXRvci1hcy9kaXN0L3V0aWxzXCI7XHJcbmltcG9ydCB7IGlzU3RkbGliIH0gZnJvbSBcIi4vdXRpbHNcIjtcclxuXHJcblxyXG5cclxuY2xhc3MgVHJhbnNmb3JtZXIgZXh0ZW5kcyBBU1RUcmFuc2Zvcm1WaXNpdG9yIHtcclxuICB2aXNpdENsYXNzRGVjbGFyYXRpb24obm9kZTogQ2xhc3NEZWNsYXJhdGlvbik6IHZvaWQge1xyXG4gICAgICBNZXRob2RJbmplY3Rvci52aXNpdChub2RlKTtcclxuICB9XHJcblxyXG4gIGFmdGVyUGFyc2UoXzogUGFyc2VyKTogdm9pZCB7IFxyXG4gICAgXy5zb3VyY2VzLmZvckVhY2goc291cmNlID0+IHRoaXMudmlzaXQoc291cmNlKSk7XHJcbiAgfVxyXG4gIFxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBUcmFuc2Zvcm1lcjsiXX0=