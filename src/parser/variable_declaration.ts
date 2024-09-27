import ParseContext from "./context";
import ts from "typescript";
import {parseNode} from "./index";

export default function parseVariableDeclaration(node: ts.VariableDeclaration, context: ParseContext) {
    let out = '';
    const name = parseNode(node.name, context);
    out += context.const_counter > 0 ? 'const ' : 'var ';
    out += name;
    if (node.initializer) {
        out += ' = ' + parseNode(node.initializer, context);
    }
    return out;
}