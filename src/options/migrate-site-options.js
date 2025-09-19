function migrateSiteOptions(siteOptions){
    migrate_v_0_13_4(siteOptions);
}

function migrate_v_0_13_4(siteOptions){
    if(siteOptions.enabled==true){
        options.switch.mode = SWITCH_MODE_OPTION_ON;
        delete siteOptions.enabled;
    }
}

export { migrateSiteOptions }