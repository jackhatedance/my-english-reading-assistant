const domainSiteConfig = {
    domain : 'reddit.com',
    generateCssRuleOfHighlight: (options) => {

        let lineHeight = `${options.lineHeight}em`;
    
        let rule = `.mea-highlight {  
          position: relative;
          margin-top: 0px;
          text-indent1: 0px;
          display1: inline-block;
          line-height: ${lineHeight} !important;
          visibility: visible !important;
        }`;
        return rule;
    }
};

export { domainSiteConfig };