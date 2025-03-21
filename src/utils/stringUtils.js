
function trimByCharacters(str, chars) {
    const escapedChars = chars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`^[${escapedChars}]+|[${escapedChars}]+$`, 'g');
    return str.replace(regex, '');
}

export { trimByCharacters }