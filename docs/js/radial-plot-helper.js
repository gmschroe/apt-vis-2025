// Helper functions for the radial plot
// Also used for interaction updates (e.g., from filters)

// Number of spacers between different regions
const nSpacer = 7;

// Data transformations/calculations
function prepIndData(data, filterID, translationsRegions, translationsCountries) {

  // Filter data
  const indData = data.filter(d => d.indicator === filterID);

  // Ensure sorted by region, with countries sorted within each region
  regionOrder = regionFilters.map(d => d.id); // order for regions, based on other filter
  indData.sort((a, b) => {
    const regionComparison = regionOrder.indexOf(a.region_id) - regionOrder.indexOf(b.region_id);
    if (regionComparison !== 0) return regionComparison;
    // otherwise, if same region, return country comparison (alphabetical in English)
    return a.country_id.localeCompare(b.country_id);
  });


  // Add spacer entries at region changes
  const spacerEntry = {indicator: filterID, region: "spacer", country: "", country_id: "spacer", value: -1, year: 2024};
  let spacerNum = 0;
  let regionNum = 0;
  indDataWithSpacers = [];

  // Spacers between regions
  let previousRegion = indData[0].region; // first region
  indData.forEach(entry => {
    if (entry.region !== previousRegion) {
      // Add spacers
      for (i = 0; i < nSpacer; i++) {
        const spacerEntryNew = structuredClone(spacerEntry)
        spacerEntryNew.country_id = spacerEntryNew.country_id + spacerNum; // spacers need to have unique country ids for scale
        spacerEntryNew.region = spacerEntryNew.region + regionNum;
        spacerNum = spacerNum + 1;
        indDataWithSpacers.push(spacerEntryNew);
      }
      regionNum = regionNum + 1;
      // update region
      previousRegion = entry.region;

    }
    indDataWithSpacers.push(entry); // Add original entry
  })

  // Additional spacer at end
  // bit of a hack (not DRY)
  for (i = 0; i < nSpacer; i++) {
    const spacerEntryNew = structuredClone(spacerEntry)
    spacerEntryNew.country_id = spacerEntryNew.country_id + spacerNum; // spacers need to have unique country ids for scale
    spacerEntryNew.region = spacerEntryNew.region + regionNum;
    spacerNum = spacerNum + 1;
    indDataWithSpacers.push(spacerEntryNew);
  }

  // if language is not english, update countries and regions in data table
  // we do the translations here to avoid altering the original data structure
  // (translations were added later, and region/country fields are used for more than labels,
  // so changing them can cause errors)

  if (lang != "eng"){ // check language - global variable

    // update regions
    const regionLookup = {};
    translationsRegions.forEach(entry => {
      regionLookup[entry.region] = entry[lang];
    });
    indDataWithSpacers.forEach(row => {
      if (regionLookup[row.region]) {
        row.region = regionLookup[row.region];
      } else if (!row.region.includes("spacer")) { // ignore spacer regions
        //console.log(`Missing translation for region ${row.region}`);
      }
    });

    // update countries
    const countryLookup = {};
    translationsCountries.forEach(entry => {
      countryLookup[entry.country] = entry[lang];
    });
    indDataWithSpacers.forEach(row => {
      if (countryLookup[row.country]) {
        row.country = countryLookup[row.country];
      } else if (row.country) { // ignore blank entries
        //console.log(`Missing translation for country ${row.country}`);
      }
    });
  }
  
  return indDataWithSpacers;
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

function computeRadialRotateTheta(indData) {
  const countries = Array.from(new Set(indData.map(d => d.country_id)));
  return Math.PI/2 + ((2*Math.PI)/countries.length * nSpacer)
}
function makeArcGenerator(indData, xScale, yScale) {

  const years = Array.from(new Set(indData.map(d => d.year)));
  const arcGenerator = d3.arc()
    .innerRadius(d => yScale(d.year))
    .outerRadius(yScale(d3.max(years)) + yScale.bandwidth())
    .startAngle(d => xScale(d.country_id))
    .endAngle(d => xScale(d.country_id) + xScale.bandwidth())
    .cornerRadius(1)
    .padAngle(0.005);
  return arcGenerator;
}

// Scales
function makeRadialScales(indData) {
  const height = 700;
  const innerRadius = 140;
  const outerRadius = height/2 - 50;

  const countries = Array.from(new Set(indData.map(d => d.country_id)));
  const years = Array.from(new Set(indData.map(d => d.year)));
  years.sort((a, b) => a.year - b.year);
  const regions = Array.from(new Set(indData.map(d => d.region)));
  const nRegions = regions.length;

  // x-axis (theta) scale
  const rotateTheta = computeRadialRotateTheta(indData);
  const xScale = d3.scaleBand()
    .domain(countries)
    .range([
      rotateTheta, 
      2 * Math.PI + rotateTheta
    ]); // + pi/2 to leave space for horizontal year labels

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

function adjustedColor(d, colorScale) {
  // dark colors cause perceptual issues - slightly lighten
  if (d.indicator === "ind1_uncat") { 
    return calculateTint(colorScale(d.indicator), 0.125);
  } else if (d.indicator === "ind4_constitution") { 
    return calculateTint(colorScale(d.indicator), 0.1);
  } else if (d.indicator === "ind2_opcat"){
    return calculateTint(colorScale(d.indicator), 0.2);
  } else if (d.indicator === "ind7_paris") {
    return calculateTint(colorScale(d.indicator), 0.2);
  }
  return colorScale(d.indicator);
}

function addRadialBarFill(d, maxLevel, colorScale) {
  if (d.value === -1) { // spacers
    return "none";
  } else if (d.value === 0) { // background colour if 0
    return "none"; // will be made transparent, but needs to be present for tooltip
  } else if (d.value == maxLevel) { // fill if max value
    return adjustedColor(d, colorScale);
  } else { // partial implementation --> hash fill
    return `url(#hash-pattern-${d.indicator}-${d.country_id})`;
  }
}

function addRadialBarStroke(d, colorScale) {
  if (d.value <= 0) { // spacers and background
    return "none"; 
  } else {
    return adjustedColor(d, colorScale);
  }
}

function addRadialBarStrokeWidth(d) {
  return 1;
}

function addRadialPointerEvents(d) {
  if (d.value >= 0) { // ignore spacer
    return "all";
  }
  return "none"; // otherwise, none
}

// Text
function getIndLabel(ind) {
  const entry = indInfo.find(obj => obj.indicator == ind);
  return entry.label;
}