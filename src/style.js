'use strict';



function findStyleSheet(document) {
    for (let sheet of document.styleSheets) {
        if (sheet.ownerNode.id === 'mea-style') {
            return sheet;
        }
    }
    return null;
}


function indexOfRule(styleSheet, selector) {
    try {
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
            let rule = styleSheet.cssRules[i];
            if (rule.selectorText === selector) {
                return i;
            }
        }


    }
    catch (error) {
        console.log(error);
    }

    return -1;
}

function indexOfMeaAnnotation(styleSheet) {
    return indexOfRule(styleSheet, '.mea-highlight::after')
}

function generateCssRuleOfAnnotation(options) {

    let top = `${options.position * -1}em`;
    let fontSize = `${options.fontSize}em`;
    let opacity = `${options.opacity}`;
    let color = `${options.color}`;

    let rule = `.mea-highlight::after {
      content: attr(data-footnote-short);
      position: absolute;
      width:max-content;
      line-height: normal;
      text-indent: 0px;
      white-space: nowrap;
      left: 0;
      top: ${top};
      font-size: ${fontSize} !important;
      color: ${color};
      opacity: ${opacity};
    }`;
    return rule;
}

function generateCssRuleOfSubAnnotation(options, selector) {
    let top = `${options.position * -1}em`;

    let rule = `${selector} {
      top: ${top};
    }`;
    return rule;
}

function generateCssRuleOfHighlight(options, extraStyle) {
    let annotationOptions = options.annotation;
    let contentOptions = options.content;

    let lineHeight = `${annotationOptions.lineHeight}em`;

    //TEST
    /*
    options.content = {
        enabled: false,
        unknownWordColor: 'blue',
    };
    */

    let unknownWordStyle = '';
    if(contentOptions.enabled){
        unknownWordStyle = `
            &:not(.mea-hide) {
                color: ${contentOptions.unknownWordColor} !important;
            }`;
    }
    

    let rule = `.mea-highlight {  
      position: relative;
      margin-top: 0px;
      text-indent1: 0px;
      display1: inline-block;
      line-height: ${lineHeight} !important;

      ${unknownWordStyle}

      ${extraStyle}
    }`;
    return rule;
}

function deleteStyleRule(styleSheet, selector){
    let index = indexOfRule(styleSheet, selector);
    //console.log('changed style, index:' + index);
    if (index >= 0) {
        styleSheet.deleteRule(index);
        //console.log('changed style, delete rule');
    }    
}

function changeStyle(document, options, siteProfile) {
    let styleSheet = findStyleSheet(document);
    if (styleSheet) {
        deleteStyleRule(styleSheet, '.mea-highlight::after');
        let rule = generateCssRuleOfAnnotation(options.annotation);
        styleSheet.insertRule(rule, 0);

        let selectors = ['mea-token:nth-child(2n+1 of .mea-word)::after',
            'mea-token:nth-child(2n of .mea-word)::after'];

        deleteStyleRule(styleSheet, selectors[0]);
        deleteStyleRule(styleSheet, selectors[1]);
        
        
        let ruleOdd = generateCssRuleOfSubAnnotation(options.annotation, selectors[0]);
        styleSheet.insertRule(ruleOdd, 0);

        if(options.annotation.interlaced){
            let numPosition = Number(options.annotation.position)
            options.annotation.position = (numPosition + 1).toString();
        }
        
        let ruleEven = generateCssRuleOfSubAnnotation(options.annotation, selectors[1]);
        styleSheet.insertRule(ruleEven, 0);
        
        //console.log('changed style, insert rule');

        //highlight, aka. text
        deleteStyleRule(styleSheet, '.mea-highlight');
        
        if(siteProfile.generateCssRuleOfHighlight){
            rule = siteProfile.generateCssRuleOfHighlight(options);
        }else{
            rule = generateCssRuleOfHighlight(options);
        }
        
        styleSheet.insertRule(rule, 0);
    }
}



export { changeStyle, findStyleSheet, indexOfMeaAnnotation, generateCssRuleOfHighlight };