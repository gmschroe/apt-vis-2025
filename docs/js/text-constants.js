// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// VARIABLES FOR TEXT DEPENDENT ON LANGUAGE - ENGLISH VERSION
//
// TRANSLATION NOTES:
//
// <br> are linebreaks used to wrap text around the visualisations, and they can be 
// added at any point (do not try to maintain exact placements in translations)

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
  "Criminalise torture in domestic law",
  "Have an NHRI that meets the Paris Principles",
  "Have a designated NPM",
  "Have an operational NPM"
]

// Partial criminialisation 
const indInfoLabelsPartialCriminialisation = `Partially ${lowercaseFirstLetter(indInfoLabels[4])}`;

// Text for different levels for criminalisation in domestic law
// First is for full, second is for partial
// Keep extra space before text
const lawLevelsText = [
  " (fully criminalised)",
  " (partially criminalised)"
]

// Time series plot --------------------------------------------------------------------
// Visualisation text
const textTsTitle = "Progressing towards global commitment to torture prevention";
const textTsP = "The APT has identified eight key legal measures that indicate a commitment to preventing torture. "
  + "Each <br> bar shows the total number of states that have implemented each legal measure, "
  + "with<br>stripes indicating partial implementations.";

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
const textRadialTitle = "Continuous action towards torture prevention";
const textRadialP = "To create a world without torture, every state needs to commit to preventing torture. "
  + "Each bar shows when a state implemented this torture prevention measure, with stripes indicating partial implementations."
const textRadialPHover = "Hover over the bars to see the details for each state."
const textNotImplemented = "Not implemented";