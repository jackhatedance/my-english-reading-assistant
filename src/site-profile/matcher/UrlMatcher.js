import {Matcher} from './Matcher.js';

class UrlMatcher extends Matcher {
    constructor(url) {
        let name = 'url:'+ url;
        super(name);

        this.url = url;
    } 
    
    match(document) {
        let url = document?.location?.href;
        console.log(`try url:${url} matching ${this.url}`);
        return url && url.startsWith(this.url);
    }

}

export { UrlMatcher };