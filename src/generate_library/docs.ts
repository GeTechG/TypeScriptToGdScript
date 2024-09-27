export default function parseDocs(input: string): string {
    if (!input) {
        return `/** No documentation provided. */`;
    }

    let lines = input.split("\n");

    if (lines.length === 1) {
        return `/** ${input} */`;
    }

    const indentationLength = lines[1].length - lines[1].trimStart().length;

    // All lines are indented except the first one for some reason.
    lines = [
        lines[0],
        ...lines.slice(1).map((line) => line.slice(indentationLength)),
    ];

    lines = lines.filter((line) => line.trim() !== "");

    let result = "/**\n";

    let insideCodeBlock = false;

    for (let line of lines) {
        if (line.includes("[codeblock]")) {
            result += " * @example \n";
            insideCodeBlock = true;
        }

        if (line.includes("[/codeblock]")) {
            result += " * @summary \n";
            insideCodeBlock = false;
        }

        if (line.includes("[codeblocks]")) {
            result += " * @example \n";
            insideCodeBlock = true;
        }

        if (line.includes("[/codeblocks]")) {
            result += " * @summary \n";
            insideCodeBlock = false;
        }

        line = line.replaceAll("[gdscript]", "");
        line = line.replaceAll("[/gdscript]", "");
        line = line.replaceAll("[csharp]", "");
        line = line.replaceAll("[/csharp]", "");
        line = line.replaceAll("[b]", "**");
        line = line.replaceAll("[/b]", "**");
        line = line.replaceAll("[i]", "**");
        line = line.replaceAll("[/i]", "**");
        line = line.replaceAll("[code]", "`");
        line = line.replaceAll("[/code]", "`");
        line = line.replaceAll("[codeblock]", "");
        line = line.replaceAll("[/codeblock]", "");
        line = line.replaceAll("[codeblocks]", "");
        line = line.replaceAll("[/codeblocks]", "");

        // This is the most fun edge case of all time - in RichTextLabel.xml
        line = line.replaceAll("*/", "");

        result += " * " + line + "\n" + (!insideCodeBlock ? " *\n" : "");
    }

    result += "*/";

    return result;
}