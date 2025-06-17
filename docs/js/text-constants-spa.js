// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// VARIABLES FOR TEXT DEPENDENT ON LANGUAGE - SPANISH VERSION
//
// TRANSLATION NOTES:
//
// <br> are linebreaks used to wrap text around the visualisations, and they can be 
// added at any point (do not try to maintain exact placements in translations)

// How to refer to countries/states
const statesText = "Estados"
const statesTextSingular = "Estados" // singular version

// Indicator labels
// Keep this order!
const indInfoLabels = [
    "Ratificación de la CAT(ONU)",
    "Ratificación del OPCAT(ONU)",
    "Presentación del informe nacional al Comité ONU",
    "Prohibición de la tortura en la Constitución",
    "Tipificación en la legislación nacional",
    "La INDH conforme a los Principios de París",
    "Existencia de un MNP"
]

// Text for different levels for criminalisation in domestic law and NPM
// First is for full, second is for partial
// Keep extra space before text
const lawLevelsText = [
    " (totalmente tipificado como delito)",
    " (tipificado como delito parcialmente)"
]
const npmLevelsText = [
    " (designado y operativo)",
    " (solo designado)"
]

// Time series plot --------------------------------------------------------------------
// Visualisation text
const textTsTitle = "Mapa de progreso del compromiso con la prevención de la tortura";
const textTsP = "La APT identificó ocho medidas legales clave que indican un compromiso "
    + "con la prevención de la tortura. "
    + "Cada barra muestra el número total de Estados que implementaron cada medida legal, "
    + "con rayas se<br>indican las implementaciones parciales."

// Labels for regions for buttons used to filter the bar chart
const regionFiltersLabels = [
    "Todas las regiones",
    "América",
    "África",
    "Europa",
    "Medio Oriente",
    "Asia-Pacífico"
]

// How regions are referred to in the bar chart legend
const regionFiltersTextSentence = [
    "en todo el mundo",
    "en América",
    "en África",
    "en Europa",
    "en Oriente Medio",
    "en Asia-Pacífico"
]

// Radial plot -------------------------------------------------------------------------
// Visualisation text
const textRadialTitle = "Acción continua hacia la prevención de la tortura";
const textRadialP = "Para crear un mundo sin tortura, todos los Estados deben comprometerse a prevenirla. "
    + "Cada barra muestra cuándo un Estado implementó esta medida de prevención<br>de la tortura, "
    + "con rayas que indican implementaciones parciales."
const textRadialPHover = "Pasa el cursor por encima de las barras para ver los detalles<br>de cada estado."