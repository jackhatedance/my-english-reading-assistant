import { isLeafTextTag, TAGS_NOT_LOG, isInMeaElement } from '../html.js';

const IGNORE_TAGS = [
    'BUTTON'
];
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
    ignoreDomChange(mutation){
        return this._config.ignoreDomChange(mutation);
    }
    //the url to identify the real page (could be in in iframe)
    getUrl(topDocument){
        return this._config.getUrl(topDocument);
    }

    getTagsNotLog(){
        return TAGS_NOT_LOG;
    }

    isLeafTextElement(element){
        return isLeafTextTag(element.nodeName);
    }

    
    canElementBeTokenized(element){
        //avoid re-enter
        if (isInMeaElement(element)) {
            return false;
        }

        let tag = element.nodeName;
        if(IGNORE_TAGS.includes(tag)){
            return false;
        }
        return true;
    }

    canNodeBeTokenized(node){
        let textContent = node.textContent;
        if(!textContent || textContent.trim().length === 0) {
            return false;//blank
        }

        //some tags are not tokenizable, such as style, script, etc.
        if (!this.isLeafTextElement(node.parentElement)) {
            const tagsNotLog = this.getTagsNotLog();
            if(!tagsNotLog.includes(node.parentElement.nodeName.toUpperCase())){
                console.log('not text element:'+ node.parentElement.nodeName+ ', textContent:'+textContent);
            }
            
            return false;
        }
        
        return true;
    }
};

export { DefaultSiteProfile };