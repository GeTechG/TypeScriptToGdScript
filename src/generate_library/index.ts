import generateClasses from "./classes";

export default function generateLibrary(godotSourceDirectory: string) {
    let classes = generateClasses(godotSourceDirectory);
    return [...classes];
}