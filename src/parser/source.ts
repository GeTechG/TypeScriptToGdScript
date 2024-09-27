import ts from "typescript";
import ParseContext from "./context";
import {NotEmptyStringFiltered} from "../utils";
import {parseNode} from "./index";

function formatSourceFile(className: string | undefined, _extends: string | undefined, statements: string): string {
    let result = '';
    if (className) {
        result += `class_name ${className}\n`;
    }
    if (_extends) {
        result += `extends ${_extends}\n`;
    }
    result += '\n' + statements;
    return result;
}

export default function parseSourceFile(node: ts.SourceFile, context: ParseContext) {
    const statements = node.statements
        .map(statement => parseNode(statement, context))
        .filter(NotEmptyStringFiltered)
        .join('\n');
    return formatSourceFile(context.class_name, context.extends, statements);
}