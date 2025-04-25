// Paths must start with directory in root directory (docs)

// Levels separated into separate indicators, for time series bar plot
d3.csv("data/data_apt_bar.csv", d3.autoType).then(data => {
    drawStackedTimeSeries(data);
    createRegionFilters(data);
})

// Levels encoded as different values, for radial plots
d3.csv("data/data_apt_radial.csv", d3.autoType).then(data => {
    drawRadialPlots(data);
    createIndicatorFilters(data);
    createRadialTooltip();
})
