import {XMLParser} from "fast-xml-parser";
import parseDocs from "./docs";
import path from "node:path";
import {getAllFiles} from "../utils";
import fs from "node:fs";
import synchronizedPrettier from "@prettier/sync";
import parseFunctions from "./functions";
import parseClassMethods, {ClassMethod} from "./methods";
import parseClassMembers, {ClassMember} from "./members";
import parseSingletons from "./singletons";

const CLASSES_PATH = 'doc/classes';
const GDSCRIPT_PATH = 'modules/gdscript/doc_classes';

const SKIP_CLASSES = ['float', 'int', 'bool'];

const parser = new XMLParser({
    ignoreAttributes: false,
    isArray: (tagName) => {
        return tagName === 'method' || tagName === 'param' || tagName === 'member';
    }
});

interface XmlClassData {
    description: string;
    methods?: {
        method: ClassMethod[];
    };
    members?: {
        member: ClassMember[];
    };
    "@_name": string;
    "@_inherits"?: string;
}

export default function generateClasses(godotSourceDir: string) {
    const fullClassesPath = path.join(godotSourceDir, CLASSES_PATH);
    const fullGdscriptPath = path.join(godotSourceDir, GDSCRIPT_PATH);

    const classFiles = getAllFiles(fullClassesPath, '.xml');
    const gdscriptFiles = getAllFiles(fullGdscriptPath, '.xml');

    const allFiles = [...classFiles, ...gdscriptFiles].filter(file =>
        !SKIP_CLASSES.includes(path.basename(file, '.xml'))
    );

    return allFiles.map(file => {
        const xmlContent = fs.readFileSync(file, 'utf-8');
        const parsedContent = parser.parse(xmlContent).class as XmlClassData;
        const isGlobalScope = parsedContent["@_name"].startsWith("@");

        let output = `declare module "godot" {\n`;

        if (!isGlobalScope) {
            output += `${parseDocs(parsedContent.description)}\n`;
            output += `export class ${parsedContent["@_name"]}`;

            if (parsedContent["@_inherits"]) {
                output += ` extends ${parsedContent["@_inherits"]}`;
            }

            output += ' {\n';
        }

        const members = parsedContent.members?.member || [];
        const methods = parsedContent.methods?.method || [];

        if (isGlobalScope) {
            output += parseSingletons(members);
            output += parseFunctions(methods);
        } else {
            output += parseClassMembers(members);
            output += parseClassMethods(methods);
        }

        if (!isGlobalScope) {
            output += '}\n';
        }

        output += '}';
        return [parsedContent["@_name"], synchronizedPrettier.format(output, { parser: 'typescript' })];
    });
}