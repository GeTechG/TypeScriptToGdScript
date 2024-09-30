import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";

export default function parsePropertyAccessExpression(node: ts.PropertyAccessExpression, context: ParseContext) {
    const expression = parseNode(node.expression, context);
    const name = parseNode(node.name, context);

    return `${expression}.${name}`;
}