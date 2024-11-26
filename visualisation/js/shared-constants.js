// Indicators, including separate entries for partial completion
// const indSeparatedInfo = [
//   {indicator: "ind1_uncat", label: "Ratified UN Convention against Torture", country_text: " States", color: "#285391", text_color: "white", partial: false},
//   {indicator: "ind2_opcat", label: "Ratified UN Optional Protocol", country_text: " States", color: "#3f84e6", text_color: "black", partial: false},
//   {indicator: "ind3_report", label: "Submitted report to CAT", country_text: " States", color: "#8cb5f0", text_color: "black", partial: false},
//   {indicator: "ind4_constitution", label: "Prohibit torture in the constitution", country_text: " States", color: "#B38E09", text_color: "black", partial: false},
//   {indicator: "ind5_law_level_2", label: "Criminalize torture in domenstic law", country_text: " States (fully criminalized)", color: "#D9B841", text_color: "black", partial: false},
//   {indicator: "ind5_law_level_1", label: "", country_text: " States (partially criminalized)", color: "#D9B841", text_color: "white", partial: true, partial_hash_stroke: 4},
//   {indicator: "ind6_npm_level_2", label: "Have a National Preventive Mechanism", country_text: " States (designated and operational)", color: "#e36360", text_color: "black", partial: false},
//   {indicator: "ind6_npm_level_1", label: "", country_text: " States (designated only)", color: "#e36360", text_color: "black", partial: true, partial_hash_stroke: 4},
//   {indicator: "ind7_paris", label: "Have an NHRI that meets the Paris Principles", country_text: " States", color: "#f1b5b5", text_color: "black", partial: false}
// ];

const indSeparatedInfo = [
  {indicator: "ind1_uncat", label: "Ratified UN Convention against Torture", country_text: " States", color: "#285391", text_color: "white", partial: false},
  {indicator: "ind2_opcat", label: "Ratified UN Optional Protocol", country_text: " States", color: "#3f84e6", text_color: "black", partial: false},
  {indicator: "ind3_report", label: "Submitted report to CAT", country_text: " States", color: "#8cb5f0", text_color: "black", partial: false},
  {indicator: "ind4_constitution", label: "Prohibit torture in the constitution", country_text: " States", color: "#B38E09", text_color: "black", partial: false},
  {indicator: "ind5_law_level_2", label: "Criminalize torture in domenstic law", country_text: " States (fully criminalized)", color: "#D9B841", text_color: "black", partial: false},
  {indicator: "ind5_law_level_1", label: "", country_text: " States (partially criminalized)", color: "#D9B841", text_color: "white", partial: true},
  {indicator: "ind7_paris", label: "Have an NHRI that meets the Paris Principles", country_text: " States", color: "#e36360", text_color: "black", partial: false},
  {indicator: "ind6_npm_level_2", label: "Have a National Preventive Mechanism", country_text: " States (designated and operational)", color: "#f1b5b5", text_color: "black", partial: false},
  {indicator: "ind6_npm_level_1", label: "", country_text: " States (designated only)", color: "#f1b5b5", text_color: "black", partial: true}
];

// Indicators, no duplicates for partial completion
const indInfo = indSeparatedInfo.filter(entry => entry.partial === false);

// Whether visualisation should be interactive
const isInteractive = true;

// Region filters
// Can use id as label since capitalisation/format is correct
const filters = [
  {id: "All", label: "All regions", isActive: true},
  {id: "Americas", label: "Americas", isActive: false},
  {id: "Africa", label: "Africa", isActive: false},
  {id: "Europe", label: "Europe", isActive: false},
  {id: "Middle East", label: "Middle East", isActive: false},
  {id: "Asia-Pacific", label: "Asia-Pacific", isActive: false}
]

// Visualisation text
const text_ts_title = "A growing commitment to preventing torture";
const text_ts_p = "The APT has identified seven key legal measures that indicate a commitment to preventing torture. "
  + "Each bar shows the total number of States that have implemented each legal measure. "
  + "Stripes represent States that have partially implemented the measure.";
