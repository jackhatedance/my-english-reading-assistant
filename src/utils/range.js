function intersectRanges(rangeA, rangeB) {
  const maxStart = Math.max(rangeA.min, rangeB.min);
  const minEnd = Math.min(rangeA.max, rangeB.max);

  // If maxStart is less than or equal to minEnd, they intersect.
  if (maxStart <= minEnd) {
    return { min: maxStart, max: minEnd };
  } else {
    // No overlap
    return null;
  }
}

function hasIntersections(rangeA, rangeB){
    let ranges = intersectRanges(rangeA, rangeB);
    let has = ranges != null;
    return has;
}

export { intersectRanges, hasIntersections }