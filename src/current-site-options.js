import { getSiteOptions, } from './service/site-option-service.js';
import { searchBookByUrlAsync } from './service/bookService.js';

const RUNTIME_KEY = '_runtime';

var gCurrentSiteOptions;


/**
 * DON'T import it from popup.js, I don't know why. otherwise the project cannot be built.
 * @returns 
 */


async function initializeCurrentSiteOptionCache(siteProfile){
    gCurrentSiteOptions = await getCurrentSiteOptions(siteProfile);
}

async function refreshCurrentSiteOptionsCache(currentSiteOptions) {
    gCurrentSiteOptions = currentSiteOptions;
}

function getCurrentSiteOptionsFromCache() {
    return gCurrentSiteOptions;
}

async function getCurrentSiteOptions(siteProfile) {
    let siteDomain = document.location.hostname;
    let site = siteDomain;
    
    let siteOptions = await getSiteOptions(site);
    siteOptions.virtualSite = null;

    if(siteOptions.site.virtualSiteEnabled == true){
        let url = siteProfile.getUrl(document);
        let book = await searchBookByUrlAsync(url);
        if(book){
            let subsiteName = book.title;
            site = `${siteDomain}/${subsiteName}`;

            siteOptions = await getSiteOptions(site, siteDomain);

            //book site must not be a virtual site
            siteOptions.site.virtualSiteEnabled = false;

            setRuntimeOptions(siteOptions, "virtualSite", 
                {
                    path: subsiteName,
                }
            );
            
        }

    }

    siteOptions.siteName = site;

    return siteOptions;
}

function setRuntimeOptions(siteOptions, key, subOptions){
    
    if(siteOptions[RUNTIME_KEY]==null){
       siteOptions[RUNTIME_KEY] = {};
    }
    const runtime = siteOptions[RUNTIME_KEY];
    runtime[key] = subOptions;
}

function getRuntimeOptions(siteOptions, key){
    const runtime = siteOptions[RUNTIME_KEY];

    let value = runtime? runtime[key]: null;
    return value;
}

export { getCurrentSiteOptions, getCurrentSiteOptionsFromCache, initializeCurrentSiteOptionCache, refreshCurrentSiteOptionsCache }