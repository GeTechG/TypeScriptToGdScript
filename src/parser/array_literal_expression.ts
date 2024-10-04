import ts from "typescript";
import ParseContext from "./context.js";
import {parseNode} from "./index.js";

export default function parseArrayLiteralExpression(node: ts.ArrayLiteralExpression, context: ParseContext): string {
    const elements = node.elements;
    let result = '';
    let currentArray: string[] = [];
    let temp_arr_name: string | undefined;

    elements.forEach(element => {
        if (ts.isSpreadElement(element)) {
            if (!temp_arr_name) {
                temp_arr_name = 'arr_' + node.pos;
                context.custom_declares.push(`const ${temp_arr_name} = [${currentArray.join(', ')}]`);
            } else {
                context.custom_declares.push(`${temp_arr_name}.append_array([${currentArray.join(', ')}])`);
            }
            currentArray = [];
            context.custom_declares.push(`${temp_arr_name}.append_array(${parseNode(element.expression, context)})`);
        } else {
            currentArray.push(parseNode(element, context));
        }
    });

    if (!temp_arr_name) {
        result = `[${currentArray.join(', ')}]`;
    } else {
        if (currentArray.length > 0) {
            context.custom_declares.push(`${temp_arr_name}.append_array([${currentArray.join(', ')}])`);
        }
        result = temp_arr_name
    }

    return result;
}