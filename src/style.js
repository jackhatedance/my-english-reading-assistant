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
      content: attr(data-footnote);
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

function generateCssRuleOfHighlight(options) {

    let lineHeight = `${options.lineHeight}em`;

    let rule = `.mea-highlight {  
      position: relative;
      margin-top: 0px;
      text-indent: 0px;
      display: inline-block;
      line-height: ${lineHeight} !important;
    }`;
    return rule;
}

function changeStyle(document, options) {

    let styleSheet = findStyleSheet(document);
    if (styleSheet) {
        //annotation
        let index = indexOfMeaAnnotation(styleSheet);
        if (index >= 0) {
            styleSheet.deleteRule(index);
        }
        let rule = generateCssRuleOfAnnotation(options);
        styleSheet.insertRule(rule, 0);
        //console.log('changed style of a document');

        //highlight, aka. text
        index = indexOfMeaHighlight(styleSheet);
        if (index >= 0) {
            styleSheet.deleteRule(index);
        }
        rule = generateCssRuleOfHighlight(options);
        styleSheet.insertRule(rule, 0);
    }
}



export { changeStyle, findStyleSheet, indexOfMeaAnnotation };