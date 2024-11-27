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

    // another gradient for partial implementation overlay
    let linearGradientPartial = def
      .append("linearGradient")
        .attr("id", `linear-gradient-${ind.indicator}_partial_overlay`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    linearGradientPartial.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", calculateTint(ind.color, 0.05)); 
    linearGradientPartial.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", ind.color); 
    linearGradientPartial.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", calculateShade(ind.color, 0.15)); // needs to be darker since will be transparent
  })

  // Create linear gradient for partial implementation overlay
  // let linearGradient = def
  // .append("linearGradient")
  //   .attr("id", `linear-gradient-partial-overlay`)
  //   .attr("x1", "0%")
  //   .attr("y1", "0%")
  //   .attr("x2", "100%")
  //   .attr("y2", "0%");
  // linearGradient.append("stop")
  //   .attr("offset", "0%")
  //   .attr("stop-color", "#FFFFFF"); 
  // linearGradient.append("stop")
  //   .attr("offset", "100%")
  //   .attr("stop-color", calculateShade("#FFFFFF", 0.8));

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
      hashStroke = 2 
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
        // Stroke
        //.attr("stroke", d => addTimeSeriesBarStroke(d, series, indSeparatedInfo))
        // If partial_overlay, decrease opacity
        .attr("fill-opacity", setTimeSeriesBarOpacity(series));
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
  // TODO: refactor using array to store text and attributes
  const yRefG = innerChart
    .append("g")
      .attr("transform", `translate(
        ${xScaleBand(dataForStack[1].year)}, ${innerHeight/2}
        )`)
      .attr("id", "g-ts-y-ref");
  const dyRef = 12;
  const dyRefLarge = 18;
  yRefG
    .append("text")
      .text("Our goal is for all")
      .attr("class", "ts-yref-small");
  yRefG
    .append("text")
      .text(`${getNumCountries(data)} states`)
      .attr("class", "ts-yref-large")
      .attr("id", "ts-yref-number")
      .attr("y", dyRefLarge);
  yRefG
    .append("text")
      .text(`${getRegionSentenceText("All")}`)
      .attr("class", "ts-yref-large")
      .attr("id", "ts-yref-region")
      .attr("y", dyRefLarge*2);  
  yRefG
    .append("text")
      .text("to implement each")
      .attr("class", "ts-yref-small")
      .attr("y", dyRefLarge*2.5 + dyRef*0.5); 
  yRefG
    .append("text")
      .text("measure")
      .attr("class", "ts-yref-small")
      .attr("y", dyRefLarge*2.5 + dyRef*1.5); 



  // Series labels
  const indLabelData = makeTimeSeriesIndLabelData(
    stackData, indSeparatedInfo, xScaleBand, yScale)

  indLabels = innerChart
    .selectAll(".g-ts-label")
    .data(indLabelData)
    .join("g")
      .attr("class", d => `g-ts-label g-ts-label-${d.indicator}`);
  
  indLabels
      .append("text")
        .attr("class", d => `ts-ind-label ts-ind-label-${d.indicator}`)
        .text(d => d.label) // indicator label
        .attr("x", d => d.x) 
        .attr("y", d => d.y) 
        .attr("dominant-baseline", "hanging");

  indLabels
      .append("text")
        .attr("class", d => `ts-country-label ts-country-label-${d.indicator}`)
        .text(d => d.countryLabel) // number of countries
        .attr("x", d => d.x)
        .attr("y", d => d.yCountry)
        .attr("dominant-baseline", "hanging")

  
  // Title and subtitle text
  tsText = innerChart
    .append("foreignObject")
      .attr("width", innerWidth*0.6)
      .attr("height", innerHeight*0.5)
      .attr("y", 20)
    .append("xhtml:div");

  tsText
    .append("p")
      .text(textTsTitle)
      .attr("id", "ts-title")
      .attr("class", "vis-title")
      .attr("dominant-baseline", "hanging");

  tsText
    .append("p")
      .text(textTsP)
      .attr("id", "ts-subtitle")
      .attr("class", "vis-subtitle")
      .style("width", innerWidth*0.5 + "px")
      .attr("dominant-baseline", "hanging");

}

  // TODO: 
  // partial implementation dashed lines
  // y axis reference line
  // mark years certain measures were created