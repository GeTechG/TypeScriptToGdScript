import * as fs from "node:fs";
import ts from "typescript";
import ParseContext from "./context.js";
import parseClass from "./class.js";
import parseMethod from "./method.js";
import parseSourceFile from "./source.js";
import parseCallExpression from "./call_expresion.js";
import parsePropertyDeclaration from "./property_declaration.js";
import parseVariableDeclaration from "./variable_declaration.js";
import parseVariableStatement from "./variable_statement.js";

export default function parse(tsFile: string) {
    const content = fs.readFileSync(tsFile, 'utf-8');
    const schema = ts.createSourceFile(tsFile, content, ts.ScriptTarget.Latest, true);
    const context: ParseContext = {
        const_counter: 0,
        class_stack: [],
        method_stack: []
    };
    return parseNode(schema, context);
}

export function parseNode(node: ts.Node, context: ParseContext): string {
    switch (node.kind) {
        case ts.SyntaxKind.SourceFile:
            return parseSourceFile(node as ts.SourceFile, context);
        case ts.SyntaxKind.ClassDeclaration:
            return parseClass(node as ts.ClassDeclaration, context);
        case ts.SyntaxKind.MethodDeclaration:
            return parseMethod(node as ts.MethodDeclaration, context);
        case ts.SyntaxKind.CallExpression:
            return parseCallExpression(node as ts.CallExpression, context);
        case ts.SyntaxKind.PropertyAccessExpression: {
            const expression = parseNode((node as ts.PropertyAccessExpression).expression, context);
            const name = parseNode((node as ts.PropertyAccessExpression).name, context);
            return `${expression}.${name}`;
        }
        case ts.SyntaxKind.PropertyDeclaration:
            return parsePropertyDeclaration(node as ts.PropertyDeclaration, context);
        case ts.SyntaxKind.VariableStatement:
            return parseVariableStatement(node as ts.VariableStatement, context);
        case ts.SyntaxKind.VariableDeclaration:
            return parseVariableDeclaration(node as ts.VariableDeclaration, context);
        case ts.SyntaxKind.StringLiteral:
            return `"${(node as ts.StringLiteral).text}"`;
        case ts.SyntaxKind.NumericLiteral:
            return (node as ts.NumericLiteral).text;
        case ts.SyntaxKind.Identifier:
            return (node as ts.Identifier).text;
        case ts.SyntaxKind.ThisKeyword:
            return 'self';
        case ts.SyntaxKind.TrueKeyword:
            return 'true';
        case ts.SyntaxKind.FalseKeyword:
            return 'false';
        case ts.SyntaxKind.ExpressionStatement:
            return parseNode((node as ts.ExpressionStatement).expression, context);
        default:
            console.warn(`Unparsed node: ${ts.SyntaxKind[node.kind]}`);
            return '';
    }
}