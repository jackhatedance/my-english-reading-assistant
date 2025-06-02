import log from 'loglevel'

function initLog(){
    log.getLogger("contentScript").setLevel("debug");
    log.getLogger("article").setLevel("debug");
}

export { initLog }