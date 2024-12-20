'use strict';
import './faq.css';
import faq from './faq.md';
import {localizeHtmlPage} from './locale.js';
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkToc from 'remark-toc';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';

localizeHtmlPage();

async function setup(){
  const file = await unified()
  .use(remarkToc, {heading: 'toc', tight: true})
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeStringify)
  .process(faq);

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
