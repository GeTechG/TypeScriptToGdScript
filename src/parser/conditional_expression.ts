import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";

export default function parseConditionalExpression(node: ts.ConditionalExpression, context: ParseContext) {
    const condition = parseNode(node.condition, context);
    const whenTrue = parseNode(node.whenTrue, context);
    const whenFalse = parseNode(node.whenFalse, context);
    return `${whenTrue} if ${condition} else ${whenFalse}`;
}