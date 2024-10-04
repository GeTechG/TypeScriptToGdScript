import ts from "typescript";
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
import {bodyString, getLeadingComment, parseStatement} from "./utils.js";
import parseConditionalExpression from "./conditional_expression.js";
import parseConstructor from "./constructor.js";
import parsePropertyAssignment from "./property_assignment.js";
import parseForOfStatement from "./for_of_statement.js";
import ParseContext, {FeaturesCollectionsContext} from "./context.js";
import parseIdentifier from "./identifier.js";
import parseArrayLiteralExpression from "./array_literal_expression.js";
import parseGetterSetterAccessor from "./getter_setter_accesor.js";
import parseForStatement from "./for_statement.js";

export interface ParseOptions {
    source: ts.SourceFile;
    program: ts.Program;
    features: FeaturesCollectionsContext;
    scriptsDirectory: string;
    scriptPath: string;
    projectPath: string;
}

export default function parse(options: ParseOptions): string {
    const { source, program, features, scriptsDirectory, projectPath } = options;

    const context: ParseContext = {
        project_path: projectPath,
        script_path: options.scriptPath,
        out_directory: scriptsDirectory,
        const_counter: 0,
        features,
        parsed_nodes: new Set(),
        lambdas_nodes: new Set(),
        class_stack: [],
        method_stack: [],
        custom_declares: [],
        program,
    };

    return parseNode(source, context);
}

export function parseNode(node: ts.Node, context: ParseContext): string {
    switch (node.kind) {
        case ts.SyntaxKind.SourceFile:
            return parseSourceFile(node as ts.SourceFile, context);
        case ts.SyntaxKind.ImportDeclaration:
            return parseImportDeclaration(node as ts.ImportDeclaration, context);
        case ts.SyntaxKind.ClassDeclaration:
            return parseClass(node as ts.ClassDeclaration, context);
        case ts.SyntaxKind.InterfaceDeclaration:
            return '';
        case ts.SyntaxKind.Constructor:
            return parseConstructor(node as ts.ConstructorDeclaration, context);
        case ts.SyntaxKind.MethodDeclaration:
            return parseMethod(node as ts.MethodDeclaration, context);
        case ts.SyntaxKind.ArrowFunction:
            return parseMethod(node as ts.MethodDeclaration, context);
        case ts.SyntaxKind.FunctionDeclaration:
            return parseMethod(node as ts.FunctionDeclaration, context);
        case ts.SyntaxKind.CallExpression:
            return parseCallExpression(node as ts.CallExpression, context);
        case ts.SyntaxKind.NewExpression:
            return parseNewExpression(node as ts.NewExpression, context);
        case ts.SyntaxKind.ObjectLiteralExpression: {
            const properties = (node as ts.ObjectLiteralExpression).properties.map(property => parseNode(property, context)).join(', ');
            return `{${properties}}`;
        }
        case ts.SyntaxKind.PropertyAssignment:
            return parsePropertyAssignment(node as ts.PropertyAssignment, context);
        case ts.SyntaxKind.ShorthandPropertyAssignment: {
            const name = parseNode((node as ts.ShorthandPropertyAssignment).name, context);
            return `"${name}": ${name}`;
        }
        case ts.SyntaxKind.PropertyAccessExpression:
            return parsePropertyAccessExpression(node as ts.PropertyAccessExpression, context);
        case ts.SyntaxKind.ConditionalExpression:
            return parseConditionalExpression(node as ts.ConditionalExpression, context);
        case ts.SyntaxKind.PropertyDeclaration:
            return parsePropertyDeclaration(node as ts.PropertyDeclaration, context);
        case ts.SyntaxKind.VariableStatement:
            return parseVariableStatement(node as ts.VariableStatement, context);
        case ts.SyntaxKind.VariableDeclaration:
            return parseVariableDeclaration(node as ts.VariableDeclaration, context);
        case ts.SyntaxKind.VariableDeclarationList:
            return (node as ts.VariableDeclarationList).declarations.map(declaration => parseNode(declaration, context)).join('\n');
        case ts.SyntaxKind.TypeAliasDeclaration:
            return '';
        case ts.SyntaxKind.BinaryExpression:
            return parseBinaryExpression(node as ts.BinaryExpression, context);
        case ts.SyntaxKind.AsExpression: {
            const expression = parseNode((node as ts.AsExpression).expression, context);
            const type = parseNode((node as ts.AsExpression).type, context);
            return `${expression} as ${type}`;
        }
        case ts.SyntaxKind.AwaitExpression: {
            const expression = parseNode((node as ts.AwaitExpression).expression, context);
            return `await ${expression}`;
        }
        case ts.SyntaxKind.PrefixUnaryExpression: {
            const operator = ts.tokenToString((node as ts.PrefixUnaryExpression).operator);
            const operand = parseNode((node as ts.PrefixUnaryExpression).operand, context);
            return `${operator}${operand}`;
        }
        case ts.SyntaxKind.ArrayLiteralExpression:
            return parseArrayLiteralExpression(node as ts.ArrayLiteralExpression, context);
        case ts.SyntaxKind.ParenthesizedExpression: {
            const expression = parseNode((node as ts.ParenthesizedExpression).expression, context);
            return `(${expression})`;
        }
        case ts.SyntaxKind.ElementAccessExpression: {
            const expression = parseNode((node as ts.ElementAccessExpression).expression, context);
            const argument = parseNode((node as ts.ElementAccessExpression).argumentExpression, context);
            return `${expression}[${argument}]`;
        }
        case ts.SyntaxKind.PostfixUnaryExpression: {
            let operator = ts.tokenToString((node as ts.PostfixUnaryExpression).operator);
            if (operator === '++') {
                operator = '+= 1';
            } else if (operator === '--') {
                operator = '-= 1';
            }
            const operand = parseNode((node as ts.PostfixUnaryExpression).operand, context);
            return `${operand}${operator}`;
        }
        case ts.SyntaxKind.NonNullExpression:
            return parseNode((node as ts.NonNullExpression).expression, context);
        case ts.SyntaxKind.TypeReference:
            return parseNode((node as ts.TypeReferenceNode).typeName, context);
        case ts.SyntaxKind.ArrayType: {
            let subType = parseNode((node as ts.ArrayTypeNode).elementType, context);
            if (subType.startsWith('Array[')) {
                subType = 'Variant';
            }
            return `Array[${subType}]`;
        }
        case ts.SyntaxKind.UnionType:
            return 'Variant';
        case ts.SyntaxKind.FunctionType:
            return 'Callable';
        case ts.SyntaxKind.ExpressionStatement: {
            const expression = parseNode((node as ts.ExpressionStatement).expression, context);
            const comment = getLeadingComment(node, context);
            const custom_declaration = context.custom_declares.length > 0 ? context.custom_declares.join('\n') + '\n' : '';
            context.custom_declares = [];
            return comment + custom_declaration + expression;
        }
        case ts.SyntaxKind.ReturnStatement: {
            const expression = (node as ts.ReturnStatement).expression;
            return expression ? `return ${parseNode(expression, context)}` : 'return';
        }
        case ts.SyntaxKind.IfStatement:
            return parseIfStatement(node as ts.IfStatement, context);
        case ts.SyntaxKind.ForOfStatement:
            return parseForOfStatement(node as ts.ForOfStatement, context);
        case ts.SyntaxKind.ForStatement:
            return parseForStatement(node as ts.ForStatement, context);
        case ts.SyntaxKind.WhileStatement: {
            const whileNode = node as ts.WhileStatement;
            const expression = parseNode(whileNode.expression, context);
            const body = ts.isBlock(whileNode.statement) ? parseStatement(whileNode.statement, context) : `${parseNode(whileNode.statement, context)}`;
            return `while ${expression}:\n${bodyString(body)}`;
        }
        case ts.SyntaxKind.Decorator:
            return parseDecorator(node as ts.Decorator, context);
        case ts.SyntaxKind.GetAccessor || ts.SyntaxKind.SetAccessor:
            return parseGetterSetterAccessor(node as ts.AccessorDeclaration, context);
        case ts.SyntaxKind.SuperKeyword:
            return 'super';
        case ts.SyntaxKind.ThisKeyword:
            return 'self';
        case ts.SyntaxKind.TrueKeyword:
            return 'true';
        case ts.SyntaxKind.FalseKeyword:
            return 'false';
        case ts.SyntaxKind.StringLiteral:
            return (node as ts.StringLiteral).getText();
        case ts.SyntaxKind.NumericLiteral:
            return (node as ts.NumericLiteral).text;
        case ts.SyntaxKind.Identifier:
            return parseIdentifier(node as ts.Identifier, context);
        case ts.SyntaxKind.StringKeyword:
            return 'String';
        case ts.SyntaxKind.NumberKeyword:
            return 'float';
        case ts.SyntaxKind.BooleanKeyword:
            return 'bool';
        case ts.SyntaxKind.VoidKeyword:
            return 'void';
        case ts.SyntaxKind.NullKeyword:
            return 'null';
        default:
            console.warn(`Unparsed node: ${ts.SyntaxKind[node.kind]}`);
            return '';
    }
}