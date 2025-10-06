import * as XBBCODE from 'xbbcode-parser'
import { htmlToText } from 'html-to-text'

function xbbcToText(xbbc){
    var processResult = XBBCODE.process({
            text: xbbc,
            removeMisalignedTags: false,
            addInLineBreaks: false
            });
    const html = processResult.html;
    const text = htmlToText(html);
    return text;
}

export { xbbcToText }