

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

function isMeaIframe(iframe){
    return (iframe.id==='mea-vueapp-iframe');    
}

export { searchSubIframesRecursively, isMeaIframe };