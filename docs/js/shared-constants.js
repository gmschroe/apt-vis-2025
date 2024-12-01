// Indicators, including separate entries for partial completion
const indSeparatedInfo = [
  {indicator: "ind1_uncat", label: "Ratified UN Convention against Torture", country_text: "", color: "#285391", text_color: "white", partial: false, n_levels: 1},
  {indicator: "ind2_opcat", label: "Ratified UN Optional Protocol", country_text: "", color: "#3f84e6", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind3_report", label: "Submitted report to Committee against Torture", country_text: "", color: "#8cb5f0", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind4_constitution", label: "Prohibit torture in the constitution", country_text: "", color: "#B38E09", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind5_law_level_2", label: "Criminalize torture in domestic law", country_text: " (fully criminalized)", color: "#D9B841", text_color: "black", partial: false, n_levels: 2},
  {indicator: "ind5_law_level_1", label: "", country_text: " (partially criminalized)", color: "#D9B841", text_color: "white", partial: true, n_levels: 2},
  {indicator: "ind7_paris", label: "Have an NHRI that meets the Paris Principles", country_text: "", color: "#e36360", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind6_npm_level_2", label: "Have a National Preventive Mechanism", country_text: " (designated and operational)", color: "#f1b5b5", text_color: "black", partial: false, n_levels: 2},
  {indicator: "ind6_npm_level_1", label: "", country_text: " (designated only)", color: "#f1b5b5", text_color: "black", partial: true, n_levels: 2}
];

// Indicators, no duplicates for partial completion
const indInfo = structuredClone(indSeparatedInfo.filter(entry => entry.partial === false));
indInfo.forEach(entry => {
  if (entry.indicator.includes("ind5_law")) {
    entry.indicator = "ind5_law";
  } else if (entry.indicator.includes("ind6_npm")) {
    entry.indicator = "ind6_npm";
  }
});
// Whether visualisation should be interactive
const isInteractive = true;

// Region filters
// Can use id as label since capitalisation/format is correct
const regionFilters = [
  {id: "All", label: "All regions", isActive: true, textSentence: "around the world"},
  {id: "Americas", label: "Americas", isActive: false, textSentence: "in the Americas"},
  {id: "Africa", label: "Africa", isActive: false, textSentence: "in Africa"},
  {id: "Europe", label: "Europe", isActive: false, textSentence: "in Europe"},
  {id: "Middle East", label: "Middle East", isActive: false, textSentence: "in the Middle East"},
  {id: "Asia-Pacific", label: "Asia-Pacific", isActive: false, textSentence: "in the Asia-Pacific"}
]


// Time series plot
// Visualisation text
const textTsTitle = "A growing commitment to preventing torture";
const textTsP = "The APT has identified seven key legal measures that indicate a commitment to preventing torture. "
  + "Each bar shows the total number of states that have implemented each legal measure, "
  + "with<br>stripes indicating partial implementations.<br>These steps add together to provide<br>the legal barriers to torture.";

// Spacing between text for ybar reference
// need to define here so can update bar location correctly
const dyRef = 12;
const dyRefLarge = 18;

// Radial plot
const textRadialTitle = "Preventing torture through international cooperation";
const textRadialP = "To create a world without torture, every state needs to commit to preventing torture. "
  + "Each bar shows when a state implemented this torture prevention measure, with stripes indicating partial implementations. "
  + "Our goal is to close this ring by having every state implement the measure."

const radialTooltipWidth = 65;
const radialTooltipHeight = 35;
