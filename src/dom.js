'use strict';


function tranverseNode(node, visitor) {
    let result = visitor(node);

    for (var i = 0; i < node.childNodes.length; i++) {
        let childNode = node.childNodes[i];
        tranverseNode(childNode, visitor);
    }
}

export {tranverseNode};