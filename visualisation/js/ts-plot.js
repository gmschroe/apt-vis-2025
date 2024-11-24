const drawStackedTimeSeries = (data) => {

  
  // Dimensions
  const width = 1000;
  const height = 600;
  const margin = {top: 0, right: 300, bottom: 50, left: 50};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Append new svg to time series container
  const svg = d3.select("#ts")
    .append("svg")
      .attr("viewBox", [0, 0, width, height]);

  // Append gradient definitions to svg
  const def = svg
    .append("defs");

  // Create linear gradient for each series
  indSeparatedInfo.forEach(ind => {
    let linearGradient = def
    .append("linearGradient")
      .attr("id", `linear-gradient-${ind.indicator}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", calculateTint(ind.color, 0.05)); 
    linearGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", ind.color); 
    linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", calculateShade(ind.color, 0.075));
  })

  // Create linear gradient for partial implementation overlay
  let linearGradient = def
  .append("linearGradient")
    .attr("id", `linear-gradient-partial-overlay`)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");
  linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#FFFFFF"); 
  linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", calculateShade("#FFFFFF", 0.3));

  // Create hash pattern for each series
  // Will only use for partial implementation of indicators
  indSeparatedInfo.forEach(ind => {
    addHashPatternDef(
      def,
      id = `hash-pattern-${ind.indicator}`,
      hashSpacing = 5,
      hashAngle = -45,
      hashColor = ind.color,
      hashBackgroundColor = "white",
      hashOpacity = 1,
      hashStroke = ind.partial_hash_stroke ?? 3 // use 3 by default if not provided
    )
  })

  // Regions (unique array)
  const regions = Array.from(new Set(data.map(d => d.region)))
  console.log("regions", regions)

  // Inner chart for plot
  const innerChart = svg
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Data transformations
  const dataForStack = makeTimeSeriesDataForStack(data);
  const stackData = makeTimeSeriesStackData(dataForStack, indSeparatedInfo);
  const stackDataRepeatedPartial = makeTimeSeriesStackDataRepeatedPartial(stackData, indSeparatedInfo);
  
  // Scales
  [xScaleBand, yScale] = makeTimeSeriesScales(stackData, dataForStack, innerWidth, innerHeight);

  // Bar chart with custom bar shape
  stackDataRepeatedPartial.forEach(series => {
    innerChart
      .selectAll(`.path-${series.key}`)
      .data(series)
      .join("path")
        .attr("class", `bar bar-${series.key}`)
        // Custom bars
        .attr("d", (d, i) => makeTimeSeriesBarPath(d, i, series, xScaleBand, innerHeight))
        // Fill 
        .attr("fill", addTimeSeriesBarFill(series, indSeparatedInfo))
        // If partial_overlay, decrease opacity
        .attr("fill-opacity", setTimeSeriesBarOpacity(series))
  })

  // x-axis
  const xAxis = d3.axisBottom(xScaleBand)
    .tickValues(d3.range(1985, d3.max(dataForStack.map(d => d.year)), 5))
    .tickSize(5)
    .tickPadding(5);

  innerChart
    .append("g")
      .attr("id", "xaxis")
      .attr("transform", `translate(0, ${innerHeight + 5})`)
      .call(xAxis);

  // for y-axis, reference bar


  // series labels
  const dataLastYear = stackData.map(series => ({
    key: series.key,
    y: series[series.length - 1][1],
    year: series[series.length - 1].data.year,
    count: series[series.length - 1].data[series.key]
  }));

  let indLabelData = indSeparatedInfo
  indLabelData.forEach(ind => {
    const entry = dataLastYear.find(obj => obj.key == ind.indicator);

    ind.finalY = entry.y;
    ind.finalYear = entry.year;
    ind.finalCount = entry.count;
  });

  indLabels = innerChart
    .selectAll(".g-ts-label")
    .data(indLabelData)
    .join("g")
      .attr("class", d => `g-ts-label g-ts-label-${d.indicator}`);
  
  indLabels
      .append("text")
        .attr("class", d => `ind-label ind-label-${d.indicator}`)
        .text(d => d.label) // indicator label
        .attr("x", d => xScaleBand(d.finalYear) + (xScaleBand.bandwidth() * 1.35))
        .attr("y", d => yScale(d.finalY))
        .attr("dominant-baseline", "hanging");
        
  indLabels
    .append("text")
      .attr("class", d => `country-label country-label-${d.indicator}`)
      .text(d => d.finalCount + d.country_text) // number of countries
      .attr("x", d => xScaleBand(d.finalYear) + (xScaleBand.bandwidth() * 1.35))
      .attr("y", (d, i) => {
        const yAddBase = 15
        const yInd = d.partial ? indLabelData[i-1].finalY : d.finalY // if partial measure, use y of previous series as baseline
        const yAdd = d.partial ? yAddBase*1.9 : yAddBase // also need to add more space if partial measure (because it's the second label)
        return yScale(yInd) + yAdd
      })
      .attr("dominant-baseline", "hanging")

  
  // Title and subtitle text
  tsText = innerChart
    .append("foreignObject")
      .attr("width", innerWidth*0.75)
      .attr("height", innerHeight*0.5)
      .attr("y", 20)
    .append("xhtml:div");

  tsText
    .append("p")
      .text(text_ts_title)
      .attr("id", "ts-title")
      .attr("class", "vis-title")
      .attr("dominant-baseline", "hanging");

  tsText
    .append("p")
      .text(text_ts_p)
      .attr("id", "ts-subtitle")
      .attr("class", "vis-subtitle")
      .style("width", innerWidth*0.5 + "px")
      .attr("dominant-baseline", "hanging");



}

  // TODO: 
  // partial implementation dashed lines
  // y axis reference line
  // mark years certain measures were created