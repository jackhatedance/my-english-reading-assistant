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
    return indexOfRule(styleSheet, '.mea-highlight::after') || indexOfRule(styleSheet, '.mea-highlight::before')
}

function generateCssRuleOfAnnotation(options, suffix, contentExpr) {

    let top = `${options.position * -1}em`;
    let fontSize = `${options.fontSize}em`;
    let opacity = `${options.opacity}`;
    let color = `${options.color}`;

    let rule = `.mea-highlight::${suffix} {
      content: ${contentExpr};
      position: absolute;
      width:max-content;
      line-height: 90%;
      text-indent: 0px;
      white-space: pre;
      left: 0;
      top: ${top};
      font-size: ${fontSize} !important;
      color: ${color};
      opacity: ${opacity};
    }`;
    return rule;
}

function generateCssRuleOfSubAnnotation(options, selector) {
    let top = `${(options.position * -1)/options.fontSize}em`;

    let rule = `${selector} {
      top: ${top};
    }`;
    return rule;
}

function generateCssRuleOfHighlight(options, extraStyle) {
    let annotationOptions = options.annotation;
    let contentOptions = options.content;

    let lineHeight = `line-height: ${annotationOptions.lineHeight}em !important;`;
    if(annotationOptions.lineHeight ==1){
        lineHeight = "";
    }

    let unknownWordWidthStyle = '';
    if(contentOptions.unknownWordWidth >1){
        // critical style to fix '::before' appear on end of previous line
        unknownWordWidthStyle = `padding-right: ${contentOptions.unknownWordWidth - 1}em !important;
            white-space: nowrap;
            `;
    }    

    //TEST
    /*
    options.content = {
        enabled: false,
        unknownWordColor: 'blue',
    };
    */

    let unknownWordColorStyle = '';
    if(contentOptions.enabled){
       unknownWordColorStyle = `color: ${contentOptions.unknownWordColor} !important;`;
    }

    let unknownWordStyle = unknownWordWidthStyle + unknownWordColorStyle;
    if(unknownWordStyle.length >0){
        unknownWordStyle = `
            &:not(.mea-hide) {
                ${unknownWordStyle}
            }`;
    }
    

    let rule = `.mea-highlight {  
      position: relative;
      margin-top: 0px;
      text-indent1: 0px;
      display1: inline-block;
      ${lineHeight}

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

function changeStyle(document, siteOptions, siteProfile) {
    let styleSheet = findStyleSheet(document);
    if (styleSheet) {

        changeAnnotationStyle(styleSheet, siteOptions.annotation, 'after');

        let annotation2 = siteOptions.dualAnnotationEnabled? siteOptions.secondaryAnnotation : null;
        changeAnnotationStyle(styleSheet, annotation2, 'before');
        
        //console.log('changed style, insert rule');

        //highlight, aka. text
        deleteStyleRule(styleSheet, '.mea-highlight');
        
        let highlighRule;
        if(siteProfile.generateCssRuleOfHighlight){
            highlighRule = siteProfile.generateCssRuleOfHighlight(siteOptions);
        }else{
            highlighRule = generateCssRuleOfHighlight(siteOptions);
        }
        
        styleSheet.insertRule(highlighRule, 0);
    }
}

function getContentExpr(content){
    if(content == 'AC_PRONUNCIATION'){
        return `attr(data-pronunciation)`;
    } else if(content == 'AC_DEFINITION'){
        return `attr(data-footnote-short)`;
    } else if(content == 'AC_PRONUNCIATION_AND_DEFINITION'){
        return `attr(data-pronunciation) attr(data-footnote-short)`;
    } else if(content == 'AC_PRONUNCIATION_AND_DEFINITION_NEW_LINE'){
        return `attr(data-pronunciation) "\\A" attr(data-footnote-short)`;
    }
}

function changeAnnotationStyle(styleSheet, annotationOptions, suffix) {

    let selectors = [`mea-token:nth-child(2n+1 of .mea-word)::${suffix}`,
        `mea-token:nth-child(2n of .mea-word)::${suffix}`];
    
    deleteStyleRule(styleSheet, `.mea-highlight::${suffix}`);

    deleteStyleRule(styleSheet, selectors[0]);
    deleteStyleRule(styleSheet, selectors[1]);

    if(annotationOptions) {
        let contentExpr = getContentExpr(annotationOptions.content);

        let rule = generateCssRuleOfAnnotation(annotationOptions, suffix, contentExpr);
        styleSheet.insertRule(rule, 0);

        let ruleOdd = generateCssRuleOfSubAnnotation(annotationOptions, selectors[0]);
        styleSheet.insertRule(ruleOdd, 0);

        const annotationOptions2 = JSON.parse(JSON.stringify(annotationOptions));
        if (annotationOptions.interlaced) {
            let numPosition = Number(annotationOptions.position);
            annotationOptions2.position = (numPosition + 1).toString();
        }

        let ruleEven = generateCssRuleOfSubAnnotation(annotationOptions2, selectors[1]);
        styleSheet.insertRule(ruleEven, 0);
    }
    
    //return rule;
}

export { changeStyle, findStyleSheet, indexOfMeaAnnotation, generateCssRuleOfHighlight };

