import { createFactoryDefaultSiteOptions, patchDefaultSiteOptionValues } from '../options/defaultSiteOptionValues.js';
import assign from 'assign-deep'


async function getDefaultSiteOptions(){

    let options = await loadSiteOptionsFromStorage('default');
    if(!options){
        options = createFactoryDefaultSiteOptions();
    }
    
    
    patchDefaultSiteOptionValues(options);
    
    //make sure new site options switch mode is empty, that means default
    delete options.enabled;
    options.switch.mode='';

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

async function getAllSiteOptions(){
    let result = await chrome.storage.local.get(['sitesOptions']);

    let sitesOptions = result?.sitesOptions;
    if(sitesOptions != null){
        for (const [key, value] of Object.entries(sitesOptions)) {
            //console.log(key);
            patchDefaultSiteOptionValues(value);
        }
    }
    
    return sitesOptions;
}
/**
 * 
 * @param {*} siteDomain 
 * @param {*} options delete if null
 * @returns 
 */
function saveSiteOptionsToStorage(siteDomain, options){
    //console.log('save site options, domain:'+siteDomain+',options:'+options);
    return new Promise(resolve => {
        chrome.storage.local.get(['sitesOptions'], (result) => {
            let sitesOptions = result.sitesOptions;
            if(!sitesOptions){
                sitesOptions = {};
            }

            if(options !=null){
                sitesOptions[siteDomain] = options;
            }else{
                delete sitesOptions[siteDomain];
            }
            

            let object = {sitesOptions: sitesOptions};
            console.log('save sitesOptions:'+JSON.stringify(sitesOptions));
            chrome.storage.local.set(object, resolve);
        });
    });    
}



function setSiteOptionsAsDefault(options){
    setSiteOptions('default', options);
}


function getEffectiveSiteOptions(siteOptions, defaultSiteOptions){
    let effectiveOptions = assign(defaultSiteOptions, siteOptions);

    patchDefaultSiteOptionValues(effectiveOptions);

    //migrateSiteOptions(effectiveOptions);

    return effectiveOptions;
}

function fixSiteDomain(domain){
    if(!domain){
        return 'NULL';
    }
    return domain;
}

async function getSiteOptions(siteDomain){
    
    let options = await loadSiteOptionsFromStorage(fixSiteDomain(siteDomain));
    if(!options){
        options ={};
    }

    let defaultSiteOptions = await getDefaultSiteOptions();
    
    
    let effectiveOptions = getEffectiveSiteOptions(options, defaultSiteOptions);

    return effectiveOptions;
}

function setSiteOptions(siteDomain, options){
    return saveSiteOptionsToStorage(fixSiteDomain(siteDomain), options);
}


function getSimplifyDefinitionOptions(sysOptions, siteOptions){
    let hideWordClass = sysOptions.annotation.hideWordClass.enabled && siteOptions.annotation.hideWordClass;
    let simplifyDefinitionOptions = {
        hideWordClass: hideWordClass,
        maxMeaningNumber: siteOptions.annotation.maxMeaningNumber,
    };
    return simplifyDefinitionOptions;
}

function createSimplifyDefinitionOptions(maxMeaningNumber = 6, hideWordClass = false){
    let simplifyDefinitionOptions = {
        hideWordClass: hideWordClass,
        maxMeaningNumber: maxMeaningNumber,
    };
    return simplifyDefinitionOptions;
}


export { getDefaultSiteOptions, getAllSiteOptions, getSiteOptions, setSiteOptions, setSiteOptionsAsDefault, getSimplifyDefinitionOptions, createSimplifyDefinitionOptions, getEffectiveSiteOptions }