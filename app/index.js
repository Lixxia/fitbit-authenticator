import document from "document";
import * as messaging from "messaging";
import * as fs from "fs";
import {TOTP} from "../common/totp.js";
import {TOKEN_NUM} from "../common/globals.js";
import { me as device } from "device";

const WIDTH = device.screen.width;
const HEIGHT = device.screen.height;

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
  var epoch = Math.round(new Date().getTime() / 1000.0);
  var countDown = 30 - (epoch % 30);
  if (epoch % 30 == 0) updateOtp();
  // document.getElementById("time-left").text = countDown;

  // Starts corresponding section of progress bar based on interval
  if (countDown === 30) {
    document.getElementById("prog1").x2 = 0;
    document.getElementById("prog2").y2 = 0;
    document.getElementById("prog3").x2 = WIDTH;
    document.getElementById("prog4").y2 = HEIGHT;
    document.getElementById("prog2").style.visibility = "hidden";
    document.getElementById("prog3").style.visibility = "hidden";
    document.getElementById("prog4").style.visibility = "hidden";
    progress("prog1");
  } else if (countDown === 23) {
    document.getElementById("prog1").x2 = WIDTH;
    document.getElementById("prog2").y2 = 0;
    document.getElementById("prog2").style.visibility = "visible";
    progress("prog2");
  } else if (countDown === 16 ) {
    document.getElementById("prog1").x2 = WIDTH;
    document.getElementById("prog2").y2 = HEIGHT;
    document.getElementById("prog3").x2 = WIDTH;
    document.getElementById("prog3").style.visibility = "visible";
    progress("prog3");
  } else if (countDown === 9 ) {
    document.getElementById("prog1").x2 = WIDTH;
    document.getElementById("prog2").y2 = HEIGHT;
    document.getElementById("prog3").x2 = 0;
    document.getElementById("prog4").y2 = HEIGHT;
    document.getElementById("prog4").style.visibility = "visible";
    progress("prog4");
  }

}

// Play catchup on progress bar if viewing app between above thresholds
function resumeTimer() {
  let epoch = Math.round(new Date().getTime() / 1000.0);
  let catchUp = (epoch % 30) * 43;
  let i=1;
  while (catchUp > 0) {
    if (i === 1) {
      document.getElementById("prog" + i).x2 = catchUp;
    } else if (i === 2) {
      document.getElementById("prog1").x2 = WIDTH;
      document.getElementById("prog" + i).y2 = catchUp;
    } else if (i === 3) {
      document.getElementById("prog1").x2 = WIDTH;
      document.getElementById("prog2").y2 = HEIGHT;
      document.getElementById("prog" + i).x2 = catchUp;
    } else if (i === 4) {
      document.getElementById("prog1").x2 = WIDTH;
      document.getElementById("prog2").y2 = HEIGHT;
      document.getElementById("prog3").x2 = 0;
      document.getElementById("prog" + i).y2 = catchUp;
    }
    progress("prog" + i);
    i++;
    catchUp -= 300;
  }
}

// Generate smooth JS animation for progress bar
function progress(element) {
  var bar = document.getElementById(element);
  var id = setInterval(frame, 23);
  var updateInterval = 1;
  function frame() {
    if (element === "prog1") {
      if (bar.x2 >= 300) {
        clearInterval(id);
      } else {
        bar.x2 += updateInterval;
      }
    }
    else if (element === "prog2") {
      if (bar.y2 >= 300) {
        clearInterval(id);
      } else {
        bar.y2 += updateInterval;
      }
    } else if (element === "prog3") {
      if (bar.x2 <= 0) {
        clearInterval(id);
      } else {
        bar.x2 -= updateInterval;
      }
    } else if (element === "prog4") {
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
