import log from 'loglevel'
import prefix from 'loglevel-plugin-prefix';

// Define the format and content of your prefix
prefix.reg(log);
prefix.apply(log, {
  template: '[%t] %l:', // %t for timestamp, %l for log level
  timestampFormatter: function (date) {
    // Customize the timestamp format
    return date.toLocaleTimeString(); // e.g., '2025-12-10T18:49:00.000Z'
  },
  levelFormatter: function (level) {
    return level.toUpperCase(); // e.g., 'INFO', 'WARN'
  },
});

function initLog(){
    log.setDefaultLevel('info');
    log.getLogger("background").setLevel("info");
    log.getLogger("mera").setLevel("info");
    //article is about tokenize text
    log.getLogger("article").setLevel("info");
    log.getLogger("page").setLevel("info");
    log.getLogger("page-change-monitor").setLevel("info");
    log.getLogger("mutation-observer").setLevel("info");
    log.getLogger("document").setLevel("warn");
    log.getLogger("tooltip").setLevel("info");
    log.getLogger("tab-service").setLevel("info");
    log.getLogger("activity-service").setLevel("info");
    log.getLogger("activity-core").setLevel("info");
    log.getLogger("activity-core-service").setLevel("info");
    log.getLogger("dictionary").setLevel("info");
    log.getLogger("custom-dictionary").setLevel("info");
    
}

export { initLog }