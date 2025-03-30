import { lookup } from 'mime-types'
/**
 * url('fonts/ProximaNova-Thin-webfont-v2.woff') format('woff') 
 * -> 
 * url('data:font/woff; base64,[base64 string here]') format('woff')
 * @param {*} css 
 * @param {*} getResource 
 */
function replaceFontFaceSrcUrlWithDataUrl(css, getResource){
    return css.replaceAll(/url\('(.*)'\)\s*format\('(.*)'\)/g, (match, p1, p2) => {
        let path = p1;
        let format = p2;

        let resourceKey =  `\\${path}`;

        let mimeType = lookup(path);
        let base64 = getResource(resourceKey);

        let result = `url('data:${mimeType}; base64,${base64}') format('${format}')`;
        return result;
    });
}

function eliminateFontFaces(css){
    return css.replaceAll(/@font-face\s*\{[^}]*}/g, '');
}

function createDataUrl(path, getResource){    
    let mimeType = lookup(path);
    let base64 = getResource(path);

    let result = `data:${mimeType}; base64,${base64}`;
    return result;
}

export { replaceFontFaceSrcUrlWithDataUrl, eliminateFontFaces, createDataUrl }