
export function bodyString(content: string) {
    if (!content || content.trim() === '') {
        return '\tpass';
    }
    return content
        .split('\n')
        .map(line => `\t${line}`)
        .join('\n');
}