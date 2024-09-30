import * as fs from "node:fs";
import ts from "typescript";
import type ParseContext from "./context.js";
import parseClass from "./class.js";
import parseMethod from "./method.js";
import parseSourceFile from "./source.js";
import parseCallExpression from "./call_expresion.js";
import parsePropertyDeclaration from "./property_declaration.js";
import parseVariableDeclaration from "./variable_declaration.js";
import parseVariableStatement from "./variable_statement.js";
import parseImportDeclaration from "./import_declaration.js";
import parseBinaryExpression from "./binary_expression.js";
import parsePropertyAccessExpression from "./property_access_expression.js";
import parseNewExpression from "./new_expression.js";
import parseDecorator from "./decorator.js";
import parseIfStatement from "./if_statement.js";
import {getLeadingComment} from "./utils.js";

export default function parse(tsFile: string, scriptsDirectory: string, projectPath: string): string {
    const content = fs.readFileSync(tsFile, 'utf-8');
    const schema = ts.createSourceFile(tsFile, content, ts.ScriptTarget.Latest, true);
    const context: ParseContext = {
        project_path: projectPath,
        out_directory: scriptsDirectory,
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
        case ts.SyntaxKind.ImportDeclaration:
            return parseImportDeclaration(node as ts.ImportDeclaration, context);
        case ts.SyntaxKind.ClassDeclaration:
            return parseClass(node as ts.ClassDeclaration, context);
        case ts.SyntaxKind.MethodDeclaration:
            return parseMethod(node as ts.MethodDeclaration, context);
        case ts.SyntaxKind.CallExpression:
            return parseCallExpression(node as ts.CallExpression, context);
        case ts.SyntaxKind.NewExpression:
            return parseNewExpression(node as ts.NewExpression, context);
        case ts.SyntaxKind.Decorator:
            return parseDecorator(node as ts.Decorator, context);
        case ts.SyntaxKind.SuperKeyword:
            return 'super';
        case ts.SyntaxKind.ReturnStatement: {
            const expression = (node as ts.ReturnStatement).expression;
            return expression ? `return ${parseNode(expression, context)}` : 'return';
        }
        case ts.SyntaxKind.PropertyAccessExpression: {
            return parsePropertyAccessExpression(node as ts.PropertyAccessExpression, context);
        }
        case ts.SyntaxKind.BinaryExpression:
            return parseBinaryExpression(node as ts.BinaryExpression, context);
        case ts.SyntaxKind.TypeReference:
            return parseNode((node as ts.TypeReferenceNode).typeName, context);
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
        case ts.SyntaxKind.StringKeyword:
            return 'String';
        case ts.SyntaxKind.NumberKeyword:
            return 'float';
        case ts.SyntaxKind.ExpressionStatement: {
            const comment = getLeadingComment(node, context);
            return comment + parseNode((node as ts.ExpressionStatement).expression, context);
        }
        case ts.SyntaxKind.IfStatement:
            return parseIfStatement(node as ts.IfStatement, context);
        default:
            console.warn(`Unparsed node: ${ts.SyntaxKind[node.kind]}`);
            return '';
    }
}