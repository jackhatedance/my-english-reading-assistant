import { MEA_TAG_PREFIX } from '../html.js';
import log from 'loglevel'


const gLogger = log.getLogger("mutation-observer");

function createMutationObserver(document, page){
  const { siteProfile } = page;
  //DOM mutation changes
  
  const config = { attributes: false, childList: true, subtree: true };
  const callback = (mutationList, observer) => {
    let domChangesStart = page.domChanges;
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        //console.log("A child node has been added or removed.");
        //console.log(mutation);
        let addedNodeTextContentArray = [];
        for(let node of mutation.addedNodes){
          if(node.textContent && node.textContent != ''){
            addedNodeTextContentArray.push(node.textContent);
          }          
        }
        let addedNodeTextContents = '';
        if(addedNodeTextContentArray.length>0){
          addedNodeTextContents = addedNodeTextContentArray.join('')
        } 

        const minContentChangeSize = 10;
        let addedNodeTextContentsLength = addedNodeTextContents.length;
        let ignoreAddedNodeTextContentsSmallChange = addedNodeTextContentsLength < minContentChangeSize;
        
        //skip the mutations that triggered by itself.
        let triggeredByTokenize = mutation.addedNodes.length > 0 && mutation.addedNodes[0].nodeName.startsWith(MEA_TAG_PREFIX);
        
        let targetId = mutation.target?.id;
        let triggeredInMeaElement = false;
        if(targetId){
          triggeredInMeaElement = targetId.toUpperCase().startsWith(MEA_TAG_PREFIX);
        }
        
        let triggeredBySelf = triggeredByTokenize || triggeredInMeaElement;
        let siteIgnoreDomChange = siteProfile.ignoreDomChange(mutation, addedNodeTextContents);
        if(!triggeredBySelf && !ignoreAddedNodeTextContentsSmallChange && !siteIgnoreDomChange){
          gLogger.debug(addedNodeTextContents);
          gLogger.debug(mutation);
          page.domChanges ++;
        }        
      } else if (mutation.type === "attributes") {
        //console.log(`The ${mutation.attributeName} attribute was modified.`);
      }
    }
    let domChangesCount = page.domChanges - domChangesStart;
    if(domChangesCount>0){
      //console.log(`MutationObserver find DOM changes: ${domChangesCount}`);
    }    
  };
  let observer = new MutationObserver(callback);
  return observer;
}

export { createMutationObserver }