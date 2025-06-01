// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// VARIABLES FOR TEXT DEPENDENT ON LANGUAGE - FRENCH VERSION
//
// TRANSLATION NOTES:
//
// <br> are linebreaks used to wrap text around the visualisations, and they can be 
// added at any point (do not try to maintain exact placements in translations)

// How to refer to countries/states
const statesText = "États"
const statesTextSingular = "État" // singular version

// Indicator labels
// Keep this order!
const indInfoLabels = [
    "A ratifié la Convention des Nations Unies contre la torture",
    "A ratifié le Protocole facultatif des Nations Unies",
    "A soumis un rapport au Comité contre la torture",
    "Interdit la torture dans la Constitution",
    "A criminalisé la torture dans le droit national",
    "Dispose d'une institution nationale des droits de l'homme conforme aux Principes de Paris",
    "Dispose d'un mécanisme national de prévention"
]

// Text for different levels for criminalisation in domestic law and NPM
// First is for full, second is for partial
// Keep extra space before text
const lawLevelsText = [
    " (entièrement criminalisé)",
    " (partiellement criminalisé)"
]
const npmLevelsText = [
    " (désigné et opérationnel)",
    " (désigné uniquement)"
]

// Time series plot --------------------------------------------------------------------
// Visualisation text
const textTsTitle = "Cartographie des progrès réalisés dans la lutte contre la torture";
const textTsP = "L'APT a identifié huit mesures juridiques clés qui témoignent d'un "
    + "engagement en faveur de la prévention de la torture. "
    + "Chaque barre indique<br>le nombre total d'États qui ont mis en œuvre<br>chaque mesure juridique, "
    + "les rayures<br>indiquant les mises en œuvre partielles."

// Labels for regions for buttons used to filter the bar chart
const regionFiltersLabels = [
    "Toutes les régions",
    "Amériques",
    "Afrique",
    "Europe",
    "Moyen-Orient",
    "Asie-Pacifique"
]

// How regions are referred to in the bar chart legend
const regionFiltersTextSentence = [
    "dans le monde entier",
    "dans les Amériques",
    "en Afrique",
    "en Europe",
    "au Moyen-Orient",
    "en Asie-Pacifique"
]

// Radial plot -------------------------------------------------------------------------
// Visualisation text
const textRadialTitle = "Action continue en faveur de la prévention de la torture";
const textRadialP = "Pour créer un monde sans torture, "
    + "chaque État doit s'engager à prévenir la torture. "
    + "Chaque barre indique la date à laquelle un État a<br>mis en œuvre cette mesure de prévention "
    + "<br>de la torture, les rayures indiquant<br>les mises en œuvre partielles."

const textRadialPHover = "Passez la souris sur les barres pour voir les détails de chaque état."