// Indicators, including separate entries for partial completion
const indSeparatedInfo = [
  {indicator: "ind1_uncat", label: "Ratified UN Convention against Torture", country_text: " countries", color: "#285391", text_color: "white", partial: false},
  {indicator: "ind2_opcat", label: "Ratified UN Optional Protocol", country_text: " countries", color: "#3f84e6", text_color: "white", partial: false},
  {indicator: "ind3_report", label: "Submitted report to CAT", country_text: " countries", color: "#8cb5f0", text_color: "black", partial: false},
  {indicator: "ind4_constitution", label: "Prohibit torture in the constitution", country_text: " countries", color: "#cfa91f", text_color: "white", partial: false},
  {indicator: "ind5_law_level_2", label: "Criminalise torture in domenstic law", country_text: " countries (fully)", color: "#f2d672", text_color: "black", partial: false},
  {indicator: "ind5_law_level_1", label: "", country_text: " countries (partially)", color: "#AB8600", text_color: "white", partial: true},
  {indicator: "ind6_npm_level_2", label: "Have a National Preventive Mechanism", country_text: " countries (designated and operational)", color: "#e36360", text_color: "white", partial: false},
  {indicator: "ind6_npm_level_1", label: "", country_text: " countries (designated only)", color: "#e36360", text_color: "white", partial: true},
  {indicator: "ind7_paris", label: "Have a National Human Rights Institution", country_text: " countries", color: "#f1b5b5", text_color: "black", partial: false}
];

// Indicators, no duplicates for partial completion
const indInfo = indSeparatedInfo.filter(entry => entry.partial === false);


// Visualisation text
const text_ts_title = "A growing commitment to preventing torture"
const text_ts_p = "The APT has identified seven key legal measures that indicate a commitment to preventing torture. Each bar shows the total number of countries that have committed to each legal measure."
