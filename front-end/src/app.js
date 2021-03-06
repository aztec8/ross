'use strict';

var xhr = require('xhr');
var Timer = require('timer.js');
var shuffle = require('knuth-shuffle').knuthShuffle;


// credit to: https://davidwalsh.name/fullscreen
function launchIntoFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}


function init () {

  // loadup images
  var images = [];
  var req = xhr('/json', function (err, res, body) {
    images = JSON.parse(body);
    shuffle(images);  // randomize the order
  });


  // DOM refs
  var controlBtn = document.querySelector('#control-btn'),
      startBtn = document.querySelector('#start-btn'),
      img = document.querySelector('#img'),
      timeFeedback = document.querySelector('#time'),
      container = document.querySelector('#container');

      img.style.maxHeight = container.clientHeight + 'px';

  // warm-up intervals
  var intervals = [
        10, 10, 10, 10, 10,   // 5 images x 10 sec
        30, 30, 30, 30, 30,   // 5 images x 30 sec
        60, 60, 60,           // 3 images x 1 min
        180, 180, 180         // 3 images x 3 min
      ],
      intervalIndex = 0;  // track where we are in the intervals[]

  // check if we're paused or not
  var appState = {
    on: false,
    paused: false
  };


  function newImage() {
    // remove the last one
    images.pop();
    img.src = images[images.length - 1];
  }


  /**
   * update <span> text to show the remaining time
   */
  function feedback(text, domNode) {
    domNode.textContent = text;
  }


  // timer setup
  var timer = new Timer({
    tick    : 1,
    ontick  : function (sec) {
      feedback(Math.floor(sec/1000) + 1, timeFeedback);
    },
    onstart : function () {
      // fade to black?
      feedback(intervals[intervalIndex], timeFeedback);
    },
    // onstop  : function () { },
    // onpause : function () { console.log('timer set on pause') },
    onend   : function () {
      intervalIndex++;
      newImage();
      if (intervalIndex >= intervals.length - 1) {
        // console.log('last warm-up image');
        this.start(intervals[intervalIndex]).on('end', function () {
          feedback('--', timeFeedback);
          newImage();
        });
      } else {
        this.start(intervals[intervalIndex]);
      }
    }
  });


  function startApp () {
    img.src = images[images.length - 1];
    timer.start(intervals[intervalIndex]);
    feedback('Pause', controlBtn);
    container.classList.toggle('active');
    launchIntoFullscreen(document.documentElement); // the whole page
    appState.on = true;
    this.style.display = 'none';
  }

  function togglePause () {
    var feedbackString = '';
    if (appState.paused) {
      timer.start();
      appState.paused = false;
      feedbackString = 'Pause';
    } else {
      timer.pause();
      appState.paused = true;
      feedbackString = 'Resume';
    }
    feedback(feedbackString, controlBtn);
  }

  function controlBtnEventHandler () {
    if (!appState.on) {
      startApp();
    } else {
      togglePause();
    }
  }


  // setup start button
  startBtn.onclick = startApp;
  controlBtn.onclick = controlBtnEventHandler;

}

window.onload = init;
