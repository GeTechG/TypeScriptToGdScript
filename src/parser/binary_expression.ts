import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";

export default function parseBinaryExpression(node: ts.BinaryExpression, context: ParseContext) {
    const left = parseNode(node.left, context);
    const right = parseNode(node.right, context);
    const operator = node.operatorToken.getText();
    return `${left} ${operator} ${right}`;
}