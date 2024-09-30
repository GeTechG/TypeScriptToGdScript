import ts from "typescript";
import ParseContext from "./context.js";
import {backtrace} from "./utils.js";
import {parseNode} from "./index.js";

const NO_NEW_CLASSES = ['Vector2', 'Vector2i', 'Vector3', 'Vector3i', 'Rect2', 'AABB', 'Plane', 'Quat', 'Transform', 'Basis', 'Color', 'NodePath'];

function formatNewExpression(expression: string, args: string, isNoNewClass: boolean): string {
    return isNoNewClass ? `${expression}(${args})` : `${expression}.new(${args})`;
}

export default function parseNewExpression(node: ts.NewExpression, context: ParseContext): string {
    console.assert(context.const_counter === 0, backtrace(node, context) + ' Constants are not allowed in new expressions');
    const expression = parseNode((node as ts.NewExpression).expression, context);
    const args = ((node as ts.NewExpression).arguments || []).map(arg => parseNode(arg, context)).join(', ');
    const isNoNewClass = NO_NEW_CLASSES.includes(expression);
    return formatNewExpression(expression, args, isNoNewClass);
}