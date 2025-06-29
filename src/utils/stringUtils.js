
function trimByCharacters(str, chars) {
    const escapedChars = chars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`^[${escapedChars}]+|[${escapedChars}]+$`, 'g');
    return str.replace(regex, '');
}

function commonStart(str1, str2) {
    let result = "";
    const minLength = Math.min(str1.length, str2.length);
  
    for (let i = 0; i < minLength; i++) {
      if (str1[i] === str2[i]) {
        result += str1[i];
      } else {
        break;
      }
    }
    return result;
}

function isAllUpperCase(entry){
    return (entry && entry.match(/[^a-z]+/));
}

export { trimByCharacters, commonStart, isAllUpperCase }