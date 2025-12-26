const MERA_WEB_URL = 'https://mera.dingjianghao.com';

function getWebSiteDocumentUrl(path){
    return `${MERA_WEB_URL}/${path}`
}

function fixSiteDomain(domain){
    if(!domain){
        return 'local';
    }
    return domain;
}

export { getWebSiteDocumentUrl, fixSiteDomain }