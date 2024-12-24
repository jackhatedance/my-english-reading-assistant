'use strict'

// set image size

import {visit} from 'unist-util-visit';



function transform (tree) {

  function visitor (node) {
    const { tagName, properties: { src, srcSet, alt } } = node;

    if (tagName !== 'img' || typeof alt !== 'string' || srcSet) return;

    let kv = alt.match(/{.*}/);
    console.log(kv);
    if(kv){
        let exp = kv[0].substring(1, kv[0].length-1);
        let obj = parse(exp);

        if(obj.width){
            node.properties.width = obj.width;
        }
        if(obj.height){
            node.properties.height = obj.height;
        }

        //remove from alt
        node.properties.alt = node.properties.alt.replace(/{.*}/, '');
    }
    
  }

  visit(tree, ['element'], visitor)
}

function parse(str){
    //console.log('parse:'+str);
    //const str = "name1=value1&name2=value2";
    const obj = {};

    str.split(";").forEach(pair => {
        const [key, value] = pair.split("=");
        obj[key] = value;
    });
    return obj;
}
function rehypeImageSize () {
  return transform
}

export default rehypeImageSize;