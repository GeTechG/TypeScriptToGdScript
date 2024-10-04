import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";

export default function parsePropertyAssignment(node: ts.PropertyAssignment, context: ParseContext) {
    const name = parseNode(node.name, context);
    const initializer = parseNode(node.initializer, context);
    if (node.name.kind === ts.SyntaxKind.NumericLiteral) {
        return `${name}: ${initializer}`;
    }
    return `"${name}": ${initializer}`;
}