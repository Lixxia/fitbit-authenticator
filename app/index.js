import document from "document";
import * as messaging from "messaging";
import * as fs from "fs";
import {TOTP} from "../common/totp.js";
import {TOKEN_NUM} from "../common/globals.js";
import { me as device } from "device";

// Progress bar constants
const WIDTH = device.screen.width;
const HEIGHT = device.screen.height;
const PROG = ['0','1','2','3'].map(num => document.getElementById(`prog${num}`));

// Testing touch, highlight on tap?
// let list = document.getElementById("tokenList");
// let items = list.getElementsByClassName("tile-list-item");

// items.forEach((element, index) => {
//   let touch = element.getElementById("touch-me");
//   touch.onclick = (evt) => {
//     console.log(`touched: ${index}`);
//   }
// });

try {
  const TOKENS = JSON.parse(fs.readFileSync("tokens.json", "json"));
} catch (err) {
  console.log("File not found or failed to parse, initializing JSON.");
  const TOKENS = {"data":[]};
}

const TILES = [];
// Get all token-n elements for display/hide
for (let i=0; i<TOKEN_NUM; i++) {
  let tile = document.getElementById(`token-${i}`);
  if (tile) {
    TILES.push(tile);
  }
}

// Message is received
messaging.peerSocket.onmessage = evt => {
  // console.log(`App received: ${JSON.stringify(evt)}`);
  let parsed_evt = JSON.parse(JSON.stringify(evt));
  
  if (parsed_evt.data.hasOwnProperty('delete')) {
    console.log("Deleted item passed from settings: " + JSON.stringify(parsed_evt.data.delete));
    for (let i=0; i<TOKENS.data.length; i++) {
      if(TOKENS.data[i]["name"] === parsed_evt.data.delete) {
        TOKENS.data.splice(i, 1);
      }
    }
  } else {
    for (let j=0; j<parsed_evt.data.length; j++) {
      // console.log("Is it a token?:" + parsed_evt.data[j].hasOwnProperty('token'));
      if (parsed_evt.data[j].hasOwnProperty('token')) {
        // console.log("Name has a token: " + parsed_evt.data[j]["name"] + "=" + parsed_evt.data[j]["token"]);
        TOKENS.data.push({"name":parsed_evt.data[j]["name"],"token":parsed_evt.data[j]["token"]});
      }
      // else {
      //   console.log("No Token: " + JSON.stringify(parsed_evt.data[j]["name"]));
      // }
    }
  }
  // console.log("json to be written: " + JSON.stringify(TOKENS));
  fs.writeFileSync("tokens.json", JSON.stringify(TOKENS), "json");
  
  // Send new data to TOTP generation
  updateOtp();
};

// Message socket opens
messaging.peerSocket.onopen = () => {
  console.log("App Socket Open");
};

// Message socket closes
messaging.peerSocket.onclose = () => {
  console.log("App Socket Closed");
};

function updateOtp() {
  let statusText = document.getElementById("status")
  
  if (TOKENS.data.length === 0) {
    statusText.style.display = "inline";
    statusText.text = "No valid tokens, please add via settings.";
  } else {
    statusText.style.display = "none";
  }
  
  // Iterate over possible display values, hide if nothing found
  for (let i=0; i<TOKEN_NUM; i++) {
    let tile = TILES[i];
    
    if (!tile) {
      continue;
    }
    
    try {
      let token_val = TOKENS.data[i]["token"];
      let token_name = TOKENS.data[i]["name"];
    } catch (u) {
      tile.style.display = "none";
      continue;
    }
    tile.style.display = "inline";
    tile.getElementById("totp").text = totpObj.getOTP(token_val); 
    tile.getElementById("totp-name").text = token_name;    
  }
  //Test Codes
  //ZVZG5UZU4D7MY4DH
  //JBSWY3DPEHPK3PXP
}

function timer() {
  // Update tokens every 30s
  let epoch = Math.round(new Date().getTime() / 1000.0);
  let countDown = 30 - (epoch % 30);
  if (epoch % 30 == 0) updateOtp();
  document.getElementById("time-left").text = countDown;

  // Reset countdown clock at 30/0 seconds
  if (countDown === 30) {
    PROG[0].x2 = 0;
    PROG[1].y2 = 0;
    PROG[2].x2 = WIDTH;
    PROG[3].y2 = HEIGHT;
    PROG[3].style.visibility = "hidden"; //last bar may repeat animation if lagged
    progress(PROG[0]); 
  }

}

// Play catchup on progress bar if viewing app between above thresholds
function resumeTimer() {
  let epoch = Math.round(new Date().getTime() / 1000.0);
  let catchUp = (epoch % 30) * 43;
  let i=0;

  while (catchUp > 0) {
    if (i === 0) {
      PROG[0].x2 = Math.min(WIDTH,catchUp);
    } else if (i === 1) {
      PROG[0].x2 = WIDTH;
      PROG[1].y2 = Math.min(HEIGHT,catchUp);
    } else if (i === 2) {
      PROG[0].x2 = WIDTH;
      PROG[1].y2 = HEIGHT;
      PROG[2].x2 = Math.min(WIDTH,WIDTH - catchUp);
    } else if (i === 3) {
      PROG[0].x2 = WIDTH;
      PROG[1].y2 = HEIGHT;
      PROG[2].x2 = 0;
      PROG[3].style.visibility = "visible";
      PROG[3].y2 = Math.min(HEIGHT,HEIGHT - catchUp);
    }
    i++;
    catchUp -= WIDTH;
  } 
  console.log("Calling prog" + (i-1));
  progress(PROG[i-1]);
}

// Generate smooth JS animation for progress bar
function progress(bar) {
  let id = setInterval(frame, 24);
  let updateInterval = 1;

  function frame() {
    if (bar === PROG[0]) {
      if (bar.x2 >= WIDTH) {
        clearInterval(id);
        PROG[1].y2 = 0;
        progress(PROG[1]);
      } else {
        bar.x2 += updateInterval;
      }
    }
    else if (bar === PROG[1]) {
      if (bar.y2 >= HEIGHT) {
        clearInterval(id);
        PROG[2].x2 = WIDTH;
        progress(PROG[2]);
      } else {
        bar.y2 += updateInterval;
      }
    } else if (bar === PROG[2]) {
      if (bar.x2 <= 0) {
        clearInterval(id);
        PROG[3].y2 = HEIGHT;
        PROG[3].style.visibility = "visible";
        progress(PROG[3]);
      } else {
        bar.x2 -= updateInterval;
      }
    } else if (bar === PROG[3]) {
      if (bar.y2 <= 0) {
        clearInterval(id);
      } else {
        bar.y2 -= updateInterval;
      }
    }
  }
}

var totpObj = new TOTP();
updateOtp();
setInterval(timer, 1000);
resumeTimer();
