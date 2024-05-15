import { searchSubIframesRecursively, isMeaIframe } from '../utils.js';

class DefaultDocumentConfig {
    //top document config
    getDocumentConfig(window, document) {
        let config = {
            window: window,
            document: document,
            canProcess: true,
        };
        return config;
    }

    //iframe document configs
    getIframeDocumentConfigs(document){
        let configs = [];
        searchSubIframesRecursively(document, (iframe)=>{
            if(isMeaIframe(iframe)){
                return;
            }
            
            try {
                
                //try access window
                let doc = iframe.contentWindow.document;
              
                let config = {
                    iframe: iframe,
                    document:iframe.contentDocument,
                    window: iframe.contentWindow,
                    canProcess: false
                };
                configs.push(config);
            } catch (error) {
                //console.log('iframe not accessible');
                //console.error(error);                    
            }
        });

        return configs;
    }
    //timer to refresh page annotation peridonically
    needRefreshPageAnnotation(topDocument){
        return false;
    }
    //the url to identify the real page (could be in in iframe)
    getUrl(topDocument){
        return topDocument.location.href;
    }
}

export {DefaultDocumentConfig};