
export const NOTE_HIGHLIGH_TYPE_BACKGROUND_COLOR = 'background_color';
export const NOTE_HIGHLIGH_TYPE_UNDERLINE = 'underline';

export const NOTE_HIGHLIGH_COLOR_YELLOW = 'yellow';
export const NOTE_HIGHLIGH_COLOR_GREEN = 'green';
export const NOTE_HIGHLIGH_COLOR_BLUE = 'blue';
export const NOTE_HIGHLIGH_COLOR_PINK = 'pink';
export const NOTE_HIGHLIGH_COLOR_PURPLE = 'purple';

export const NOTE_HIGHLIGH_COLOR_YELLOW_RGB = '#fcdc3f';
export const NOTE_HIGHLIGH_COLOR_GREEN_RGB = '#99dc82';
export const NOTE_HIGHLIGH_COLOR_BLUE_RGB = '#95b9ff';
export const NOTE_HIGHLIGH_COLOR_PINK_RGB = '#ff9cb4';
export const NOTE_HIGHLIGH_COLOR_PURPLE_RGB = '#c5affb';

export const NOTE_HIGHLIGH_UNDERLINE_WAVY = 'wavy';

function getColorRgb(name){
    if(name == NOTE_HIGHLIGH_COLOR_YELLOW){
        return NOTE_HIGHLIGH_COLOR_YELLOW_RGB;
    } else if(name == NOTE_HIGHLIGH_COLOR_GREEN){
        return NOTE_HIGHLIGH_COLOR_GREEN_RGB;
    } else if(name == NOTE_HIGHLIGH_COLOR_BLUE){
        return NOTE_HIGHLIGH_COLOR_BLUE_RGB;
    } else if(name == NOTE_HIGHLIGH_COLOR_PINK){
        return NOTE_HIGHLIGH_COLOR_PINK_RGB;
    } else if(name == NOTE_HIGHLIGH_COLOR_PURPLE){
        return NOTE_HIGHLIGH_COLOR_PURPLE_RGB;
    }
}

function generateHighlightName(type, backgroundColor, underlineType) {
    if (type == NOTE_HIGHLIGH_TYPE_BACKGROUND_COLOR) {
        return `note-highlight-${type}-${backgroundColor}`;
    } else if (type == NOTE_HIGHLIGH_TYPE_UNDERLINE) {
        return `note-highlight-${type}-${underlineType}`;
    }
}

function generateBackgroundColorStyle(backgroundColor) {
    let type = NOTE_HIGHLIGH_TYPE_BACKGROUND_COLOR;
    let highlightName = generateHighlightName(type, backgroundColor);
    let backgroundColorRgb = getColorRgb(backgroundColor);
    let styleName = `::highlight(${highlightName})`;
    let body = `background-color: ${backgroundColorRgb};`;

    let styleContent = `
    ${styleName} {
      ${body}
    }
  `;

    return styleContent;
}


function generateUnderlineStyle(underlineType) {
    let type = NOTE_HIGHLIGH_TYPE_UNDERLINE;
    let highlightName = generateHighlightName(type, null, underlineType);

    let styleName = `::highlight(${highlightName})`;
    let body = 
       `text-decoration-line: underline;
        text-decoration-style: ${underlineType};
        text-decoration-color: red;
        text-decoration-thickness: from-font;`;

    let styleContent = 
     `${styleName} {
      ${body}
    }`;

    return styleContent;
}

function generateHighlightStyles() {
    let highlightStyles = '';

    let type = NOTE_HIGHLIGH_TYPE_BACKGROUND_COLOR;
    for (const color of getAllColors()) {
        let styleContent = generateBackgroundColorStyle(color);
        highlightStyles += styleContent;
    }

    type = NOTE_HIGHLIGH_TYPE_UNDERLINE;

    let styleContent = generateUnderlineStyle('wavy');
    highlightStyles += styleContent;

    return highlightStyles;
}

function getAllTypes(){
    return [NOTE_HIGHLIGH_TYPE_BACKGROUND_COLOR, NOTE_HIGHLIGH_TYPE_UNDERLINE];
}

function getAllColors(){
    return [NOTE_HIGHLIGH_COLOR_YELLOW, NOTE_HIGHLIGH_COLOR_GREEN, NOTE_HIGHLIGH_COLOR_BLUE, NOTE_HIGHLIGH_COLOR_PINK, NOTE_HIGHLIGH_COLOR_PURPLE];
}

function getDefaultType(){
    return NOTE_HIGHLIGH_TYPE_UNDERLINE;
}

function getDefaultBackgroundColor(){
    return NOTE_HIGHLIGH_COLOR_YELLOW;
}

function getDefaultUnderlineType(){
    return NOTE_HIGHLIGH_UNDERLINE_WAVY;
}


export { getDefaultType, getDefaultBackgroundColor, getDefaultUnderlineType, getColorRgb, generateHighlightName, generateHighlightStyles }