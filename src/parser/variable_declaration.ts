import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";

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