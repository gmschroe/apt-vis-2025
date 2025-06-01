// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------
// VARIABLES FOR TEXT DEPENDENT ON LANGUAGE - PORTUGUESE VERSION
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
    "Ratificou a Convenção das Nações Unidas contra a Tortura",
    "Ratificou o Protocolo Facultativo das Nações Unidas",
    "Apresentou relatório ao Comitê contra a Tortura",
    "Proibiu a tortura na Constituição",
    "Criminalizou a tortura na legislação nacional",
    "Possui uma instituição nacional de direitos humanos que cumpre os Princípios de Paris",
    "Possui um mecanismo nacional de prevenção"
]

// Text for different levels for criminalisation in domestic law and NPM
// First is for full, second is for partial
// Keep extra space before text
const lawLevelsText = [
    " (integralmente criminalizada)",
    " (parcialmente criminalizada)"
]
const npmLevelsText = [
    " (designado e operacional)",
    " (apenas designado)"
]

// Time series plot --------------------------------------------------------------------
// Visualisation text
const textTsTitle = "Mapa de progressos no compromisso de prevenir a tortura";
const textTsP = "A APT identificou oito medidas jurídicas essenciais que indicam "
    + "compromisso com a prevenção da tortura. "
    + "Cada barra mostra o número total de Estados que implementaram integralmente cada "
    + "medida<br>jurídica, com listras indicando as<br>implementações parciais."

// Labels for regions for buttons used to filter the bar chart
const regionFiltersLabels = [
    "Todas as regiões",
    "Américas",
    "África",
    "Europa",
    "Oriente Médio",
    "Ásia-Pacífico"
]

// How regions are referred to in the bar chart legend
const regionFiltersTextSentence = [
    "em todo o mundo",
    "nas Américas",
    "na África",
    "na Europa",
    "no Oriente Médio",
    "na Ásia-Pacífico"
]

// Radial plot -------------------------------------------------------------------------
// Visualisation text
const textRadialTitle = "Ação contínua para a prevenção da tortura";
const textRadialP = "Para criar um mundo sem tortura, todos os Estado precisam se comprometer "
    + "com a prevenção da tortura. "
    + "Cada barra mostra quando um Estado implementou integralmente tal medida de prevenção<br>da tortura, "
    + "com listras indicando as implementações parciais."
const textRadialPHover = "Passe o cursor sobre as barras para ver os detalhes de cada estado."