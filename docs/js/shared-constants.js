// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// VARIABLES FOR TEXT DEPENDENT ON LANGUAGE
//
// TRANSLATION NOTES:
//
// <br> are linebreaks used to wrap text around the visualisations, and they can be 
// added at any point (do not try to maintain exact placements in translations)
//
// TODO: also need country/region names - maybe easier to add in the dataset itself

// Visualisation language (NOT YET IMPLEMENTED)
const visLanguage = "en"

// How to refer to countries/states
const statesText = "states"
const statesTextSingular = "state" // singular version

// Indicator labels
// Keep this order!
const indInfoLabels = [
  "Ratified UN Convention against Torture", 
  "Ratified UN Optional Protocol",
  "Submitted report to Committee against Torture",
  "Prohibit torture in the constitution",
  "Criminalize torture in domestic law",
  "Have an NHRI that meets the Paris Principles",
  "Have a National Preventive Mechanism"
]

// Text for different levels for criminalisation in domestic law and NPM
// First is for full, second is for partial
// Keep extra space before text
const lawLevelsText = [
  " (fully criminalized)",
  " (partially criminalized)"
]
const npmLevelsText = [
  " (designated and operational)",
  " (designated only)"
]

// Time series plot --------------------------------------------------------------------
// Visualisation text
const textTsTitle = "A growing commitment to preventing torture";
const textTsP = "The APT has identified seven key legal measures that indicate a commitment to preventing torture. "
  + "Each bar shows the total number of states that have implemented each legal measure, "
  + "with<br>stripes indicating partial implementations.<br>These steps add together to provide<br>the legal barriers to torture.";

// Legend text for number of states (that is not region-specific)
// For barLegendImplementation1 and barLegendImplementation2, translate 
// "to implement each measure" and then split translation across the two variables to 
// control the line break (i.e., translations do not need to match variable-level wording)
const barLegendGoal = "Our goal is for all"
const barLegendImplementation1 = "to implement each" // first line of end of legend
const barLegendImplementation2 = "measure" // second line of end of legend

// Labels for regions for buttons used to filter the bar chart
const regionFiltersLabels = [
  "All regions",
  "Americas",
  "Africa",
  "Europe",
  "Middle East",
  "Asia-Pacific"
]

// How regions are referred to in the bar chart legend
const regionFiltersTextSentence = [
  "around the world",
  "in the Americas",
  "in Africa",
  "in Europe",
  "in the Middle East",
  "in the Asia-Pacific"
]

// Radial plot -------------------------------------------------------------------------
// Visualisation text
const textRadialTitle = "Preventing torture through international cooperation";
const textRadialP = "To create a world without torture, every state needs to commit to preventing torture. "
  + "Each bar shows when a state implemented this torture prevention measure, with stripes indicating partial implementations. "
  + "<br>Our goal is to close this ring by having<br>every state implement the measure."

// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// OTHER SHARED CONSTANTS - DO NOT NEED TRANSLATIONS
// Indicators, including separate entries for partial completion
const indSeparatedInfo = [
  {indicator: "ind1_uncat", label: indInfoLabels[0], country_text: "", color: "#285391", text_color: "white", partial: false, n_levels: 1},
  {indicator: "ind2_opcat", label: indInfoLabels[1], country_text: "", color: "#3f84e6", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind3_report", label: indInfoLabels[2], country_text: "", color: "#8cb5f0", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind4_constitution", label: indInfoLabels[3], country_text: "", color: "#B38E09", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind5_law_level_2", label: indInfoLabels[4], country_text: lawLevelsText[0], color: "#D9B841", text_color: "black", partial: false, n_levels: 2},
  {indicator: "ind5_law_level_1", label: "", country_text: lawLevelsText[1], color: "#D9B841", text_color: "white", partial: true, n_levels: 2},
  {indicator: "ind7_paris", label: indInfoLabels[5], country_text: "", color: "#e36360", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind6_npm_level_2", label: indInfoLabels[6], country_text: npmLevelsText[0], color: "#f1b5b5", text_color: "black", partial: false, n_levels: 2},
  {indicator: "ind6_npm_level_1", label: "", country_text: npmLevelsText[1], color: "#f1b5b5", text_color: "black", partial: true, n_levels: 2}
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
// TODO: check if used; if not, remove
const isInteractive = true;

// Region filters
const regionFilters = [
  {id: "All", label: regionFiltersLabels[0], isActive: true, textSentence: regionFiltersTextSentence[0]},
  {id: "Americas", label: regionFiltersLabels[1], isActive: false, textSentence: regionFiltersTextSentence[1]},
  {id: "Africa", label: regionFiltersLabels[2], isActive: false, textSentence: regionFiltersTextSentence[2]},
  {id: "Europe", label: regionFiltersLabels[3], isActive: false, textSentence: regionFiltersTextSentence[3]},
  {id: "Middle East", label: regionFiltersLabels[4], isActive: false, textSentence: regionFiltersTextSentence[4]},
  {id: "Asia-Pacific", label: regionFiltersLabels[5], isActive: false, textSentence: regionFiltersTextSentence[5]}
]

// Bar plot constants
// Spacing between text for ybar reference
// need to define here so can update bar location correctly
const dyRef = 12;
const dyRefLarge = 18;

// Radial plot constants
const radialTooltipWidth = 65;
const radialTooltipHeight = 35;
