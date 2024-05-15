import { searchSubIframesRecursively, isMeaIframe } from './utils.js';

class DefaultSiteProfile {
    
    constructor(name, matcher, config) {
        this._name = name;
        this._matcher = matcher;
        this._config = config;
    } 
    
    get name() {
        return this._name;
    }

    match(document){
        return this._matcher.match(document);
    }

    //top document config
    getDocumentConfig(window, document) {
        
        return this._config.getDocumentConfig(window, document);
    }

    //iframe document configs
    getIframeDocumentConfigs(document){
        
        return this._config.getIframeDocumentConfigs(document);
    }
    //timer to refresh page annotation peridonically
    needRefreshPageAnnotation(topDocument){
        return this._config.needRefreshPageAnnotation(topDocument);
    }
    //the url to identify the real page (could be in in iframe)
    getUrl(topDocument){
        return this._config.getUrl(topDocument);
    }
};

export { DefaultSiteProfile };