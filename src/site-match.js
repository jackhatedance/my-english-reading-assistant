const siteConfigs = [
    {
        name:'default',
        match: function(document){
            return true;
        },
        getDocumentConfig: function(document){
            let config = {
                document: document,
                canProcess: true,
            };
            return config;
        },
        getIframeDocumentConfigs: function(document){
            let iframes = document.querySelectorAll('iframe');
            let configs = [];
            for(const iframe of iframes){
                if(iframe && iframe.contentDocument) {
                    let config = {
                        document:iframe.contentDocument,
                        canProcess: true
                    };
                    configs.push(config);
                }
            }
            return configs;
        },
        needRefreshPageAnnotation(topDocument){
            return false;
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
        getDocumentConfig: function(document){
            let config = {
                document: document,
                canProcess: false,
            };
            return config;
        },
        getIframeDocumentConfigs: function(document){
            let configs = [];
            searchSubIframesRecursively(document, (iframe)=>{
                let id = iframe.id;
                if(id && id.startsWith('epubjs')){
                    let config = {
                        document:iframe.contentDocument,
                        canProcess: true
                    };
                    configs.push(config);
                }
            });

            return configs;
        },
        needRefreshPageAnnotation(topDocument){
            let topVisible = topDocument.body.getAttribute('mea-visible');
            if(!topVisible){
                return false;
            }

            let iframes = document.querySelectorAll('iframe');
            let configs = [];
            for(const iframe of iframes){
                if(iframe) {
                    let iframeVisible = iframe?.contentDocument?.body?.getAttribute('mea-visible');
                    if(topVisible != iframeVisible){
                        return true;
                    }              
                }
            }
            return false;
        }
    },
    {
        name:'fviewer',
        match: function(document){
            let iframes = document.querySelectorAll('iframe');
            let isFrmview = Array.from(iframes).some((iframe)=>{
                let id = iframe.id;
                if(id){
                return id.startsWith('convertfrmview');
                }
            });
            return false;
        },
        getDocumentConfig: function(document){
            let config = {
                document: document,
                canProcess: false,
            };
            return config;
        },
        getIframeDocumentConfigs: function(document){
            let fviewerIframe = document.querySelector('iframe');
            
            let iframes = fviewerIframe.contentDocument.querySelectorAll('iframe');
            let configs = [];
            for(const iframe of iframes){
                if(iframe) {
                    let config = {
                        document:iframe.contentDocument,
                        canProcess: true
                    };
                    configs.push(config);
                }
            }
            return configs;
        },
        needRefreshPageAnnotation(topDocument){
            let topVisible = topDocument.body.getAttribute('mea-visible');
            if(!topVisible){
                return false;
            }

            let iframes = document.querySelectorAll('iframe');
            let configs = [];
            for(const iframe of iframes){
                if(iframe) {
                    let iframeVisible = iframe?.contentDocument?.body?.getAttribute('mea-visible');
                    if(topVisible != iframeVisible){
                        return true;
                    }              
                }
            }
            return false;
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
export {findSiteConfig};