// Paths must start with directory in root directory (docs)

let dataRoot = "../"; // for languages other than english
switch (lang) {
    case "eng":
        dataRoot = "";
        break;
}
// Levels separated into separate indicators, for time series bar plot
d3.csv(`${dataRoot}data/data_apt_bar.csv`, d3.autoType).then(data => {
    drawStackedTimeSeries(data);
    createRegionFilters(data);
})

// Levels encoded as different values, for radial plots
d3.csv(`${dataRoot}data/data_apt_radial.csv`, d3.autoType).then(data => {
    drawRadialPlots(data);
    createIndicatorFilters(data);
    createRadialTooltip();
})
