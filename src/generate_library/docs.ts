export default function parseDocs(input: string, append?: string): string {
    if (!input) {
        return `/** No documentation provided. */`;
    }

    let lines = input.split("\n");

    if (lines.length === 1) {
        return `/** ${input} ${append ? append : ""} */`;
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
        if (line.includes("[codeblock]") || line.includes("[codeblocks]")) {
            result += " * @example \n";
            insideCodeBlock = true;
        }

        if (line.includes("[/codeblock]") || line.includes("[/codeblocks]")) {
            result += " * @summary \n";
            insideCodeBlock = false;
        }

        line = line.replaceAll("[gdscript]", "")
                   .replaceAll("[/gdscript]", "")
                   .replaceAll("[csharp]", "")
                   .replaceAll("[/csharp]", "")
                   .replaceAll("[b]", "**")
                   .replaceAll("[/b]", "**")
                   .replaceAll("[i]", "**")
                   .replaceAll("[/i]", "**")
                   .replaceAll("[code]", "`")
                   .replaceAll("[/code]", "`")
                   .replaceAll("[codeblock]", "")
                   .replaceAll("[/codeblock]", "")
                   .replaceAll("[codeblocks]", "")
                   .replaceAll("[/codeblocks]", "")
                   .replaceAll("*/", ""); // This is the most fun edge case of all time - in RichTextLabel.xml

        result += " * " + line + "\n" + (!insideCodeBlock ? " *\n" : "");
    }

    result += append ? ` * ${append}\n` : "";
    result += "*/";

    return result;
}