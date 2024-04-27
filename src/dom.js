'use strict';


function traverseNode(node, visitor) {
    let result = visitor(node);

    if(node.childNodes){
       for (var i = 0; i < node.childNodes.length; i++) {
            let childNode = node.childNodes[i];
            traverseNode(childNode, visitor);
        }
    }
}


function traverseElement(element, visitor, parentFirst = true) {
    if(parentFirst){
      let result = visitor(element);
      if(result === 'stop'){
        return;
      }
    }  
  
    let children = element.children;
    
    for (const child of children) {
        traverseElement(child, visitor, parentFirst);
    }
  
    if(!parentFirst){
        let result = visitor(element);
        if(result === 'stop'){
          return;
        }
    }
  }

export {traverseElement, traverseNode};