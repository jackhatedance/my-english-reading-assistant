import { domainSiteConfig as _default } from './by-domain/default.js';
import { domainSiteConfig as reddit } from './by-domain/reddit.js';

const domainSiteConfigs = [
    reddit
];

function findSiteConfigByDomain(domain) {
    let searchResult = null;
    
    for (let i = 0; i < domainSiteConfigs.length; i++) {
        let siteConfig = domainSiteConfigs[i];
        if (match(domain, siteConfig)) {
            searchResult = siteConfig;
            break;
        }
    }
    //console.log('find site config:'+result.name);
    let result = null;
    if(searchResult) {
        result = assignDefaultFunctions(searchResult);
    }
    return result;
}

function match(domain, siteConfig) {
    return domain.endsWith(siteConfig.domain);
}

function assignDefaultFunctions(domainSiteConfig) {
    let siteConfig = Object.assign({}, _default, domainSiteConfig);
    siteConfig.name = 'domain:' + domainSiteConfig.domain;
    return siteConfig;
}

export { findSiteConfigByDomain };