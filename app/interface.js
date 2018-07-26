import {TOKEN_NUM,COLORS,FONTS} from "../common/globals.js";
import document from "document";
import { me as device } from "device";
import { monoDigits } from "../common/util.js"

export function AuthUI() {
  this.tokenList = document.getElementById("tokenList");
  this.statusText = document.getElementById("status");
  this.loadingText = document.getElementById("loading-text");
  this.loadingAnim = document.getElementById("loading-anim");
  this.spinnerCenter = document.getElementById("spinner-center");
  this.spinnerCorner = document.getElementById("spinner-corner");
  this.statusBg = document.getElementById("status-bg");
  this.prog = ['0','1','2','3'].map(num => document.getElementById(`prog${num}`));
  this.prog_bg = ['0','1','2','3'].map(num => document.getElementById(`prog${num}-bg`));
  this.width = device.screen.width;
  this.height = device.screen.height;
  this.ids = [];

  this.tiles = [];
  for (let i=0; i<TOKEN_NUM; i++) {
    let tile = document.getElementById(`token-${i}`);
    if (tile) {
      this.tiles.push(tile);
    }
  }
}

AuthUI.prototype.updateUI = function(state, totps, groups) {
  this.statusBg.style.display = "none";

  if (state === "loaded") {
    this.spinnerCenter.state = "disabled";
    if (totps.length === 0) {
      this.updateUI("none");
      return;
    } 
    this.tokenList.style.display = "inline";
    this.statusText.text = "";
    for (let p of this.prog) {
      p.style.visibility = "visible";
    }

    this.updateTokens(totps, groups);
  }
  else {
    this.tokenList.style.display = "none";
    this.stopAnimation();

    if (state === "loading") {
      this.spinnerCenter.state = "enabled";
      this.statusText.text = "LOADING TOKENS";
    }
    else if (state === "none") {
      this.statusText.text = "No valid tokens, please add via settings."
    }
    else if (state === "error") {
      this.statusText.text = "An error has occured. Please ensure the companion is connected and restart the application.";
    }
  }
}

AuthUI.prototype.updateTextTimer = function(time) {
  if (time === "loading") {
    this.spinnerCorner.state = "enabled";
    document.getElementById("time-left").text = "";
  } else {
    this.spinnerCorner.state = "disabled";
    document.getElementById("time-left").text = time;
  }
}

AuthUI.prototype.updateTokens = function(totps, groups) {
  for (let i=0; i<TOKEN_NUM; i++) {
    let tile = this.tiles[i];
    
    if (!tile) {
      continue;
    }
    
    try {
      const token_val = totps[i]["totp"];
      const token_name = totps[i]["name"];
    } catch (e) {
      tile.style.display = "none";
      continue;
    }
 
    tile.style.display = "inline";
    let display_totp = monoDigits(token_val);
    
    switch (groups) {
      case 0:
        tile.getElementById("totp").text = display_totp;
        break;
      case 1:
        tile.getElementById("totp").text = display_totp.slice(0,3) + " " + display_totp.slice(3,6);
        break;
      case 2:
        tile.getElementById("totp").text = display_totp.slice(0,2) + " " + display_totp.slice(2,4) + " " + display_totp.slice(4,6);
        break;
      default:
        tile.getElementById("totp").text = display_totp.slice(0,3) + " " + display_totp.slice(3,6);
    }
    tile.getElementById("totp-name").text = token_name;    
  }
}

AuthUI.prototype.updateColors = function(color) {
  let time_bg = document.getElementById("time-bg")
  let totps = document.getElementsByClassName("totp");
  
  for (let i in this.prog) {
    this.prog[i].style.fill = COLORS[color].color;
    this.prog_bg[i].style.fill = COLORS[color].color;
  }
  for (let totp of totps) {
    totp.style.fill = COLORS[color].color;
  }
  time_bg.style.fill = COLORS[color].color;
}

AuthUI.prototype.updateFont = function(font) {
  let texts = document.getElementsByTagName("text");
  for (let t in texts) {
    texts[t].style.fontFamily = FONTS[font].name;
  }
}

AuthUI.prototype.updateCounter = function(toggle) {
  let remaining = document.getElementById("time-left");
  let circle = document.getElementById("time-bg");
  
  if (toggle) {
    remaining.style.opacity = 1;
    circle.style.opacity = 1;
  } else {
    remaining.style.opacity = 0;
    circle.style.opacity = 0;
  }
}

AuthUI.prototype.startProgress = function(num) {
  let updateInterval = 1;
  let bar = this.prog[num];
  let self = this;
  let id = setInterval(frame, 13);
  this.ids.push(id);
  
  function frame() {
    if (num === 0) {
      if (bar.x2 >= self.width) {
        clearInterval(id);
        self.prog[1].y2 = 0;
        self.startProgress(1);
      } else {
        bar.x2 += updateInterval;
      }
    }
    else if (num === 1) {
      if (bar.y2 >= self.height) {
        clearInterval(id);
        self.prog[2].x2 = self.width;
        self.startProgress(2);
      } else {
        bar.y2 += updateInterval;
      }
    } else if (num === 2) {
      if (bar.x2 <= 0) {
        clearInterval(id);
        self.prog[3].y2 = self.height;
        self.startProgress(3);
      } else {
        bar.x2 -= updateInterval;
      }
    } else if (num === 3) {
      if (bar.y2 <= 0) {
        clearInterval(id);
      } else {
        bar.y2 -= updateInterval;
      }
    }
  }
}

AuthUI.prototype.clearProgress = function() {
  this.stopAnimation();
  this.prog[0].x2 = 0;
  this.prog[1].y2 = 0;
  this.prog[2].x2 = this.width;
  this.prog[3].y2 = this.height;
}

AuthUI.prototype.resumeTimer = function() {
  let epoch = Math.round(new Date().getTime() / 1000.0);
  let catchUp = (epoch % 30) * 43;
  let i=0;
  this.clearProgress();
  while (catchUp > 0) {
    if (i === 0) {
      this.prog[0].x2 = Math.min(this.width,catchUp);
    } else if (i === 1) {
      this.prog[0].x2 = this.width;
      this.prog[1].y2 = Math.min(this.height,catchUp);
    } else if (i === 2) {
      this.prog[0].x2 = this.width;
      this.prog[1].y2 = this.height;
      this.prog[2].x2 = Math.min(this.width,this.width - catchUp);
    } else if (i === 3) {
      this.prog[0].x2 = this.width;
      this.prog[1].y2 = this.height;
      this.prog[2].x2 = 0;
      this.prog[3].y2 = Math.min(this.height,this.height - catchUp);
    }
    i++;
    catchUp -= this.width;
  } 
  
  if (i === 0) {
    this.startProgress(0);
  } else {
    this.startProgress(i-1);
  }
}

AuthUI.prototype.stopAnimation = function() {
  for (let i of this.ids) {
    clearInterval(i);
  }
}