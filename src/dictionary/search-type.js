
const mapShort = {
    'stem': '根',
    'removeSuffixOrPrefix': '源',
    'lemma': '原',
    'compounding': '复',
};

const mapLong = {
    'stem': '词根',
    'removeSuffixOrPrefix': '词根',
    'lemma': '原形',
    'compounding': '复合词',
};

function getSearchTypeDescription(searchType, long) {
    let description = null;

    let map = long ? mapLong : mapShort;
    
    if (map.hasOwnProperty(searchType)) {
        description = map[searchType];
    }

    return description;
}

export { getSearchTypeDescription }