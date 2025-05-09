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
  
    // Re-format data so each indicator is a column
    let dataForStack = d3.group(dataTotals, d => d.year)
    dataForStack = Array.from(dataForStack, ([year, values]) => {
      const entry = { year };
      values.forEach(v => entry[v.indicator] = v.total);
      return entry;
    });

    return dataForStack;
}

function makeTimeSeriesStackData(dataForStack, indSeparatedInfo) {

    // Initialise the stack layout and create the stack data
    const stackGenerator = d3.stack()
      .keys(indSeparatedInfo.map(d => d.indicator))
      .order(d3.stackOrderReverse);
  
    const stackData = stackGenerator(dataForStack);

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

  return stackDataRepeatedPartial;
}

// Scales

function makeTimeSeriesScales(
  data, 
  stackData,
  dataForStack, 
  width, // plot width
  height, // plot height
  fixedScale // whether to fix scale based on number of countries (instead of based on max value)
) {
  // x-axis
  const xScaleBand = d3.scaleBand()
    .domain(dataForStack.map(d => d.year))
    .range([0, width])
  // y-axis
  let maxY;
  if (fixedScale) {
    maxY = getNumCountries(data) * 5.8; // the ratio is hard-coded - may need to be adjusted for future plots
  } else {
    maxY = d3.max(stackData[0], d => d[1]) * 1.05;
  }
  const yScale = d3.scaleLinear()
    .domain([0, maxY]) 
    .range([height, 0]);

  return [xScaleBand, yScale]
}

// Bar attributes

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
    return `url(#linear-gradient-${series.key})`; //"url(#linear-gradient-partial-overlay)";
  } else { // Otherwise, return hash pattern if partial and gradient otherwise
    return entry.partial ? `url(#hash-pattern-${series.key})` : `url(#linear-gradient-${series.key})`;
  }
}

function addTimeSeriesBarStroke(d, series, indSeparatedInfo) {
  // Add stroke if hash pattern
  const entry = indSeparatedInfo.find(obj => obj.indicator == series.key)
  if (entry === undefined) { // our added overlay series
    return "none"
  } else if ((Math.abs(d[1] - d[0]) >= 1)) { // only stoke if non-zero value
    return entry.color;
  } else {
    return "none"; // no outline, full implementation
  }
}

function setTimeSeriesBarOpacity(series) {
  return (series.isPartial ?? false) ? 0.3 : 1;
}

// Title/Labels

function getNumCountries(data) {
  const countries = Array.from(new Set(data.map(d => d.country)))
  return countries.length
}

function getRegionSentenceText(filterID) {
  // relies on shared constants
  regionEntry = regionFilters.find(obj => obj.id == filterID);
  return regionEntry.textSentence;
}

function computeYBarRefEndpoints(data, yScale) {
  // dyRefLarge and dyRef defined in shared-constants.js
  const yBarLength = yScale(0) - yScale(getNumCountries(data)); 
  const barShift = (dyRefLarge*2.5 + dyRef*1.5)/2 // how much to shift bar vertically so text is centred
  return [barShift - yBarLength/2, barShift + yBarLength/2] // endpoints for reference bar
}

function getYBarRefX() {
  return -10
}

function makeTimeSeriesIndLabelData(data, stackData, indSeparatedInfo, xScaleBand, yScale) {

  const dataLastYear = stackData.map(series => ({
    key: series.key,
    value: series[series.length - 1][1], // stacked value for indicator
    year: series[series.length - 1].data.year,
    count: series[series.length - 1].data[series.key]
  }));

  const indLabelData = structuredClone(indSeparatedInfo);
  indLabelData.forEach(ind => {
    const entry = dataLastYear.find(obj => obj.key == ind.indicator);

    ind.finalBarValue = entry.value;
    ind.finalYear = entry.year;
    ind.finalCount = entry.count;
  });

  // Apply scales and add buffers to get x, y values
  indLabelData.forEach (ind => {
    ind.x = xScaleBand(ind.finalYear) + (xScaleBand.bandwidth() * 1.35);
    ind.y = yScale(ind.finalBarValue);
  })

  // total number of countries
  const nCountries = getNumCountries(data);

  // y for number of countries text
  indLabelData.forEach ((ind, index, arr) => {
    const yAddBase = 15;
    const yInd = ind.partial ? arr[index-1].y : ind.y; // if partial measure, use y of previous series (= full implementation) as baseline
    let yAdd = 0;
    if (ind.partial & ind.finalCount == 0) { // some partial measures have zero implementation - hide those labels and don't designate extra space for them
      yAdd = yAddBase;
      ind.countryLabel = "";
    } else {
      yAdd = ind.partial ? yAddBase*1.9 : yAddBase; // // also need to add more space if partial measure (because it's the second label)
      ind.yCountry = yInd + yAdd;
      const finalPercent = Math.round(ind.finalCount/nCountries * 100); // not using, but leaving so can re-implement if requested
      if (ind.finalCount == 1) {
        ind.countryLabel = `${ind.finalCount} ${statesTextSingular}${ind.country_text}`; // singular ("state")
      } else {
      ind.countryLabel = `${ind.finalCount} ${statesText}${ind.country_text}`; // plural ("states")
      }
    }

  })

  return indLabelData;

}


