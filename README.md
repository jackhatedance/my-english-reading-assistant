# <img src="public/icons/icon_48.png" width="45" align="left"> My English Reading Assistant

My Chrome Extension of English reader assistant


## brief description
这个浏览器插件能自动在英语文章里显示陌生单词的解释（目前只支持中文）。

想阅读英文书籍或网页，但是词汇量不够？手工为每一个生词查字典又嫌麻烦？这个软件就是为解决上述烦恼而生。

这是一款为词汇量有限但是又想阅读英文书籍，甚至希望通过阅读提高英语水平的人开发的软件。

使用该软件的第一步，需要初始化个人的词汇表，系统默认的初始词汇表是8000左右，可能不一定适合每一个人的情况。但是不要紧，使用几天下来，读者不断的标记单词，这个词汇表会越来越接近实际情况。读者也可以导入适合的个人词汇表。个人词汇表里的单词，都是用户认识的单词。阅读时，该软件会自动给不认识的单词添加中文注释。省去了手工查字典的麻烦。

为了让读者尽可能原汁原味的欣赏英文书籍，该软件尽量不破坏原有的文字布局。中文释义是用小号字体展示在行间空白处。为了不影响阅读体验，注释的不透明度默认为30%。这样做的目的，是让读者一般情况下不会被释义干扰，除非特意去看释义。

右键点击某个单词，
你可以把一个单词标记为“认识”，该单词会进入你的个人词汇表，从此不再展示其释义。
你也可以把一个单词标记为“不认识”，该单词会移出你的个人词汇表，从而展示其释义。

Chrome的侧边栏能显示当前页面的所有生词。用户可以批量的移除已经认识的单词，这些被移除的单词会进入个人词汇表。它还会显示陌生单词的比例。如果太高，则说明阅读难度增加。

读者还可以调整释义的位置，颜色，字体大小，不透明度等。这些设置都是针对当前的网站的，一次设置就会自动保存，下一次无需再调整。


除了用于普通网页，该插件也可以用于阅读epub格式的电子书。但是必须在浏览器内打开的epub阅读器。
推荐阅读epub格式电子书的网站：https://app.flowoss.com/

## Features

- It shows definition of the words which not in your vocabulary.

normal webpage:

<img src="public/screenshots/webpage.png" width="400">

online epub reader:

<img src="public/screenshots/epub.png" width="400">

context menu to adjust your vocabulary:

<img src="public/screenshots/context-menu.png" width="400">

## Install Chrome extension

refer to https://github.com/dutiyesh/chrome-extension-cli

## Why I made it?
作为一个英语爱好者，我一直希望自己能有阅读英文书籍的能力。但是我的英语词汇量有限，看一页内容，我都会遇到很多的生词，查字典非常低效。我看到有一些书籍是有双语版本的，电脑上也有全文翻译的软件。但是看全文翻译过的内容跟看中文版有什么区别？我希望的是在看英文书的同时，提高我的词汇量。也就是说，我希望大部分内容还是我自己来理解，少部分不认识的单词能够在旁边显示中文释义。多年来我一直没找到满足我需求的阅读软件。

2024年的某一天，我决定自己动手做一个这样的软件，首先满足我自己的需求。然后分享给有相同需求的同好们。



## Contribution

Suggestions and pull requests are welcomed!.

---

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)

