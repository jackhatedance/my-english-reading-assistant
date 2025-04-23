
function getEntryFromLink(href){
    let matchResult = href.match(/.*:\/\/(.*)/);
    if(matchResult && matchResult.length>1){
      let entry = matchResult[1];
      return entry;
    }
}

function isAllUpperCaseEntry(entry){
    return (entry && entry.match(/[^a-z]+/));
}

export { getEntryFromLink, isAllUpperCaseEntry }