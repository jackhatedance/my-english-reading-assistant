'use strict';



async function getDefaultSiteOptions(){

    let options = await loadSiteOptionsFromStorage('default');
    if(!options){
        options = {
            enabled: false,
            annotation: {
                fontSize: 0.4,
                position: 0.5,        
                opacity: 0.3,
                color: '#808080',
            }
        };
    }
    return options;
    
}

function loadSiteOptionsFromStorage(siteDomain){
    return new Promise(resolve => {
        chrome.storage.local.get(['sitesOptions'], (result) => {
            //console.log('load sitesOptions:'+JSON.stringify(result.sitesOptions));
            
            let siteOptions = undefined;
            if(result.sitesOptions){
                siteOptions = result.sitesOptions[siteDomain];
            }
            
            resolve(siteOptions);
        });
    });
}

function saveSiteOptionsToStorage(siteDomain, options){
    
    return new Promise(resolve => {
        chrome.storage.local.get(['sitesOptions'], (result) => {
            let sitesOptions = result.sitesOptions;
            if(!sitesOptions){
                sitesOptions = {};
            }
            sitesOptions[siteDomain] = options;

            let object = {sitesOptions: sitesOptions};
            //console.log('save sitesOptions:'+JSON.stringify(sitesOptions));
            chrome.storage.local.set(object, resolve);
        });
    });    
}


function setSiteOptionsAsDefault(options){
    setSiteOptions('default', options);
}

async function getSiteOptions(siteDomain){
    
    let options = await loadSiteOptionsFromStorage(fixSiteDomain(siteDomain));
    if(!options){
        options = await getDefaultSiteOptions();
    };
    return options;
}

function setSiteOptions(siteDomain, options){
    return saveSiteOptionsToStorage(fixSiteDomain(siteDomain), options);
}

function fixSiteDomain(domain){
    if(!domain){
        return 'nosite';
    }
    return domain;
}

export {getDefaultSiteOptions, getSiteOptions, setSiteOptions, setSiteOptionsAsDefault};