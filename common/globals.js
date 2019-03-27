export const TOKEN_LIST = "token_list"; //displayed in settings
export const FILE_NAME = "tokens.json"; //internal token storage
export const TOKEN_NUM = 10;

export const DEFAULT_SETTINGS = {
  color: "0",
  font: {"selected":[0],"values":[{"name":"System-Regular"}]},
  text_toggle: false,
  groups: {"selected":[1],"values":[{"name":"Two (123 456)","value":"1"}]},
  display_always: false
};

export const COLORS = [
  {color: "#001F3F", value: "0"}, //navy
  {color: "#0074D9", value: "1"}, //blue
  {color: "#39CCCC", value: "2"}, //teal
  {color: "#327d5b", value: "3"}, //olive
  {color: "#2ECC40", value: "4"}, //green
  {color: "#EBCB00", value: "5"}, //yellow
  {color: "#FF851B", value: "6"}, //orange
  {color: "#FF4136", value: "7"}, //red
  {color: "#F012BE", value: "8"}, //fuchsia
  {color: "#B10DC9", value: "9"}, //purple
  {color: "#85144B", value: "10"}, //maroon
  {color: "#969696", value: "11"}, //gray
  {color: "#111111", value: "12"} //black
]

export const FONTS = [
  {name: "System-Regular"},
  {name: "Tungsten-Medium"},
  {name: "Colfax-Regular"},
  {name: "Fabrikat-Bold"},
  {name: "Seville-Condensed"}
]