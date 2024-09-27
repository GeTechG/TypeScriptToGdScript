export default function gdTypeToTs(godotType: string): string {
    switch (godotType) {
        case "int":
        case "String":
            return godotType;
        case "float":
            return "number";
        case "bool":
            return "boolean";
        case "Array":
            return "any[]";
        case "Variant":
            return "any";
        default:
            if (godotType.startsWith("Transform2D")) return "Transform2D";
            if (godotType.match(/^[0-9]+$/)) return "int";
            if (godotType.match(/^[0-9]+\.[0-9]+$/)) return "float";
            if (godotType.includes("*")) return "any";
            return godotType;
    }
}