
# UAT

#### user can reads web page
* steps
    * open web page
        * page types: news, forum, SNS, epub, PDF
    * enable toggle    
* expect
    * unknown word annotations are shown
    * no console errors.

### core functions
* preconditions
    * software installed
* steps
    * open a web page
    * mark words as known/unknown
    * check word definitions
    * check page vocabulary
    * check book
    * add notes
* expect
    * no console error
    * core functions work well

### new installation
* steps
    * new install extension
    * open web page
    * enable toggle
* expect
    * unknown word annotations are show
    * no console error    

### exisiting user, extension upgrade
* preconditions
    * old version software installed
* steps
    * upgrade extension
    * open web page
    * enable toggle
* expect
    * unknown word annotations are show
    * no console error    

### mark word
* preconditions
    * remember personal vocabulary number as x1
* steps
    * user open page
    * user mark word as known
* expect
    * check personal vocabulary number as x2. x2 should be x1 + 1


# popup

* help
* options link
* FAQ link
* show/hide
* always show on this site
* annotation adjustment
* additional dictionary
* reset
* save as default


# options

## vocabulary
vocabulary initialization
import export vocabulary
import export notes

## notes

## root and affix

## dictionary

## Unrecognized words

# content page

## inline annotation

### deep lookup

#### mdict link definition
* precondition
    * a word which definition is a link, such as 'pushing', its definition is '@@@LINK=push'
* steps
    * click on the word, the dialog is openned
    * switch to HTML defition
* expect
    * there should be a link, user can click and navigate.

## content type
    regular webpage
        quora
        reddit
        whitehouse
        wikipedia
    epub
        app.flowoss.com
    pdf
        

# side panel
## vocabulary
show definition for all
hide definition for all
show defnition for word
known
unknown
clear

## actions
### mark word

### notes
add note
view/edit note

# i18n
english
chinese

# OS
mac
windows

# browser
chrome
edge

# network
GFW
internet

# sites

* [epub](app.flowoss.com)
* [pdf](https://mozilla.github.io/pdf.js/web/viewer.html)
* reddit.com
* quora.com
* wikipedia.org

# e2e

* fresh new install
* upgrade from old version
