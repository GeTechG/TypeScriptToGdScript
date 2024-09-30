export function sanitizeGodotNameForTs(
    name: string,
    type: "argument" | "property"
): string {
    const reservedKeywords = [
        "with", "var", "class", "enum", "default", "in",
        "function", "interface", "implements", "let"
    ];

    if (reservedKeywords.includes(name)) {
        return type === "argument" ? `_${name}` : `"${name}"`;
    }

    // for enum names in @GlobalScope
    name = name.replace(".", "_");

    // Bizarre case in SliderJoint3D.xml
    if (name.includes("/")) {
        return type === "argument" ? name.replace("/", "_") : `"${name}"`;
    }

    return name;
}

export function sanitizeGodotValueForTs(
    value: string,
    type: string
): string {
    if (type === "StringName") {
        return `'${value}'`;
    }

    return value;
}