import log from 'loglevel'

function initLog(){
    log.setDefaultLevel('info');
    log.getLogger("mera").setLevel("warn");
    //article is about tokenize text
    log.getLogger("article").setLevel("info");
    log.getLogger("page").setLevel("warn");
    log.getLogger("page-change-monitor").setLevel("info");
    log.getLogger("document").setLevel("warn");
    log.getLogger("tooltip").setLevel("info");
}

export { initLog }