// Create filter buttons and link to plot updates
// Plots need to be defined first

// TIME SERIES

// How to update the stacked time series
const updateStackedTimeSeries = (filterID, data) => {

  // Dimensions
  // TODO: make these shared constants
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


// Create region filters and add event listener for updtaing plot
const createRegionFilters = (data) => {
  d3.select("#region-filters")
    .selectAll(".filter")
    .data(regionFilters)
    .join("button")
      .attr("class", d => `filter ${d.isActive ?
        "active" : ""}`)
      .text(d => d.label)
      .on("click", (e, d) => {
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

// RADIAL
const updateRadialPlots = (filterID, data) => {
  console.log("indicator", filterID)

  // Data
  const indData = prepIndData(data, filterID); // start with first indicator
  const maxLevel = getMaxLevel(indData);

  // Scales
  const [xScale, yScale, colorScale] = makeRadialScales(indData);

  // Plot data/paths
  const firstYears = getFirstYears(indData);
  const arcGenerator = makeArcGenerator(indData, xScale, yScale);

  // Update bars
  // TODO - would be better if can organise data so each 
  // country has entries for all levels so can update bars instead
  // of deleting  them
  innerChart = d3.select("#g-radial-paths")

  // remove existings bars since different indicators have a different number of bars
  innerChart
    .selectAll(".radial-path").remove() 

  // new bars
  innerChart
    .selectAll("path")
    .data(firstYears) // new data
    .join("path") // new paths
      .attr("class", "radial-path")
      .attr("d", arcGenerator)
      .attr("fill", d => addRadialBarFill(d, maxLevel, colorScale))
      .attr("stroke", d => addRadialBarStroke(d, colorScale))
      .attr("stroke-width", d => addRadialBarStrokeWidth(d));
}

// How to update radial plot

// Create indicator filters (using dropdown)
const createIndicatorFilters = (data) => {

  const dropdownContainer = d3.select("#indicator-filters");
  const selectedDiv = dropdownContainer.select(".dropdown-selected");
  const optionsDiv = dropdownContainer.select(".dropdown-options");

  // First indicator is default option
  const defaultOption = indInfo[0];
  selectedDiv
    .text(defaultOption.label)
    .style("background-color", defaultOption.color)
    .style("color", defaultOption.text_color);

  // Add arrow
  const arrowClass = "bi bi-caret-down-fill";
  selectedDiv
    .append("i")
      .attr("class", arrowClass);

  // Create options
  optionsDiv.selectAll("div")
    .data(indInfo)
    .join("div")
      .attr("class", "dropdown-option")
      .style("background-color", d => d.color)
      .style("color", d => d.text_color)
      .text(d => d.label)
      .on("click", function(event, d) {

        // Dropdown updates
        selectedDiv.text(d.label); // updates selection
        selectedDiv.style("background-color", d.color) // updates color
        selectedDiv.style("color", d.text_color)
        selectedDiv.append("i").attr("class", arrowClass); // re-adds icon
        optionsDiv.classed("hidden", true); // closes dropdown

        // Visualisation updates
        updateRadialPlots(d.indicator, data);
      });
    
    // Toggle visibility of options
    selectedDiv.on("click", () => {
      optionsDiv.classed("hidden", !optionsDiv.classed("hidden"));
    });

    // Closes dropdown if click outside
    document.addEventListener("click", (event) => {
      if (!dropdownContainer.node().contains(event.target)) {
        optionsDiv.classed("hidden", true);
      }
    });

}
