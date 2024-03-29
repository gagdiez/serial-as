import { ASTTransformVisitor } from "visitor-as";
import { MethodInjector } from "./methodInjector.js";
export default class Transformer extends ASTTransformVisitor {
    visitClassDeclaration(node) {
        MethodInjector.visit(node);
    }
    afterParse(_) {
        _.sources.forEach(source => this.visit(source));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFnQyxtQkFBbUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUvRSxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFNbkQsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQUFZLFNBQVEsbUJBQW1CO0lBQzFELHFCQUFxQixDQUFDLElBQXNCO1FBQ3hDLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELFVBQVUsQ0FBQyxDQUFTO1FBQ2xCLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7Q0FFRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENsYXNzRGVjbGFyYXRpb24sIFBhcnNlciwgQ29tbW9uRmxhZ3MgfSBmcm9tIFwiYXNzZW1ibHlzY3JpcHQvZGlzdC9hc3NlbWJseXNjcmlwdC5qc1wiO1xyXG5pbXBvcnQgeyByZWdpc3RlckRlY29yYXRvciwgRGVjb3JhdG9yLCBBU1RUcmFuc2Zvcm1WaXNpdG9yIH0gZnJvbSBcInZpc2l0b3ItYXNcIjtcclxuXHJcbmltcG9ydCB7TWV0aG9kSW5qZWN0b3J9IGZyb20gXCIuL21ldGhvZEluamVjdG9yLmpzXCI7XHJcbmltcG9ydCB7IGdldE5hbWUsIGlzTGlicmFyeSwgbm90IH0gZnJvbSBcInZpc2l0b3ItYXMvZGlzdC91dGlscy5qc1wiO1xyXG5pbXBvcnQgeyBpc1N0ZGxpYiB9IGZyb20gXCIuL3V0aWxzLmpzXCI7XHJcblxyXG5cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYW5zZm9ybWVyIGV4dGVuZHMgQVNUVHJhbnNmb3JtVmlzaXRvciB7XHJcbiAgdmlzaXRDbGFzc0RlY2xhcmF0aW9uKG5vZGU6IENsYXNzRGVjbGFyYXRpb24pOiB2b2lkIHtcclxuICAgICAgTWV0aG9kSW5qZWN0b3IudmlzaXQobm9kZSk7XHJcbiAgfVxyXG5cclxuICBhZnRlclBhcnNlKF86IFBhcnNlcik6IHZvaWQgeyBcclxuICAgIF8uc291cmNlcy5mb3JFYWNoKHNvdXJjZSA9PiB0aGlzLnZpc2l0KHNvdXJjZSkpO1xyXG4gIH1cclxuICBcclxufVxyXG4iXX0=