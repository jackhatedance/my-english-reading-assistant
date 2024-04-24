const siteConfigs = [
    {
        name:'default',
        //site match
        match: function(document){
            return true;
        },
        //top document config
        getDocumentConfig: function(window, document){
            let config = {
                window: window,
                document: document,
                canProcess: true,
            };
            return config;
        },
        //iframe document configs
        getIframeDocumentConfigs: function(document){
            let configs = [];
            searchSubIframesRecursively(document, (iframe)=>{
                if(isMeaIframe(iframe)){
                    return;
                }
                
                try {
                    
                    //try access window
                    let doc = iframe.contentWindow.document;
                  
                    let config = {
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
        },
        //timer to refresh page annotation peridonically
        needRefreshPageAnnotation(topDocument){
            return false;
        },
        //the url to identify the real page (could be in in iframe)
        getUrl(topDocument){
            return topDocument.location.href;
        }
    },
    {
        name:'epubjs',
        match: function(document){
            let found =false;

            const sites = ['app.flowoss.com'];
            for(let site of sites){
                let hostname = document.location.hostname;
                if(site===hostname){
                    return true;
                }
            }

            searchSubIframesRecursively(document, (iframe)=>{
                let id = iframe.id;
                if(id){
                    if(id.startsWith('epubjs')){
                        found = true;
                    }
                }
            });
            return found;
        },
        getDocumentConfig: function(window, document){
            let config = {
                window: window,
                document: document,
                canProcess: false,
            };
            return config;
        },
        getIframeDocumentConfigs: function(document){
            let configs = [];
            searchSubIframesRecursively(document, (iframe)=>{
                if(isMeaIframe(iframe)){
                    return;
                }

                let id = iframe.id;
                if(id && id.startsWith('epubjs')){
                    let config = {
                        document:iframe.contentDocument,
                        window: iframe.contentWindow,
                        canProcess: true
                    };
                    configs.push(config);
                }
            });

            //only support the first iframe
            if(configs.length>1){
                configs = [configs[0]];
            }
            return configs;
        },
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
        },
        getUrl(topDocument){
            let url = topDocument.location.href;

            let iframeDocuments = this.getIframeDocumentConfigs(topDocument);
            if(iframeDocuments.length > 0){
                url = iframeDocuments[0].document.baseURI;
            }
            return url;
        }
    },   

];

function searchSubIframesRecursively(document, visitor){
    let iframes = document.querySelectorAll('iframe');
    for(const iframe of iframes){
        if(iframe) {
            visitor(iframe);

            let iframeDocument = iframe.contentDocument;
            if(iframeDocument){
                searchSubIframesRecursively(iframeDocument, visitor);
            }
        }        
    }
}
function findSiteConfig(document){
    let result = siteConfigs[0];
    //descend order
    for(let i=siteConfigs.length;i--;i>0){
        let siteConfig = siteConfigs[i];
        if(siteConfig.match(document)){
            result = siteConfig;
            break;
        }
    }
    //console.log('find site config:'+result.name);
    return result;
}

function isMeaIframe(iframe){
    return (iframe.id==='mea-vueapp');    
}
export {findSiteConfig};