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
  {indicator: "ind8_paris", label: indInfoLabels[5], country_text: "", color: "#cb5956", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind7_npm_operational", label: indInfoLabels[7], country_text: "", color: "#e48a88", text_color: "black", partial: false, n_levels: 1},
  {indicator: "ind6_npm_designated", label: indInfoLabels[6], country_text: "", color: "#f9bbbb", text_color: "black", partial: false, n_levels: 1}
];
console.log("indSeparatedInfo", indSeparatedInfo)

// Indicators, no duplicates for partial completion
const indInfo = structuredClone(indSeparatedInfo.filter(entry => entry.partial === false));
indInfo.forEach(entry => {
  if (entry.indicator.includes("ind5_law")) {
    entry.indicator = "ind5_law";
  }
});
console.log("indInfo", indInfo)

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
const barDim = {width: 1000, height: 650, margins: {top: 0, right: 320, bottom: 50, left: 50}}
const dyRef = 14;
const dyRefLarge = 18;

// Radial plot constants
const radialDim = {width: 1000, height: 700, margins: {top: 0, right: 300, bottom: 0, left: 0}}
const radialTooltipWidth = 65;
const radialTooltipHeight = 35;
