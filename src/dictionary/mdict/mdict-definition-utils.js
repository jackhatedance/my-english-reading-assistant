
function getEntryFromLink(href){
    let matchResult = href.match(/.*:\/\/(.*)/);
    if(matchResult && matchResult.length>1){
      let entry = matchResult[1];
      return entry;
    }
}

function getLink(raw) {
  if(raw){
      let matchResult = raw.trim().match(/^@@@LINK=(.*)\r*\n*\u0000*$/);
      if(matchResult){
          return matchResult[1];
      }
  }
  return null;    
}

export { getEntryFromLink, getLink }