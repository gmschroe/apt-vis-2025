// Paths must start with directory in root directory (docs)

// Levels separated into separate indicators, for time series plot
d3.csv("data/data_apt_ts_separated.csv", d3.autoType).then(data => {
    console.log("ts data", data.slice(0, 50));
    drawStackedTimeSeries(data);
    createRegionFilters(data);
})

// Levels encoded as different values, for radial plots
d3.csv("data/data_apt_ts.csv", d3.autoType).then(data => {
    console.log("radial data", data.slice(0, 50));
    drawRadialPlots(data);
    createIndicatorFilters(data);
})
