'use strict';

const MEA_STYLE = "mea-style";


function containsMeaStyle(document) {
    let styleSheet = findStyleSheet(document);
    if (styleSheet) {
        let index = indexOfMeaAnnotation(styleSheet);
        if (index >= 0) {
            return true;
        }
    }
    return false;
}

function findStyleSheet(document) {
    for (let sheet of document.styleSheets) {
        if (sheet.ownerNode.id == MEA_STYLE) {
            return sheet;
        }
    }
    return null;
}

function removeMeaStyle(document) {
  document.getElementById(MEA_STYLE).remove();
}

function addMeaStyle(document) {
    
    //dynamic style
    var style = document.createElement("style");    
    style.id = MEA_STYLE;
    style.innerHTML = `    
      .mea-sentence {
        
        &::before {
          content: '[';
        }
        &::after {
          content: ']';
        }
      }

      .mea-nonword {
        display:inline !important;
      }

      .mea-highlight {  
        position: relative;
        margin-top: 0px;
        text-indent1: 0px;
        display1: inline-block;
      }

      .mea-highlight { 
        &.mea-hide {
          &::after {
            visibility: hidden;
          }
          &::before {
            visibility: hidden;
          }
        }

      }


      .mea-highlight::after {
        content: attr(data-footnote-short);
        position: absolute;
        width: max-content;
        line-height: normal;
        text-indent: 0px;
        
        white-space: nowrap;
        left: 0;
        font-size: 0.5em;
        color: grey;
        opacity: 0.5;
        visibility: hidden;
      }

      mea-token:nth-child(2n+1 of .mea-word)::after {        
        top: -1.5em;        
      }
      
      mea-token:nth-child(2n of .mea-word)::after {        
        top: -2.5em;        
      }


      .mea-toolbar {
        position: absolute;
        visibility: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        width: auto;
        height:auto;
        background: white;
        text-align: center;
        color: black;
        z-index: 100;

      }

      .mea-toolbar-button {
        border: none;
        margin-right: 2px;
        padding:0px;
        padding-inline: none;
        background: white;

        
      }

      .mea-icon {
        width: 16px;
        height: 16px;

      }

      ::highlight(user-1-highlight) {
        background-color: rgb(255, 241, 92);
        color: black;
      }
      #mea-vue-container * {
        all: revert;
      }
      #mea-vue-container {
        background: #efefef;
        border: none;
        border-radius: 10px;
        box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
        width: fit-content;
        height: fit-content;
        padding: 0px;
        #mea-vueapp-iframe {
          width: 500px;
          height: 520px;
          border: none;
        }

        #vue {
          width: 400px;
          
        }
      }

      #mea-definition-tooltip {
        position: absolute;
        min-width: 20px;
        max-width: 400px;
        background-color: rgb(226, 225, 225);
        color: black;
        border-radius: 4px;
        border: 1px solid black !important;
        font-size: 14px;
        visibility: hidden;
        z-index: 9999;
        padding: 2px;
      }

    `;
    document.getElementsByTagName("head")[0].appendChild(style);
    //console.log('add style');
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
        return `attr(data-pronunciation) " " attr(data-footnote-short)`;
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
            annotationOptions2.position = (numPosition + 1 * annotationOptions.fontSize).toString();
        }

        let ruleEven = generateCssRuleOfSubAnnotation(annotationOptions2, selectors[1]);
        styleSheet.insertRule(ruleEven, 0);
    }
    
    //return rule;
}

export { addMeaStyle, removeMeaStyle, changeStyle, findStyleSheet, containsMeaStyle, indexOfMeaAnnotation, generateCssRuleOfHighlight };

