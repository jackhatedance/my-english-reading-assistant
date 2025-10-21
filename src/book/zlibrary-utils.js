
/**
 * e.g. A Clash of Kings (George R. R. Martin) (Z-Library).epub
 * @param title 
 */
function parseZlibBookTitle(text){
    
    let p1 = /(?<title>.+) \((?<author>[^)]+)\) \(Z-Library\)\.epub/;
    let p2 = /(?<title>.+) \((?<author>[^)]+) \(Z-Library\)\.epub/;
    let p3 = /(?<title>.+) \(Z-Library\)\.epub/;

    let patterns = [p1,p2,p3];
    for(let item of patterns){
        let matchResult = match(text, item);
        if(matchResult){
            return matchResult;
        }
    }
}

function match(text, pattern) {
    let matchResult = text.match(pattern);
    if(matchResult != null){
        let title = matchResult.groups.title;
        let author = matchResult.groups.author;
        
        return { title, author };            
    }
}

export { parseZlibBookTitle }