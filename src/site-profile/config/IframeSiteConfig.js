import { searchSubIframesRecursively, isMeaIframe } from '../utils.js';
import {DefaultSiteConfig} from './DefaultSiteConfig.js';

class IframeSiteConfig extends DefaultSiteConfig {

    //abstract method
    matchIframe(iframe){
        return false;
    }

    getDocumentConfig(window, document){
        let config = {
            window: window,
            document: document,
            canProcess: false,
        };
        return config;
    }

    getIframeDocumentConfigs(document){
        let configs = [];
        searchSubIframesRecursively(document, (iframe)=>{
            if(isMeaIframe(iframe)){
                return;
            }

            if(this.matchIframe(iframe)){
                let config = {
                    iframe: iframe,
                    document:iframe.contentDocument,
                    window: iframe.contentWindow,
                    canProcess: true
                };
                configs.push(config);
            }
        });

        
        return configs;
    }

    needRefreshPageAnnotation(topDocument){
        let topVisible = topDocument.body.getAttribute('mea-visible');
        if(!topVisible){
            return false;
        }
        
        let iframeConfigs = this.getIframeDocumentConfigs(topDocument);
        for(const iframeConfig of iframeConfigs){
            if(iframeConfig) {
                let iframeVisible = iframeConfig.document?.body?.getAttribute('mea-visible');
                if(topVisible != iframeVisible){
                    return true;
                }              
            }
        }
        return false;
    }
    
    getUrl(topDocument){
        let url = topDocument.location.href;

        let iframeDocuments = this.getIframeDocumentConfigs(topDocument);
        if(iframeDocuments.length > 0){
            url = iframeDocuments[0].document.baseURI;
        }
        return url;
    }

}

export {IframeSiteConfig};