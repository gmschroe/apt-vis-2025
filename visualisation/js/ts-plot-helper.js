// Helper functions for creating the time series plot
// Also needed for interactive updates


// Data transformation helpers

function makeTimeSeriesDataForStack(data) {
    // Compute number of countries ( = States) with each indicator in each year
    const dataTotals = [...d3.rollup(
      data,
      group => d3.sum(group, d => d.value),
      d => d.year,
      d => d.indicator
    )]
      .flatMap(([year, indicatorMap]) =>
        [...indicatorMap].map(([indicator, total]) => ({year, indicator, total}))
      );
    console.log("totals map", dataTotals);
  
    // Re-format data so each indicator is a column
    let dataForStack = d3.group(dataTotals, d => d.year)
    dataForStack = Array.from(dataForStack, ([year, values]) => {
      const entry = { year };
      values.forEach(v => entry[v.indicator] = v.total);
      return entry;
    });
    console.log("data for stack", dataForStack);

    return dataForStack;
}

function makeTimeSeriesStackData(dataForStack, indSeparatedInfo) {

    // Initialise the stack layout and create the stack data
    const stackGenerator = d3.stack()
      .keys(indSeparatedInfo.map(d => d.indicator))
      .order(d3.stackOrderReverse);
  
    const stackData = stackGenerator(dataForStack);
    console.log("stack data", stackData);

    return stackData
}

//
function makeTimeSeriesStackDataRepeatedPartial(stackData, indSeparatedInfo) {
  // Repeat partial implementation entries so can overlay the gradient over the hash pattern
  let stackDataRepeatedPartial = [];
  stackData.forEach(series => {
    stackDataRepeatedPartial.push(series);
    const ind_entry = indSeparatedInfo.find(obj => obj.indicator == series.key);
    if (ind_entry.partial) { // if a partial implementation, change key and repeat data
      const seriesOverlay = structuredClone(series);
      seriesOverlay.key = seriesOverlay.key + "_partial_overlay"; // need to have unique keys
      seriesOverlay.isPartial = true;
      stackDataRepeatedPartial.push(seriesOverlay);
    }
  })
  console.log("repeated stack data", stackDataRepeatedPartial);

  return stackDataRepeatedPartial;
}

// Scales

function makeTimeSeriesScales(stackData, dataForStack, width, height) {
  // x-axis
  const xScaleBand = d3.scaleBand()
    .domain(dataForStack.map(d => d.year))
    .range([0, width])
  // y-axis
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(stackData[0], d => d[1])]) // if order reversed
    .range([height, 0])
    .nice();

  return [xScaleBand, yScale]
}

// Attributes

function makeTimeSeriesBarPath(d, i, series, xScaleBand, height) {

  const barWidthBuff = 0;
  const x = xScaleBand(d.data.year)
  const barWidth = xScaleBand.bandwidth() + barWidthBuff

  const rMax = 3; // max radius; must be < half the band width

  const y0 = Math.min(yScale(d[0]) + rMax, height); // need some overlap since bars below end early if curve
  const y1 = yScale(d[1]);
  const barHeight = y0 - y1; 

  // Get previous and next values (scaled)
  // Note that since origin starts in top left, a lower value indicates a higher bar
  const currentValue = y1;
  const prevValue = yScale(series[i-1]?.[1]) || Math.min(currentValue + rMax, height); // If not available, round
  const nextValue = yScale(series[i+1]?.[1]) || currentValue; // If not available, don't round

  // cap r values for left and right at height difference/2
  const rLeft = Math.min(Math.abs(currentValue - prevValue)/2, rMax);
  let rRight = Math.min(Math.abs(currentValue - nextValue)/2, rMax);

  // Whether to flip arc - depends on if neighbouring bars are lower or higher
  const flipLeft = (currentValue > prevValue) ? 1 : 0 // if True, current bar is lower ==> flip
  const flipRight = (currentValue > nextValue) ? 1 : 0 // if True, current bar is lower ==> flip
  rRight = flipRight ? 0 : rRight; // Don't round up on right edge
  // Path
  let path = `M${x},${y0}`;
  path += `h${barWidth}`; // bottom edge
  path += `v-${barHeight + (rRight * (flipRight? 1 : -1))}` // right edge
  path += `a${rMax},${rRight} 0 0 ${flipRight} ${-1 * rMax}, ${rRight * (flipRight ? 1 : -1)}`; // Top right arc
  path += `h-${barWidth - (rMax * 2)}`; // top edge
  path += `a${rMax},${rLeft} 0 0 ${flipLeft} ${-1 * rMax}, ${rLeft * (flipLeft ? -1 : 1)}`; // Top left arc
  path += `v${barHeight - rLeft * ((flipLeft ? -1 : 1))}`; // left edge

  path += `Z`; // Close the path

  return path;
}

function addTimeSeriesBarFill(series, indSeparatedInfo) {
  // Fill with hash pattern if partial or gradient otherwise
  // Gradient is also used for "partial_overlay"
  const entry = indSeparatedInfo.find(obj => obj.indicator == series.key)
  if (entry === undefined) { // if undefined, it's our added series - use the partial_overlay
    return "url(#linear-gradient-partial-overlay)"
  } else { // Otherwise, return hash pattern if partial and gradient otherwise
    return entry.partial ? `url(#hash-pattern-${series.key})` : `url(#linear-gradient-${series.key})` // colorScale(series.key)
  }
}

function setTimeSeriesBarOpacity(series) {
  return (series.isPartial ?? false) ? 0.4 : 1
}