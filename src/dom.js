'use strict';


function tranverseNode(node, visitor) {
    let result = visitor(node);

    if(node.childNodes){
       for (var i = 0; i < node.childNodes.length; i++) {
            let childNode = node.childNodes[i];
            tranverseNode(childNode, visitor);
        }
    }
}


function tranverseElement(element, visitor, parentFirst = true) {
    if(parentFirst){
      let result = visitor(element);
      if(result === 'stop'){
        return;
      }
    }  
  
    let children = element.children;
    
    for (const child of children) {
        tranverseElement(child, visitor, parentFirst);
    }
  
    if(!parentFirst){
        let result = visitor(element);
        if(result === 'stop'){
          return;
        }
    }
  }

export {tranverseElement, tranverseNode};