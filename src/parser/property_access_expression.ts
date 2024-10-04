import ParseContext from "./context.js";
import ts from "typescript";
import {parseNode} from "./index.js";
import {getDeclarationNode} from "./utils.js";

// const EXPRESSION_MAP = new Map([
//     ['Math.PI', 'PI'],
//     ['Math.abs', 'abs'],
// ]);

export default function parsePropertyAccessExpression(node: ts.PropertyAccessExpression, context: ParseContext) {
    const expression = parseNode(node.expression, context);
    let name = parseNode(node.name, context);

    const declaration = getDeclarationNode(node.expression, context.program);
    if (declaration && (ts.isPropertyDeclaration(declaration) || ts.isVariableDeclaration(declaration) || ts.isParameter(declaration))) {
        if (declaration.type?.kind === ts.SyntaxKind.ArrayType) {
            switch (name) {
                case 'push':
                    name = 'push_back';
                    break;
                case 'indexOf':
                    name = 'find';
                    break;
                case 'includes':
                    name = 'has';
                    break;
                case 'shift':
                    name = 'pop_front';
                    break;
                case 'length':
                    name = 'size()';
                    break;
            }
        }
    }

    const out = `${expression}.${name}`;
    if (out.startsWith('godot.')) {
        return out.substring(6);
    }
    if (out === 'performance.now') {
        return 'Time.get_ticks_msec';
    }
    if (out === 'Math.random') {
        return 'randf';
    }
    if (out.startsWith('Math.')) {
        return out.substring(5);
    }
    if (out === 'Array.from') {
        return 'ArrayUtils.from';
    }
    return out;
}