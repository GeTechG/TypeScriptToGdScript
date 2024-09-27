export function sanitizeGodotNameForTs(
    name: string,
    type: "argument" | "property"
): string {
    if (
        name === "with" ||
        name === "var" ||
        name === "class" ||
        name === "enum" ||
        name === "default" ||
        name === "in" ||
        name === "function" ||
        name === "interface" ||
        name === "implements" ||
        name === "let"
    ) {
        if (type === "argument") {
            return "_" + name
        } else {
            return `"${name}"`
        }
    }

    // for enum names in @GlobalScope
    name = name.replace(".", "_")

    // Bizarre case in SliderJoint3D.xml
    if (name.includes("/")) {
        if (type === "argument") {
            return name.replace("/", "_")
        } else {
            return `"${name}"`
        }
    }

    return name
}

export function sanitizeGodotValueForTs(
    value: string,
    type: string
): string {
    if (type === "StringName") {
        return `'${value}'`
    }

    return value
}