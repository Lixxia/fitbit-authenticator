import document from "document";
import * as messaging from "messaging";
import { AuthUI } from "./interface.js";
import { AuthToken } from "./tokens.js";
import { display } from "display";

let ui = new AuthUI();
let token = new AuthToken();



// check if file exists, otherwise nothing to display
try {
  const file = token.reloadTokens();
  ui.updateUI("loaded", file);
  ui.resumeTimer();
} catch (e) {
  ui.updateUI("none");
}

// Need to test when I get an actual device
display.addEventListener("change", function() {
  if (display.on) {
    wake();
  } else {
    sleep();
  }
});

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  ui.updateUI("loading");
  messaging.peerSocket.send("Hi!");
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data.hasOwnProperty('color')) {
    ui.updateColors(evt.data.color);
  } else if (evt.data.hasOwnProperty('font')) {
    ui.updateFont(evt.data.font.selected);
    ui.updateUI("loaded", token.reloadTokens()); //re-render for font centering
  } else if (evt.data.hasOwnProperty('text_toggle')) {
    ui.updateCounter(evt.data.text_toggle);
  } else if (evt.data.hasOwnProperty('reorder')) {
    ui.updateUI("loaded", token.reorderTokens(evt.data.reorder));
  } else if (evt.data.hasOwnProperty('delete')) {
    ui.updateUI("loaded", token.deleteToken(evt.data.delete));
  } else {
    if (file.data.length === 0) {
      ui.resumeTimer(); //This is the first token, start animation
    }
    ui.updateUI("loaded", token.writeToken(evt.data));
  }
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  ui.updateUI("error");
}

function wake() {
  console.log("I'm awake! I'm awake...");
}

function sleep() {
  ui.stopAnimation();
}

function timer() {
  // Update tokens every 30s
  let epoch = Math.round(new Date().getTime() / 1000.0);
  let countDown = 30 - (epoch % 30);
  if (epoch % 30 == 0) ui.updateUI("loaded", token.reloadTokens());
  ui.updateTextTimer(countDown);
  
  // Reset countdown clock at 30/0 seconds
  if (countDown === 30) {
    ui.refreshProgress();
  }
}

var id = setInterval(timer, 1000);

//Test Codes
//ZVZG5UZU4D7MY4DH
//JBSWY3DPEHPK3PXP
