// Create filter buttons and link to plot updates
// Plots need to be defined first

// How to update the stacked time series
const updateStackedTimeSeries = (filterID, data) => {

  // Dimensions
  const width = 1000;
  const height = 650;
  const margin = {top: 0, right: 300, bottom: 50, left: 50};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

 // Filter data
 const updatedData = (filterID === "All") 
   ? data // if all, keep same data
   : data.filter(d => d.region === filterID) // otherwise, only keep entries with same region

  // Data transformations
  const dataForStack = makeTimeSeriesDataForStack(updatedData);
  const stackData = makeTimeSeriesStackData(dataForStack, indSeparatedInfo);
  const stackDataRepeatedPartial = makeTimeSeriesStackDataRepeatedPartial(stackData, indSeparatedInfo);

  // Scales
  [xScaleBand, yScale] = makeTimeSeriesScales(
    updatedData, stackData, dataForStack, innerWidth, innerHeight, true
  );

  // Update data for bars
  stackDataRepeatedPartial.forEach(series => {
    d3.selectAll(`.bar-${series.key}`)
    .data(series)
        // Custom bars
        .attr("d", (d, i) => makeTimeSeriesBarPath(d, i, series, xScaleBand, innerHeight));
  });

  // Update series labels (indicator and number of countries)
  const indLabelData = makeTimeSeriesIndLabelData(
    stackData, indSeparatedInfo, xScaleBand, yScale)
  d3.selectAll(".ts-ind-label")
    .data(indLabelData)
      .attr("class", d => `ts-ind-label ts-ind-label-${d.indicator}`)
      .text(d => d.label) // indicator label
      .attr("x", d => d.x) 
      .attr("y", d => d.y);
  d3.selectAll(".ts-country-label")
    .data(indLabelData)
      .attr("class", d => `ts-country-label ts-country-label-${d.indicator}`)
      .text(d => d.countryLabel) // number of countries
      .attr("x", d => d.x)
      .attr("y", d => d.yCountry);

  // Update y-ref bar and text
  const [yBarY1, yBarY2] = computeYBarRefEndpoints(updatedData, yScale);
  d3.select("#ts-yref-bar")
    .attr("y1", yBarY1)
    .attr("y2", yBarY2);
  d3.select("#ts-yref-number")
    .text(`${getNumCountries(updatedData)} states`);
  d3.select("#ts-yref-region")
    .text(`${getRegionSentenceText(filterID)}`);

}


// Create filters and add event listener for updtaing plot
const createFilters = (data) => {
  d3.select("#filters")
    .selectAll(".filter")
    .data(regionFilters)
    .join("button")
      .attr("class", d => `filter ${d.isActive ?
        "active" : ""}`)
      .text(d => d.label)
      .on("click", (e, d) => {
        //console.log("DOM event", e);
        //console.log("Event data", d);
        // update if not the active button
        if (!d.isActive) {
          // Change active button and store
          regionFilters.forEach(filter => {
            filter.isActive = (d.id === filter.id)
          });
          // Also update which buttons that have active class
          d3.selectAll(".filter")
            .classed("active", filter => (filter.id === d.id));

          // Update plot
          updateStackedTimeSeries(d.id, data)
        }
      });
}
