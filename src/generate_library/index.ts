import generateClasses from "./classes.js";

export default function generateLibrary(godotSourceDirectory: string) {
    const classes = generateClasses(godotSourceDirectory);
    return [...classes];
}