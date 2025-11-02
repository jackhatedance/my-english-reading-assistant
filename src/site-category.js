const SITE_CATEGORY_TEXT = "text";
const SITE_CATEGORY_VIDEO = "video";

const SITE_CATEGORY_OTHER = "other";


function fixCategory(value, validCategoryies = [SITE_CATEGORY_TEXT, SITE_CATEGORY_VIDEO]){
    if(!validCategoryies.includes(value)){
        return SITE_CATEGORY_OTHER;
    }
    return value;
}

export { SITE_CATEGORY_TEXT, SITE_CATEGORY_VIDEO, SITE_CATEGORY_OTHER, fixCategory}