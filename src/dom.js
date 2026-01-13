'use strict';


function traverseNode(node, visitor) {
    let result = visitor(node);
    if(result === 'stop'){
      return;
    }
    
    if(node.childNodes){
       //copy children, in case children were modified during traverse
      var children = Array.from(node.childNodes);
      for (var i = 0; i < children.length; i++) {
          let childNode = children[i];
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