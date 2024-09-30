import ParseContext from "./context.js";
import ts from "typescript";
import {RENAME_ANNOTATIONS} from "../generate_library/annotations.js";
import {parseNode} from "./index.js";

const UNRENAME_MAP = Array.from(RENAME_ANNOTATIONS.entries()).reduce((map, [key, value]) => {
    map.set(value, key);
    return map;
}, new Map());

export default function parseDecorator(node: ts.Decorator, context: ParseContext): string {
    const expression = parseNode(node.expression, context);
    if (UNRENAME_MAP.has(expression)) {
        return UNRENAME_MAP.get(expression);
    }
    return expression;
}