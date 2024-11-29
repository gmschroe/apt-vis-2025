// NOTE: this code assumes that list of countries is the same for every indicator
const drawRadialPlots = (data) => {

    // DIMENSIONS
    const width = 1000;
    const height = 700;
    const margin = {top: 0, right: 300, bottom: 0, left: 0};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;


    // SVG AND CHART SPACE
    const svg = d3.select("#radial")
      .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    const innerChart = svg
      .append("g")
        .attr("id", "radial-innerchart")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // DATA FILTERING AND TRANSFORMATIONS
    const indData = prepIndData(data, "ind1_uncat"); // start with first indicator
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


    // PLOTS
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
          .attr("stroke-width", d => addRadialBarStrokeWidth(d));

  // TITLE AND SUBTITLE
  const textShift = 150;
  radialText = innerChart
    .append("foreignObject")
      .attr("width", margin.right - 50 + textShift)
      .attr("height", innerHeight*0.5)
      .attr("x", innerWidth - textShift)
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
}