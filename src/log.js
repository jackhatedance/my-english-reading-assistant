import log from 'loglevel'

function initLog(){
    log.setDefaultLevel('info');
    log.getLogger("background").setLevel("debug");
    log.getLogger("mera").setLevel("warn");
    //article is about tokenize text
    log.getLogger("article").setLevel("info");
    log.getLogger("page").setLevel("debug");
    log.getLogger("page-change-monitor").setLevel("info");
    log.getLogger("mutation-observer").setLevel("info");
    log.getLogger("document").setLevel("warn");
    log.getLogger("tooltip").setLevel("info");
    log.getLogger("tab-service").setLevel("info");
    log.getLogger("activity-service").setLevel("debug");
    log.getLogger("activity-core").setLevel("debug");
    log.getLogger("activity-core-service").setLevel("debug");
    log.getLogger("dictionary").setLevel("info");
}

export { initLog }