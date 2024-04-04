'use strict';

import './report.css';
import {initializeOptionService} from './optionService.js';
import {localizeHtmlPage} from './locale.js';
import {loadActivitiesFromStorage} from './activityService.js';
import {Chart, registerables} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);
localizeHtmlPage();
(function () {

  document.addEventListener('DOMContentLoaded', async () => {
    await initializeOptionService();
    render();
    

  });

  async function render(){

    let activities = await loadActivitiesFromStorage();
    renderReadingActivities(activities);

    let pageSummaries = getPageSummaries(activities);
    renderPageSummaries(pageSummaries);

    let sityeSummaries = getSiteSummaries(activities);
    renderSiteSummaries(sityeSummaries);
    
    let vocabularyChartData = getVocabularyChartData(activities);
    renderVocabularyChart(vocabularyChartData);

  }

  function renderReadingActivities(activities){
    let history = activities;

    history.sort(function(a, b){return a.endTime - b.endTime});

    let table = document.getElementById('history');
    for(let item of history.reverse()){
      let {startTime, title, url, totalWordCount, site, wordChanges, duration, endTime, vocabularySize} = item;

      if(!site){
        site='';
      }

      if(!totalWordCount){
        totalWordCount = '';
      }

      if(!duration){
        duration = item.timeSpan;
      }
      if(!vocabularySize){
        vocabularySize='';
      }
      let startTimeFormatted = new Date(startTime).toLocaleString( );
      let endTimeFormatted = new Date(endTime).toLocaleString( );

      let durationFormatted = new Date(duration).toISOString().substring(11, 19);
      const liInnerHTML = `<td>${startTimeFormatted}</td>
          <td>${endTimeFormatted}</td>
          <td>${site}</td>
          <td><a target="_blank" href='${url}'>${title}</a></td>
          <td>${totalWordCount}</td>
          <td>${durationFormatted}</td>
          <td>${vocabularySize}(${wordChanges})</td>
        `;

      let tr = document.createElement("tr");
      tr.innerHTML = liInnerHTML;

      table.appendChild(tr);
    }
  }

  function getPageSummaries(activities){
    let pageSummaryMap = new Map();
    for(let activity of activities){
      let title = activity.title;
      let summary = pageSummaryMap.get(title);
      
      if(!summary){
        summary={
          title: title,
          startTime: activity.startTime,
          endTime: 0,
          duration: 0,
          wordChanges: 0
        };

        pageSummaryMap.set(title, summary);
      }

      summary.endTime = Math.max(activity.endTime, summary.endTime);
      summary.duration = summary.duration + activity.duration;
      summary.wordChanges = summary.wordChanges + activity.wordChanges;
    }

    let array = Array.from(pageSummaryMap, ([name, value]) => ({ ... value}));
    
    array.sort(function(a, b){return b.endTime - a.endTime;});
    //console.log('page summaries:' + JSON.stringify(array));
    return array;
  }

  function renderPageSummaries(pageSummaries){
    let table = document.getElementById('pageSummaries');
    for(let item of pageSummaries){
      let {title, wordChanges, duration, startTime, endTime} = item;

      
      let startTimeFormatted = new Date(startTime).toLocaleString( );
      let endTimeFormatted = new Date(endTime).toLocaleString( );

      let durationFormatted = new Date(duration).toISOString().substring(11, 19);
      const liInnerHTML = `<td>${title}</td>
        <td>${startTimeFormatted}</td>
        <td>${endTimeFormatted}</td>
          <td>${durationFormatted}</td>
          <td>${wordChanges}</td>
        `;

      let tr = document.createElement("tr");
      tr.innerHTML = liInnerHTML;

      table.appendChild(tr);
    }
  }

  function getSiteSummaries(activities){
    let summaryMap = new Map();
    for(let activity of activities){
      let site = activity.site;
      let summary = summaryMap.get(site);
      
      if(!summary){
        summary={
          site: site,
          startTime: activity.startTime,
          duration: 0,
          wordChanges: 0
        };

        summaryMap.set(site, summary);
      }

      summary.lastTime = activity.endTime;
      summary.duration = summary.duration + activity.duration;
      summary.wordChanges = summary.wordChanges + activity.wordChanges;
    }

    let array = Array.from(summaryMap, ([name, value]) => ({ ... value}));
    
    array.sort(function(a, b){return a.endTime - b.endTime});

    //console.log('site summaries:'+JSON.stringify(array));
    return array;
  }

  function renderSiteSummaries(summaries){
    let table = document.getElementById('siteSummaries');
    for(let item of summaries){
      let {site, wordChanges, duration, startTime, lastTime} = item;

      
      let startTimeFormatted = new Date(startTime).toLocaleString( );
      let lastTimeFormatted = new Date(lastTime).toLocaleString( );

      let durationFormatted = new Date(duration).toISOString().substring(11, 19);
      const liInnerHTML = `<td>${site}</td>
        <td>${startTimeFormatted}</td>
        <td>${lastTimeFormatted}</td>
          <td>${durationFormatted}</td>
          <td>${wordChanges}</td>
        `;

      let tr = document.createElement("tr");
      tr.innerHTML = liInnerHTML;

      table.appendChild(tr);
    }
  }

  function getVocabularyChartData(activities){
    let vocabularyArray = [];
    for(let activity of activities){
      let vocabulary = {
        x: activity.endTime,
        y: activity.vocabularySize,
      };
      vocabularyArray.push(vocabulary);
    }    
    //sort by time
    vocabularyArray.sort(function(a, b){return a.x - a.x});
    return vocabularyArray;
  }

  function renderVocabularyChart(vocabularyChartData){
    //console.log('vocabularyChartData:'+JSON.stringify(vocabularyChartData));

    const ctx = document.getElementById('vocabularyChart').getContext("2d");

    var myChart = new Chart(ctx, {
      type: 'line',
      options: {
        scales: {
          x: {
            type: 'time',
          }
        }
      },
      data: {
        datasets: [{
          label: chrome.i18n.getMessage('reportVocabularyChartLabel'),
          data: vocabularyChartData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      }
    });
  }

})();
