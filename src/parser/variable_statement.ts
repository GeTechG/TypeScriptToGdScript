import ParseContext from "./context";
import ts from "typescript";
import {parseNode} from "./index";
import {NotEmptyStringFiltered} from "../utils";

export default function parseVariableStatement(node: ts.VariableStatement, context: ParseContext) {
    let declarationList = (node as ts.VariableStatement).declarationList;
    const isConst = (declarationList.flags & ts.NodeFlags.Const) !== 0;
    if (isConst) {
        context.const_counter++;
    }
    let declarations = declarationList.declarations
        .map(declaration => parseNode(declaration, context))
        .filter(NotEmptyStringFiltered)
        .join('\n');
    if (isConst) {
        context.const_counter--;
    }
    return declarations;
}