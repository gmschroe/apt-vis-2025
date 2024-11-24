// Create filter buttons and link to plot updates
// Plots need to be defined first

// How to update the stacked time series
const updateStackedTimeSeries = (filterID, data) => {

  // Dimensions
  const width = 1000;
  const height = 600;
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
  [xScaleBand, yScale] = makeTimeSeriesScales(stackData, dataForStack, innerWidth, innerHeight);

  // Update data for bars
  stackDataRepeatedPartial.forEach(series => {
    console.log("filterid", filterID, "series", series)
    d3.selectAll(`.bar-${series.key}`)
    .data(series)
        // Custom bars
        .attr("d", (d, i) => makeTimeSeriesBarPath(d, i, series, xScaleBand, innerHeight))
        // Fill 
        .attr("fill", addTimeSeriesBarFill(series, indSeparatedInfo))
        // If partial_overlay, decrease opacity
        .attr("fill-opacity", setTimeSeriesBarOpacity(series))
  });
}


// Create filters and add event listener for updtaing plot
const createFilters = (data) => {
  d3.select("#filters")
    .selectAll(".filter")
    .data(filters)
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
          filters.forEach(filter => {
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
