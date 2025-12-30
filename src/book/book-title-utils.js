
/**
 * e.g. A Clash of Kings (George R. R. Martin) (Z-Library).epub
 * @param title 
 */
function parsePageTitle(text){
    
    //ZlibBook
    let p1 = /(?<title>.+) \((?<author>[^)]+)\) \(Z-Library\)\.epub/;
    let p2 = /(?<title>.+) \((?<author>[^)]+) \(Z-Library\)\.epub/;
    let p3 = /(?<title>.+) \(Z-Library\)\.epub/;
    
    let p4 = /(?<title>.+)\.epub/;

    let patterns = [p1,p2,p3, p4];
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

function createUrlPattern(url, level=1){
    if(level==0){
        return url;
    }

    let index = nthLastIndexOf("/", level, url);
    let asterisks = level==1? "*" : "**";
    let pattern = url.substring(0, index+1) + asterisks;

    return pattern;
}

function nthLastIndexOf(searchString, n, url) {
    if (url === null) return -1;
    let index = url.lastIndexOf(searchString);
    while (n > 1 && index !== -1) {
        index = url.lastIndexOf(searchString, index - 1);
        n--;
    }
    return index;
}

export { parsePageTitle, createUrlPattern }