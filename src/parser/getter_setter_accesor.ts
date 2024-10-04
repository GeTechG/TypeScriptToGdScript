import ParseContext from "./context.js";
import ts from "typescript";
import {bodyString, getLeadingComment, parseStatement} from "./utils.js";
import {parseNode} from "./index.js";

export default function parseGetterSetterAccessor(node: ts.AccessorDeclaration, context: ParseContext): string {
    if (context.parsed_nodes.has(node)) {
        return '';
    }
    const declarations = (node as unknown as ts.Type).symbol ? (node as unknown as ts.Type).symbol.declarations : undefined;
    if (!declarations) {
        return '';
    }

    let getter = '';
    let setter = '';
    let getterFunction = '';
    let setterFunction = '';

    declarations.forEach(declaration => {
        if (ts.isGetAccessor(declaration)) {
            context.parsed_nodes.add(declaration);
            const getterName = `get_${declaration.name.getText()}`;
            context.method_stack.push({ method_name: getterName });
            const body = declaration.body ?
                declaration.body.kind === ts.SyntaxKind.Block ? parseStatement(declaration.body as ts.Block, context) : `return ${parseNode(declaration.body, context)}` :
                '';
            context.method_stack.pop();
            getter = getterName;
            const comment = getLeadingComment(declaration, context);
            getterFunction = `${comment}func ${getterName}():\n${bodyString(body)}`;
        } else if (ts.isSetAccessor(declaration)) {
            context.parsed_nodes.add(declaration);
            const setterName = `set_${declaration.name.getText()}`;
            context.method_stack.push({ method_name: setterName });
            const body = declaration.body ?
                declaration.body.kind === ts.SyntaxKind.Block ? parseStatement(declaration.body as ts.Block, context) : `return ${parseNode(declaration.body, context)}` :
                '';
            context.method_stack.pop();
            setter = setterName;
            const comment = getLeadingComment(declaration, context);
            setterFunction = `${comment}func ${setterName}(value):\n${bodyString(body)}`;
        }
    });

    const propertyName = node.name.getText();
    let result = `var ${propertyName}:\n`;
    if (getter) {
        result += `\tget = ${getter}`;
    }
    if (setter) {
        if (getter) {
            result += `, `;
        }
        result += `set = ${setter}`;
    }

    result += `\n\n${getterFunction}${setterFunction}`;
    return result;
}