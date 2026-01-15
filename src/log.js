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

const LOGGER_NAMES = [
  'mera',
  'background',
  'site-profile',
  'article',
  'page',
  'page-change-monitor',
  'mutation-observer',
  'document',
  'tooltip',
  'tab-service',
  'activity-service',
  'activity-core',
  'activity-core-service',
  'dictionary',
  'custom-dictionary',
  'google-analytics',
  'partial-tokenization',
];

function initLog(){
  resetAll();
}

function resetAll(){
  let level = 'info';

  log.setDefaultLevel(level);
  for(const name of LOGGER_NAMES){
    log.getLogger(name).setLevel(level);  
  }
}
function setDebugLoggers(debugLoggers){
  resetAll();
  if(debugLoggers){
    for (const name of debugLoggers) {

      console.log(`set logger ${name} to debug`);
      if(name == 'default'){
        log.setDefaultLevel('debug');
      }else{
        log.getLogger(name).setLevel('debug');
      }
    }
  }
}



export { initLog, setDebugLoggers, LOGGER_NAMES }