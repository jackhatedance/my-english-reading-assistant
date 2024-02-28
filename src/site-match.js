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
                if(iframe) {
                    let config = {
                        document:iframe.contentDocument,
                        canProcess: true
                    };
                    configs.push(config);
                }
            }
            return configs;
        }
    },
    {
        name:'epubjs',
        match: function(document){
            let iframes = document.querySelectorAll('iframe');
            let isEpubjs = Array.from(iframes).some((iframe)=>{
                let id = iframe.id;
                if(id){
                return id.startsWith('epubjs');
                }
            });
            return isEpubjs;
        },
        getDocumentConfig: function(document){
            let config = {
                document: document,
                canProcess: false,
            };
            return config;
        },
        getIframeDocumentConfigs: function(document){
            let iframes = document.querySelectorAll('iframe');
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
        }
    },

];

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
    console.log('find site config:'+result.name);
    return result;
}
export {findSiteConfig};