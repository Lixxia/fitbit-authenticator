import document from "document";
import * as messaging from "messaging";
import * as fs from "fs";
import {TOTP} from "../common/totp.js";
import {ProgressBar} from "../common/progressbar.js";
import {TOKEN_NUM} from "../common/globals.js";

var totpObj = new TOTP();
var display = document.getElementById("display").getBBox();
var height = display.height;
var width = display.width;

// Testing touch, change bg color?
let list = document.getElementById("tokenList");
let items = list.getElementsByClassName("tile-list-item");

items.forEach((element, index) => {
  let touch = element.getElementById("touch-me");
  touch.onclick = (evt) => {
    console.log(`touched: ${index}`);
  }
});


try {
  var json_read = fs.readFileSync("tokens.json", "json");
}
catch (e) {
  console.log("No file, please add tokens via settings.");
}
console.log("JSON from file: " + json_read)

try {
  var tokens = JSON.parse(json_read);
}
catch (e) {
  console.log("File parse error.");
  var tokens = {"data":[]}
}

// Message is received
messaging.peerSocket.onmessage = evt => {
  let names = [];
  let file_names = [];
  
  // for (var key in tokens.data) {
  //   if (tokens.data.hasOwnProperty(key)) {
  //     file_names.push(JSON.stringify(tokens.data[key]["name"]));
  //   }
  // }
  
  console.log(`App received: ${JSON.stringify(evt)}`);
  let parsed_evt = JSON.parse(JSON.stringify(evt));
  if (parsed_evt.data.hasOwnProperty('delete')) {
    console.log("DELETE HERE " + JSON.stringify(parsed_evt.data.delete));
    for (let i = 0; i < tokens.data.length; i++) {
      if(tokens.data[i]["name"] === parsed_evt.data.delete) {
        tokens.data.splice(i, 1);
      }
    }
    console.log("Post delete? " + JSON.stringify(tokens.data));
  }  
  for (let j=0; j<parsed_evt.data.length;j++) {
    console.log("Is it a token?:" + parsed_evt.data[j].hasOwnProperty('token'));
    // console.log("Test name: " + file_names.indexOf(JSON.stringify(parsed_evt.data[j]["name"])));
    // if (file_names.indexOf(JSON.stringify(parsed_evt.data[j]["name"])) !== -1) {
    //   // Object already exists, duplicate name
    // }
    // names.push(JSON.stringify(parsed_evt.data[j]["name"]));
    if (parsed_evt.data[j].hasOwnProperty('token')) {
      console.log("has a token: " + parsed_evt.data[j]["name"] + "=" + parsed_evt.data[j]["token"]);
      tokens.data.push({"name":parsed_evt.data[j]["name"],"token":parsed_evt.data[j]["token"]});
    }
    else {
      console.log("No Token: " + JSON.stringify(parsed_evt.data[j]["name"]));
    }
  }
  
  // Build Array of items to remove by comparing token-less payload with file names
//   let toRemove = file_names.filter(function(i) {
//     return names.indexOf(i) < 0;
//   });
//   console.log("diff: " + toRemove);

//   // Iterate through array, remove anything found in toRemove
//   for(let i = 0; i < tokens.data.length; i++) {
//     let obj = tokens.data[i];

//     if(toRemove.indexOf(JSON.stringify(obj.name)) !== -1) {
//       tokens.data.splice(i, 1);
//       i--;
//     }
//   }
  // console.log("post delete: " + JSON.stringify(tokens.data));
  // if token exists, add to json file, if no token in payload check for existance, if existed then delete
  console.log("json to be written:" + JSON.stringify(tokens));
  fs.writeFileSync("tokens.json", JSON.stringify(tokens), "json");
  
  // Send new data to TOTP generation
  updateOtp();
  
  //console.log("json read 2nd: " + fs.readFileSync("tokens.json", "json"));
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
  let tokenList = document.getElementById("tokenList");

  let tiles = [];
  // Get all token-n elements for later display
  for (let i = 0; i < TOKEN_NUM; i++) {
    let tile = document.getElementById(`token-${i}`);
    if (tile) {
      tiles.push(tile);
    }
  }
  console.log("Called updateOtp")
  
  // Iterate over possible display values, hide if nothing found
  for (let i=0;i< TOKEN_NUM;i++) {
    var tile = tiles[i];
    if (!tile) {
      continue;
    }
    // console.log("JSON from file in function: " + JSON.stringify(tokens.data));
    // console.log("i before function: " + i);
    try {
      var token_val = tokens.data[i]["token"];
      var token_name = tokens.data[i]["name"];
    }
    catch (u) {
      // console.log("No value for " + i);
      tile.style.display = "none";
      continue;
    }
    // console.log("i after continue: " + i);
    tile.style.display = "inline";
    tile.getElementById("totp").text = totpObj.getOTP(token_val); 
    tile.getElementById("totp-name").text = token_name;    
  }
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
    document.getElementById("prog3").x2 = width;
    document.getElementById("prog4").y2 = height;
    document.getElementById("prog2").style.visibility = "hidden";
    document.getElementById("prog3").style.visibility = "hidden";
    document.getElementById("prog4").style.visibility = "hidden";
    progress("prog1");
  }
  else if (countDown === 23) {
    document.getElementById("prog1").x2 = width;
    document.getElementById("prog2").y2 = 0;
    document.getElementById("prog2").style.visibility = "visible";
    progress("prog2");
  }
  else if (countDown === 16 ) {
    document.getElementById("prog1").x2 = width;
    document.getElementById("prog2").y2 = height;
    document.getElementById("prog3").x2 = width;
    document.getElementById("prog3").style.visibility = "visible";
    progress("prog3");
  }
  else if (countDown === 9 ) {
    document.getElementById("prog1").x2 = width;
    document.getElementById("prog2").y2 = height;
    document.getElementById("prog3").x2 = 0;
    document.getElementById("prog4").y2 = height;
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
    }
    else if (i === 2) {
      document.getElementById("prog1").x2 = width;
      document.getElementById("prog" + i).y2 = catchUp;
    }
    else if (i === 3) {
      document.getElementById("prog1").x2 = width;
      document.getElementById("prog2").y2 = height;
      document.getElementById("prog" + i).x2 = catchUp;
    }
    else if (i === 4) {
      document.getElementById("prog1").x2 = width;
      document.getElementById("prog2").y2 = height;
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
    }
    else if (element === "prog3") {
      if (bar.x2 <= 0) {
        clearInterval(id);
      } else {
        bar.x2 -= updateInterval;
      }
    }
    else if (element === "prog4") {
      if (bar.y2 <= 0) {
        clearInterval(id);
      } else {
        bar.y2 -= updateInterval;
      }
    }
  }
}


updateOtp();
setInterval(timer, 1000);
resumeTimer();
