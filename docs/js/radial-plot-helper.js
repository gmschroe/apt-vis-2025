// Helper functions for the radial plot
// Also used for interaction updates (e.g., from filters)

// Data transformations/calculations
function prepIndData(data, filterID) {

  // Add country id without spaces or apostrophes for css ids
  data = data.map(entry => {
    entry.country_id = entry.country.replace(/[ ']/g, "_");
    return entry
  })

  // FILTER DATA
  const indData = data.filter(d => d.indicator === filterID);
  return indData;

}

function getMaxLevel(indData) {
  maxLevel = d3.max(indData.map(d => d.n_levels));
  return maxLevel
}

function getFirstYears(indData) {
  const firstYears = indData.reduce((result, d) => {
    if (!result.some(entry => (entry.country === d.country) && (entry.value === d.value))) {
      result.push(d);
    }
    return result;
  }, []);
  
  return firstYears;
}

function makeArcGenerator(indData, xScale, yScale) {

  const years = Array.from(new Set(indData.map(d => d.year)));
  const arcGenerator = d3.arc()
    .innerRadius(d => yScale(d.year))
    // TODO: check width of last entry is appropriate
    // may be better to add bandwidth to individual bars 
    // check once have axis labels
    .outerRadius(yScale(d3.max(years)) + yScale.bandwidth())
    .startAngle(d => xScale(d.country_id))
    .endAngle(d => xScale(d.country_id) + xScale.bandwidth())
    .cornerRadius(1)
    .padAngle(0.005);
  return arcGenerator;
}

// Scales
function makeRadialScales(indData) {
  // TODO: rename variables to theta/r axes 
  // TODO: make shared constants
  const height = 700;
  const innerRadius = 140;
  const outerRadius = height/2 - 50;

  const countries = Array.from(new Set(indData.map(d => d.country_id)));
  const years = Array.from(new Set(indData.map(d => d.year)));
  years.sort((a, b) => a.year - b.year);
  const regions = Array.from(new Set(indData.map(d => d.region)));
  const nRegions = regions.length;

  const regionGap = Math.PI/360 * 10; // Size of gap between different regions
  const yearLabelGap = Math.PI/360 * 20;

  // x-axis (theta) scale
  const xScale = d3.scaleBand()
    .domain(countries)
    .range([
      Math.PI/2 + yearLabelGap, 
      2 * Math.PI + Math.PI/2 - (regionGap * nRegions)
    ]); // + pi/2 to leave space for horizontal year labels

  // const yScale = d3.scaleRadial()
  //   .domain([d3.min(years), d3.max(years)])
  //   .range([innerRadius, outerRadius]);

  // y-axis (radius) scale
  const yScale = d3.scaleBand() 
    .domain(years)
    .range([innerRadius, outerRadius]);

  // colors (all indicators)
  const colorScale = d3.scaleOrdinal()
    .domain(indInfo.map(d => d.indicator))
    .range(indInfo.map(d => d.color));

  return [xScale, yScale, colorScale];
}

// Vis attributes
function addRadialBarFill(d, maxLevel, colorScale) {
  if (d.value === 0) { // background colour if 0
    return "white";
  } else if (d.value == maxLevel) { // fill if max value
    return colorScale(d.indicator);
  } else { // partial implementation --> hash fill
    return `url(#hash-pattern-${d.indicator}-${d.country_id})`;
  }
}

function addRadialBarStroke(d, colorScale) {
  if (d.value === 0) {
    return "white";
  } else {
    return colorScale(d.indicator);
  }
}

function addRadialBarStrokeWidth(d) {
  if (d.value === 0) {
    return 2;
  } else {
    return 0.5;
  }
}


// Text
function getIndLabel(ind) {
  const entry = indInfo.find(obj => obj.indicator == ind);
  return entry.label;
}