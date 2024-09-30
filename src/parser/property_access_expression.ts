import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";

const EXPRESSION_MAP = new Map([
    ['Math.PI', 'PI']
]);

export default function parsePropertyAccessExpression(node: ts.PropertyAccessExpression, context: ParseContext) {
    const expression = parseNode(node.expression, context);
    const name = parseNode(node.name, context);
    const out = `${expression}.${name}`;
    if (out.startsWith('godot.')) {
        return out.substring(6);
    }
    if (EXPRESSION_MAP.has(out)) {
        return EXPRESSION_MAP.get(out) as string;
    }
    return out;
}