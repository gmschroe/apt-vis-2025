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
            //TODO: also account for region in rotation since will be some space between regions
            //(or add filler country in data??)
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
    console.log(regionCountryPairs);

    const countryRegions = regionCountryPairs.map(d => d.region);
    const nCountriesPerRegion = countryRegions.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1; // Count occurrences
      return acc;
    }, {});

    const formattedRegionCounts = Object.entries(nCountriesPerRegion).map(([region, count]) => ({
      region: region, // format with region and count keys
      count: count
    }));
    console.log(formattedRegionCounts);

    // Get data for pie chart
    const pieGenerator = d3.pie()
      .value(d => d.count)
      .sort(null);
    const pieRegions = pieGenerator(formattedRegionCounts);

    // Get arcs
    // TODO: store rotation as shared constant
    const rotateTheta = computeRadialRotateTheta(indData);
    const regionArcGenerator = d3.arc()
      .startAngle (d => d.startAngle + rotateTheta) // need to rotate to match countries
      .endAngle(d => d.endAngle + rotateTheta)
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
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
          .attr("fill", "white")
          .attr("stroke", "plum");

      // Add text before bars so below bars for tooltip interactions
      // RADIUS AXIS (YEARS)
      const rAxis = d3.axisBottom(yScale)
      .tickValues(d3.range(1990, d3.max(years), 10))
      .tickSize(5)
      .tickPadding(5)
      .tickSizeOuter(0);
    innerChart
      .append("g")
        .attr("class", "axis")
        .attr("id", "radial-raxis")
        .attr("transform", `translate(${innerWidth/2}, ${innerHeight/2 + 5})`)
        .call(rAxis);
      
    // TITLE AND SUBTITLE
    const textShift = 150;
    radialText = innerChart
      .append("foreignObject")
        .attr("width", margin.right - 50 + textShift)
        .attr("height", innerHeight*0.5)
        .attr("x", innerWidth - textShift)
        .attr("y", -10)
      .append("xhtml:div");

    radialText
      .append("p")
        .text(textRadialTitle) // Title
        .attr("id", "radial-title")
        .attr("class", "vis-title")
        .attr("dominant-baseline", "hanging")
        .style("text-align", "right");

    radialText
      .append("p")
        .text(textRadialP) // Subtitle (paragraph)
        .attr("id", "radial-subtitle")
        .attr("class", "vis-subtitle")
        .attr("dominant-baseline", "hanging")
        .style("text-align", "right")
        .style("width", "80%")
        .style("float", "right");


    // INDICATOR LABEL
    // TODO: move styling to CSS
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
        .selectAll("path")
        .data(firstYears)
        .join("path")
          .attr("class", "radial-path")
          .attr("d", arcGenerator)
          .attr("fill", d => addRadialBarFill(d, maxLevel, colorScale))
          .attr("stroke", d => addRadialBarStroke(d, colorScale))
          .attr("stroke-width", d => addRadialBarStrokeWidth(d))
          .attr("fill-opacity", 0.2)
          .attr("stroke-opacity", 0.2);


  // Mouse events
  radialHandleMouseEvents(indData);
}

// TODO
// region pie chart, with labels
// hover 
// check bar lengths
