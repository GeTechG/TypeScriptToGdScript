import ts from "typescript";
import ParseContext from "./context.js";
import {backtrace} from "./utils.js";
import {parseNode} from "./index.js";
import dataClasses from "../data/data_classes.json" assert {type: "json"};

function formatNewExpression(expression: string, args: string, isNoNewClass: boolean): string {
    return isNoNewClass ? `${expression}(${args})` : `${expression}.new(${args})`;
}

export default function parseNewExpression(node: ts.NewExpression, context: ParseContext): string {
    console.assert(context.const_counter === 0, backtrace(node, context) + ' Constants are not allowed in new expressions');
    const expression = parseNode((node as ts.NewExpression).expression, context);
    const args = ((node as ts.NewExpression).arguments || []).map(arg => parseNode(arg, context)).join(', ');
    const isNoNewClass = dataClasses.includes(expression);
    return formatNewExpression(expression, args, isNoNewClass);
}