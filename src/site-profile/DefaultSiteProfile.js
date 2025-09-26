import { isLeafTextTag, IGNORED_TAGS, containsTag, isInMeaElement, hasAnyId, hasAnyClass } from '../html.js';


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
        let canBeTokenized = this.canElementBeTokenized(mutation.target);
        return !canBeTokenized;
    }
    //the url to identify the real page (could be in in iframe)
    getUrl(topDocument){
        return this._config.getUrl(topDocument);
    }

    isLeafTextElement(element){
        return isLeafTextTag(element.nodeName);
    }

    isIgnoredElement(element, ignoredTags, ignoredIds, ignoredClasses){
        if(ignoredTags){
            if(containsTag(ignoredTags, element.nodeName)) {
                return true;
            }
        }

        if(ignoredIds){
            if(hasAnyId(element, ignoredIds)) {
                return true;
            }
        }

        if(ignoredClasses){
            if(hasAnyClass(element, ignoredClasses)){
                return true;
            }
        }

        return false;
    }

    canElementBeTokenized(element){
        //avoid re-enter
        if (isInMeaElement(element)) {
            return false;
        }

        const ignoredTags = IGNORED_TAGS;
        const ignoredIds = [];
        const ignoredClasses = [];
        if(this.isIgnoredElement(element, ignoredTags, ignoredIds, ignoredClasses)){
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
            console.log('not text element:'+ node.parentElement.nodeName+ ', textContent:'+textContent);
            
            return false;
        }
        
        return true;
    }
};

export { DefaultSiteProfile };