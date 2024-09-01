'use strict';



function findStyleSheet(document) {
    for (let sheet of document.styleSheets) {
        if (sheet.title === 'mea-style') {
            return sheet;
        }
    }
    return null;
}

function indexOfMeaAnnotation(styleSheet) {
    try {
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
            let rule = styleSheet.cssRules[i];
            if (rule.selectorText === '.mea-highlight::after') {
                return i;
            }
        }


    }
    catch (error) {
        console.log(error);
    }

    return -1;
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


function indexOfMeaHighlight(styleSheet) {
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
        let rule = styleSheet.cssRules[i];
        if (rule.selectorText === '.mea-highlight') {
            return i;
        }
    }
    return -1;
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

function changeStyle(document, options, siteProfile) {
    let styleSheet = findStyleSheet(document);
    if (styleSheet) {
        //annotation
        let index = indexOfMeaAnnotation(styleSheet);
        //console.log('changed style, index:' + index);
        if (index >= 0) {
            styleSheet.deleteRule(index);
            //console.log('changed style, delete rule');
        }
        let rule = generateCssRuleOfAnnotation(options.annotation);
        styleSheet.insertRule(rule, 0);
        //console.log('changed style, insert rule');

        //highlight, aka. text
        index = indexOfMeaHighlight(styleSheet);
        if (index >= 0) {
            styleSheet.deleteRule(index);
        }

        if(siteProfile.generateCssRuleOfHighlight){
            rule = siteProfile.generateCssRuleOfHighlight(options);
        }else{
            rule = generateCssRuleOfHighlight(options);
        }
        
        styleSheet.insertRule(rule, 0);
    }
}



export { changeStyle, findStyleSheet, indexOfMeaAnnotation, generateCssRuleOfHighlight };