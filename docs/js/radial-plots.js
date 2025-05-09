// NOTE: this code assumes that list of countries is the same for every indicator
const drawRadialPlots = (data) => {

  // DIMENSIONS
  const width = 1000;
  const height = 700;
  const margin = {top: 0, right: 300, bottom: 0, left: 0};
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const innerRadius = 140;
  const outerRadius = height/2 - 50;

  // SVG AND CHART SPACE
  const svg = d3.select("#radial")
    .append("svg")
      .attr("viewBox", [0, 0, width, height]);

  const innerChart = svg
    .append("g")
      .attr("id", "radial-innerchart")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // DATA FILTERING AND TRANSFORMATIONS
  const filterID = "ind1_uncat"; // start with first indicator
  const indData = prepIndData(data, filterID); 
  const maxLevel = getMaxLevel(indData);

  const years = Array.from(new Set(indData.map(d => d.year)));
  const countries = Array.from(new Set(data.map(d => d.country_id)));

  // SCALES
  const [xScale, yScale, colorScale] = makeRadialScales(indData);

  // HASH FILL FOR PARTIAL IMPLEMENTATION
  // Append gradient definitions to svg
  const def = svg
    .append("defs");
  // Hash definition for each indicator with more than one level
  indInfo.forEach(ind => {
    if (ind.n_levels > 1) {
      countries.forEach (country => {
        const pattern = addHashPatternDef(
          def,
          id = `hash-pattern-${ind.indicator}-${country}`,
          hashSpacing = 4,
          hashAngle = 0, // doesn't matter, set by rotation
          hashColor = ind.color,
          hashBackgroundColor = calculateTint(ind.color, 0.8),
          hashOpacity = 1,
          hashStroke = 2 
        );
        pattern
          .attr("patternTransform", `rotate(${xScale(country) * 180/Math.PI + 45})`); //rotate to match country rotation
        }) 

    }
  })

  // REGION PLOT
  // First plot pie chart for regions to use as a background/borders for the individual country bars

  // Get number of countries in each region
  // First need to get unique country/region combinations
  // Also include "spacer" regions so leave space for them
  const regionCountryPairs = indData.reduce((acc, item) => {
    if (!acc.some(entry => entry.country_id == item.country_id && entry.region === item.region)) {
      acc.push(item)
    }
    return acc;
  }, []);

  const countryRegions = regionCountryPairs.map(d => d.region);
  const nCountriesPerRegion = countryRegions.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1; // Count occurrences
    return acc;
  }, {});

  const formattedRegionCounts = Object.entries(nCountriesPerRegion).map(([region, count]) => ({
    region: region, // format with region and count keys
    count: count
  }));

  // Get data for pie chart
  const pieGenerator = d3.pie()
    .value(d => d.count)
    .sort(null); // Don't sort, we want regions in the same order as the original data!
  const pieRegions = pieGenerator(formattedRegionCounts);

  // Get arcs
  const rotateTheta = computeRadialRotateTheta(indData);
  const regionArcGenerator = d3.arc()
    .startAngle (d => d.startAngle + rotateTheta) // need to rotate to match countries
    .endAngle(d => d.endAngle + rotateTheta)
    .innerRadius(innerRadius - 1) // buffer so stroke surrounds other elements
    .outerRadius(outerRadius + 1)
    .cornerRadius(5);

  const regionArcs = innerChart
    .append("g")
    .attr("id", "g-radial-region-paths")
    .attr("transform", `translate(${innerWidth/2}, ${innerHeight/2})`)
      .selectAll(".region-arc")
      .data(pieRegions)
      .join("path")
        .attr("class", "region-arc")
        .attr("d", regionArcGenerator)
        .attr("fill", d => d.data.region.match(/spacer/) ? "none" : "white") // no fill if spacer region
        .attr("stroke", d => d.data.region.match(/spacer/) ? "none" : "#B8C4CC") // no stroke if spacer region
        .attr("stroke-width", 2);
  
  // Grid lines

  // first add region arcs as clip path
  const clipPath = innerChart
    .append("clipPath")
    .attr("id", "radial-region-clip");

  pieRegions.forEach(d => {
    if (!d.data.region.match(/spacer/)) { // only add if not spacer region
      clipPath
        .append("path")
        .attr("d", regionArcGenerator(d))
        .attr("fill", "white");
    }
  });

  // Put gridlines in group so can apply same clip to all lines
  const minYear = d3.min(years);
  const minTickYear = minYear % 10 === 0 ? minYear : minYear + (10 - (minYear % 10));
  const tickYears = d3.range(minTickYear, d3.max(years), 10);
  const gridlines = innerChart
    .append("g")
      .attr("id", "radial-year-gridlines")
      .attr("transform", `translate(${innerWidth/2}, ${innerHeight/2})`)
      .attr("clip-path", "url(#radial-region-clip)");

  tickYears.forEach( yr => {
    gridlines
      .append("circle")
      .attr("cx", 0)// already shifted by group transform - center at 0
      .attr("cy", 0)
      .attr("r", yScale(yr))
      .attr("fill", "none")
      .attr("stroke", "#B8C4CC")
      .attr("opacity", 0.4)
      .attr("stroke-dasharray", "3 2");
  })

  // TEXT
  // Add text before bars so below bars for tooltip interactions

  // REGION LABELS
  // arcs for labels
  const regionLabelArc = d3.arc()
    .startAngle (d => d.startAngle + rotateTheta) // need to rotate to match countries
    .endAngle(d => d.endAngle + rotateTheta)
    .innerRadius(innerRadius - 1) // buffer so stroke surrounds other elements
    .outerRadius(outerRadius + 15)

  // Create text paths
  def.selectAll("path.text-path")
    .data(pieRegions)
    .join("path")
      .attr("class", "text-path")
      .attr('id', (d, i) => `textPath-${i}`)
      .attr('d', d => { // Define the curved path
        // based on https://stackoverflow.com/questions/21700667/d3-curved-labels-in-the-center-of-arc
        const arc = regionLabelArc(d); // entire arc path
        const justOutside = /[Mm][\d\.\-e,\s]+[Aa][\d\.\-e,\s]+/;  //regex that matches a move statement followed by an arc statement
        return justOutside.exec(arc)[0]; 
      });  
  
  // add labels
  const regionLabels = d3.select("#g-radial-region-paths") 
    .selectAll(".region-label")
    .data(pieRegions)
    .join("text")
      .attr("class", "region-label")
      .attr("dy", "0.35em")
    .append("textPath")
      .attr('xlink:href', (d, i) => `#textPath-${i}`)  // Link to a path
      .attr('startOffset', '0%')  // Text at beginning of each region
      .text(d => d.data.region.match(/spacer/) ? "" : d.data.region) // no text if spacer region


  // RADIUS AXIS (YEARS)
  const rAxis = d3.axisBottom(yScale)
    .tickValues(tickYears)
    .tickSize(5)
    .tickPadding(5)
    .tickSizeOuter(0);
  innerChart
    .append("g")
      .attr("class", "axis")
      .attr("id", "radial-raxis")
      .attr("transform", `translate(${innerWidth/2 - 1}, ${innerHeight/2 + 5})`) // needs small manual shift
      .call(rAxis);
    
  // TITLE AND SUBTITLE
  const textShift = 150;
  radialText = innerChart
    .append("foreignObject")
      .attr("width", margin.right - 50 + textShift)
      .attr("height", innerHeight*0.5)
      .attr("x", innerWidth - textShift)
      .attr("y", -10)
    .append("xhtml:div")
      .style('word-wrap', 'break-word')
      .style('white-space', 'normal')
      .html( // use html so easy to add word breaks
        `<p id="radial-title" class="vis-title" dominant-baseline=hanging>${textRadialTitle}</p>
        <p id="radial-subtitle" class="vis-subtitle" dominant-baseline=hanging>${textRadialP}</p>
        `
    );


  // INDICATOR LABEL
  indicatorText = innerChart
    .append("foreignObject")
      .attr("width", innerRadius*2)
      .attr("height", innerRadius*2)
      .attr("x", innerWidth/2 - innerRadius)
      .attr("y", innerHeight/2 - innerRadius)
    .append("xhtml:div")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("height", "100%")
      .style("padding-left", "50px")
      .style("padding-right", "50px");

  indicatorText
    .append("p")
    .text(getIndLabel(filterID))
    .attr("id", "radial-ind-label")
    .style("text-align", "center")
    .style("margin", "0")
    .style("font-weight", "700")
    .style("font-size", "14pt");

  // COUNTRY PLOT
  // based on https://d3-graph-gallery.com/graph/circular_barplot_double.html

  // Get first year with each value (i.e., only keep entry if first entry with that year and value)
  // (Note - assumes years are stored in order for each country in the array!)
  const firstYears = getFirstYears(indData);

  // arc generator
  const arcGenerator = makeArcGenerator(indData, xScale, yScale);

  innerChart
    .append("g")
      .attr("id", "g-radial-paths")
      .attr("transform", `translate(${innerWidth/2}, ${innerHeight/2})`)
      .attr("clip-path", "url(#radial-region-clip)") // also add clippath here for tidier corners
      .selectAll("path")
      .data(firstYears)
      .join("path")
        .attr("class", "radial-path")
        .attr("d", arcGenerator)
        .attr("fill", d => addRadialBarFill(d, maxLevel, colorScale))
        .attr("stroke", d => addRadialBarStroke(d, colorScale))
        .attr("stroke-width", d => addRadialBarStrokeWidth(d))
        .attr("fill-opacity", d => d.value === 0 ? 0 : 1)
        .attr("pointer-events", d => addRadialPointerEvents(d)); // allows pointer events even if fill is none

  // Mouse events for tooltip
  radialHandleMouseEvents(indData);
}