import log from 'loglevel'

function initLog(){
    log.setDefaultLevel('info');
    log.getLogger("background").setLevel("warn");
    log.getLogger("mera").setLevel("warn");
    //article is about tokenize text
    log.getLogger("article").setLevel("info");
    log.getLogger("page").setLevel("warn");
    log.getLogger("page-change-monitor").setLevel("info");
    log.getLogger("mutation-observer").setLevel("info");
    log.getLogger("document").setLevel("warn");
    log.getLogger("tooltip").setLevel("info");
    log.getLogger("activity-service").setLevel("info");
    log.getLogger("user-tabs-service").setLevel("info");
    log.getLogger("user-activity-service").setLevel("info");
    log.getLogger("dictionary").setLevel("info");
}

export { initLog }