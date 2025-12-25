import { getSiteOptions, } from './service/site-option-service.js';
import { searchBookByUrlAsync } from './service/bookService.js';

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

            siteOptions = await getSiteOptions(site);

            siteOptions.virtualSite = {
                path: subsiteName,
            };
        }

    }

    siteOptions.siteName = site;

    return siteOptions;
}

export { getCurrentSiteOptions, getCurrentSiteOptionsFromCache, initializeCurrentSiteOptionCache, refreshCurrentSiteOptionsCache }