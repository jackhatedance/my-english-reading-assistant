'use strict';
import './release-notes.css';
import releaseNotes from './release-notes.md';
import {localizeHtmlPage} from './locale.js';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkToc from 'remark-toc';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypeImageSize from './rehype/image-size.js'

import { sendTrackEventToBackground } from './message.js'
import { generatePageViewEvent } from './track/google-analytics.js'


localizeHtmlPage();

async function setup(){
  const file = await unified()
  .use(remarkToc, {heading: 'toc', tight: true})
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeImageSize)
  .use(rehypeStringify)
  .process(releaseNotes);

  let html = String(file);
  
  document.getElementById('article').innerHTML=html;

  let toc = document.getElementById('toc');
  toc.innerHTML = '目录';

  let tocWrapper = document.getElementById('toc-wrapper');
  let ul = document.querySelector('ul');
  //tocWrapper.appendChild(toc);
  //tocWrapper.appendChild(ul);
}
document.addEventListener('DOMContentLoaded', setup);


sendTrackEventToBackground(generatePageViewEvent());
