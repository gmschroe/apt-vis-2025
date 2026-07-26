// Create filter buttons and link to plot updates
// Plots need to be defined first

// TIME SERIES

// How to update the stacked time series
const updateStackedTimeSeries = (filterID, data) => {

  // Dimensions
  const width = barDim.width;
  const height = barDim.height;
  const margin = barDim.margins;
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
    updatedData, stackData, indSeparatedInfo, xScaleBand, yScale)

  const labels = d3.selectAll(".ts-label")
    .data(indLabelData);

  labels
    .attr("class", d => `ts-label ts-label-${d.indicator}`)
    .attr("x", d => d.x)
    .attr("y", d => d.y);

  labels.select(".ts-country-label")
    .text(d => d.countryLabel);

  labels.select(".ts-ind-label")
    .text(d => ` ${d.indLabel}`);

  d3.select(".ts-labels-header")
    .attr("x", indLabelData[0].x)
    .attr("y", indLabelData[0].y - 10)
  
  // Update y-ref bar and text
  const yBarY = computeYBarRefEndpoints(updatedData, yScale);
  let barNum = 0; 
  yBarY.forEach(y => {
    d3.select(`#ts-yref-reflines${barNum}`)
      .attr("y1", y)
      .attr("y2", y);

    barNum = barNum + 1;
  })
  d3.select("#ts-yref-bar")
    .attr("y1", yBarY[0] + 5)
    .attr("y2", yBarY[1] - 5);
  d3.select("#ts-yref-number")
    .text(`${getNumCountries(updatedData)} states`);
  d3.select("#ts-yref-region")
    .text(`${getRegionSentenceText(filterID)}`);

}


// Create region filters and add event listener for updating plot
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
const updateRadialPlots = (filterID, data, translationsRegions, translationsCountries) => {

  // Data
  const indData = prepIndData(data, filterID, translationsRegions, translationsCountries);
  const maxLevel = getMaxLevel(indData);

  // Scales
  const [xScale, yScale, colorScale] = makeRadialScales(indData);

  // Plot data/paths
  const firstYears = getFirstYears(indData);
  const arcGenerator = makeArcGenerator(indData, xScale, yScale);

  // Update bars
  // TODO - would be better if organise data so each 
  // country has entries for all levels so can update bars instead
  // of deleting them
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
      .attr("stroke-width", d => addRadialBarStrokeWidth(d))
      .attr("pointer-events", d => addRadialPointerEvents(d));
  
  // Update indicator text
  d3.select("#radial-ind-label")
    .text(getIndLabel(filterID));

  // Update tooltip
  radialHandleMouseEvents(indData);
}

// How to update radial plot

// Create indicator filters (using dropdown)
const createIndicatorFilters = (dataAll) => {

  // DATA
  let data = dataAll[0] // indicator data
  const translationsRegions = dataAll[1] // translations for regions
  const translationsCountries = dataAll[2] //translations for countries

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
        updateRadialPlots(d.indicator, data, translationsRegions, translationsCountries);
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

// Radial tool-tip
const createRadialTooltip = () => {

  const tooltip = d3.select("#radial-innerchart")
    .append("g")
      .attr("id", "radial-tooltip")
      .style("opacity", 0);

  // tooltip text
  const r = 6
  tooltip
    .append("text")
      .text("")
      .attr("id", "radial-tooltip-country")
      .attr("text-anchor", "middle")            
      .attr("fill", "black")                    
      .style("font-weight", 600)
      .style("font-size", "14pt")
  const tooltipYears = tooltip
    .append("g")
      .attr("id", "radial-tooltip-years");
  tooltipYears
    .append("text")
      .text("")
      .attr("y", 24) // lower vertically to be beneath country
      .attr("id", "radial-tooltip-year")
      .attr("text-anchor", "middle")
      .attr("fill", "black")                    
      .style("font-weight", 400)
      .style("font-size", "12pt"); 

}

function radialHandleMouseEvents(firstYears) {

  // DIMENSIONS
  const width = radialDim.width;
  const height = radialDim.height;
  const margin = radialDim.margins;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  d3.select("#radial-innerchart")
    .selectAll(".radial-path")
    .on("mouseenter", (e, d) => {

      // get text to add for implementation year(s) for country and indicator
      let yearText = "";
      let yearText2 = ""; // second implementation year, used for NPM indicator
      // Get year
      const match = firstYears.find(
        dRef => 
          dRef.country_id === d.country_id && 
          dRef.value > 0 && 
          dRef.indicator === d.indicator
      );
      yearText = match ? match.year : "";

      // for criminalisation in law year, also label with level of implementation
      if (d.indicator === "ind5_law" && match) {
        yearText = yearText + lawLevelsText.at(-match.value)
      }

      // update country text
      d3.select("#radial-tooltip-country")
        .text(d.country);

      // update first year
      d3.select("#radial-tooltip-year")
        .text(yearText ? yearText : textNotImplemented);

      d3.select("#radial-tooltip")    
        .attr("transform", `translate(${innerWidth + margin.right*0.25}, ${innerHeight * 0.875})`)                              
        .transition()
          .duration(200)                                          
          .style("opacity", 1);                                  
    
      })
                                  
    .on("mouseleave", (e, d) => {
      d3.select("#radial-tooltip")
        .style("opacity", 0)
        .attr("transform", `translate(-100, -100)`);
    });                                  
}
