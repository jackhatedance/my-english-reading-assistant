import { IframeSiteConfig } from './IframeSiteConfig.js'

class EpubjsSiteConfig extends IframeSiteConfig {
    matchIframe(iframe){
        let id = iframe.id;
        return id && id.startsWith('epubjs');
    }

    getUrl(topDocument){
        let url = topDocument.location.href;
        let title = topDocument.title;
        let iframeDocuments = this.getIframeDocumentConfigs(topDocument);
        if(iframeDocuments.length > 0){
            url = iframeDocuments[0].document.baseURI;
        }

        const urlObj1 = new URL(url);
        let urlObj2 = new URL(`/#${title}${urlObj1.pathname}${urlObj1.search}`, url);


        return urlObj2.toString();
    }
}

export {EpubjsSiteConfig};