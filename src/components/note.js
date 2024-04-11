'use strict';

import 'sceditor/minified/sceditor.min.js';
import 'sceditor/minified/formats/bbcode.js';
import 'sceditor/minified/themes/default.min.css';

class Note {
        
    constructor(rootElement, service) {
        this.rootElement = rootElement;
        
        this.service = service;

        this.rootElement.classList.add('note');
        this.rootElement.innerHTML = 
           `<p class="highlight-text"></p>
            <div class="view-note-container" style="display: none">
                <p>Note:</p>
                <div class="note-view"></div>
                <div>
                    <button class="addNoteAction">Add</button>
                    <button class="editNoteAction">Edit</button>
                    <button class="deleteNoteAction">Delete</button>
                </div>
            </div>
            <div class="edit-note-container" style="display:none">
                <textarea class="note-editor"></textarea>
                <div>
                    <button class="saveNoteAction">Save</button>
                    <button class="cancelNoteAction">Cancel</button>
                </div>
            </div>`;
    }

    getHtml(){
        return this.html;
    }

    initForNewNote(selectedText, sentenceSelection) {
        this.selectedText = selectedText;
        this.sentenceSelection = sentenceSelection;        
        this.noteContent = '';

        this.note = null;
    }
    
    initForExistingNote(selectedText, note) {
        this.selectedText = selectedText;
        this.sentenceSelection = note.selection;
        this.noteContent = note.content;
        
        this.note = note;
    }

    setHighlightText(text){
        let highlighTextElement = this.rootElement.getElementsByClassName('highlight-text')[0];
        highlighTextElement.innerHTML = text;
    }

    setNoteViewerVisibility(show){
        this.rootElement.getElementsByClassName('view-note-container')[0].style.display = show? null : 'none';
    }

    setNoteViewValue(html){
        let noteViewerElement = this.rootElement.getElementsByClassName('note-view')[0];
        noteViewerElement.innerHTML = html;
    }

    setAddButtonVisibility(show){
        let button = this.rootElement.getElementsByClassName('addNoteAction')[0];
        button.style.display = show? null:'none';
    }

    setEditButtonVisibility(show){
        let button = this.rootElement.getElementsByClassName('editNoteAction')[0];
        button.style.display = show? null:'none';
    }

    setDeleteButtonVisibility(show){
        let button = this.rootElement.getElementsByClassName('deleteNoteAction')[0];
        button.style.display = show? null:'none';
    }

    setNoteEditorVisibility(show){
        this.rootElement.querySelector('.edit-note-container').style.display = show? null: 'none';
    }

    getElement(cssSelector) {
        return this.rootElement.querySelector(cssSelector);
    }

    getScEditor(){
        let textarea = this.rootElement.querySelector('.note-editor');
        return sceditor.instance(textarea);
    }

    bbcodeToHtml(bbcodeContent){
        return this.getScEditor().fromBBCode(bbcodeContent);
    }

    setupNotesTab(){
        var textarea = this.rootElement.querySelector('.note-editor');
        sceditor.create(textarea, {
        format: 'bbcode',
        toolbarExclude:'emoticon,youtube,ltr,rtl,print',
        emoticonsEnabled:false,
        style: '',
        autofocus: true,
        });



        this.getElement('.addNoteAction').addEventListener('click', async (e) => {
            this.mode = 'add';
            this.renderNoteTab();
        });

        this.getElement('.editNoteAction').addEventListener('click', async (e) => {
            this.mode = 'edit';
            this.renderNoteTab();
        });

        this.getElement('.deleteNoteAction').addEventListener('click', async (e) => {
            console.log('delete note');
            
            await this.service.deleteNote(this.sentenceSelection);
            
            this.note = null;

            this.mode = 'view';
            this.renderNoteTab();

            this.service.sendMessageToActiveTab('NOTES_UPDATED');
        });

        this.getElement('.saveNoteAction').addEventListener('click', async (e) => {
            let noteBBCode = this.getScEditor().val();
            let note = {selection: this.sentenceSelection, content: noteBBCode};
            await this.service.setNote(note);
            
            this.note = note;

            this.mode = 'view';
            this.renderNoteTab();

            this.service.sendMessageToActiveTab('NOTES_UPDATED');
        });

        this.getElement('.cancelNoteAction').addEventListener('click', async (e) => {
            
            this.mode = 'view';
            this.renderNoteTab();    
        });
    }


    renderNoteViewer(note){
        if(note){
            //show note content
            var noteHtml = this.bbcodeToHtml(note.content);
            this.setNoteViewValue(noteHtml);

            this.setAddButtonVisibility(false);
            this.setEditButtonVisibility(true);
            this.setDeleteButtonVisibility(true);

            this.setNoteViewerVisibility(true);
        } else {
            //clear note content
            this.setNoteViewValue('');

            this.setAddButtonVisibility(true);
            this.setEditButtonVisibility(false);
            this.setDeleteButtonVisibility(false);

            this.setNoteViewerVisibility(true);
        }
    }


    async renderNoteTab(){


        if(this.mode === 'view') {
            //show selected text anyway
            this.setHighlightText(this.selectedText);
        
            if(this.sentenceSelection){
                this.renderNoteViewer(this.note);
                this.setNoteViewerVisibility(true);
            } else {
                //hide note viewer.
                this.setNoteViewerVisibility(false);
            }

            this.setNoteEditorVisibility(false);
            } else if(this.mode === 'add') {
            //hide viewer
            this.setNoteViewerVisibility(false);

            //show editor
            this.getScEditor().val('');
            this.setNoteEditorVisibility(true); 
        } else if(this.mode === 'edit') {
            //hide viewer
            this.setNoteViewerVisibility(false);

            //show editor
            this.getScEditor().val(this.note.content);
            this.setNoteEditorVisibility(true); 

        }   
    }

    async refreshNoteViewer(){
        //console.log('refresh note viewer');
        if(this.mode === 'edit') {
          //there is unsaved content, do nothing.
        } else {
          this.mode = 'view';
          this.renderNoteTab();      
        }
    }
 
}

export {Note};