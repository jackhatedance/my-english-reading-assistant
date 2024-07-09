
'use strict';

function getSegmentOffset(articleOffset, segmentLength = 1000){
    let segmentOffset = Math.floor(articleOffset / segmentLength);
    return segmentOffset;
}

export { getSegmentOffset };