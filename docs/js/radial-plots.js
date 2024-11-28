const drawRadialPlots = (data) => {

    // DIMENSIONS
    const width = 1000;
    const height = 700;
    const margin = {top: 0, right: 300, bottom: 0, left: 50};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // inner and outer radius of each plot
    const innerRadius = 100;
    const outerRadius = height/2 - 50;

    // SVG AND CHART SPACE
    const svg = d3.select("#radial")
      .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    const innerChart = svg
      .append("g")
        .attr("id", "radial-innerchart")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // ADD COUNTRIES WITHOUT SPACES FOR IDS
    data = data.map(entry => {
      entry.country_id = entry.country.replace(/ /g, "_");
      return entry
    })
    // FILTER DATA
    const indData = data.filter(d => d.indicator === "ind6_npm")
    maxLevel = d3.max(indData.map(d => d.n_levels))

    // SCALES
    const countries = Array.from(new Set(data.map(d => d.country_id)));
    console.log(countries)
    const years = Array.from(new Set(data.map(d => d.year)));
    years.sort((a, b) => a.year - b.year);
    const regions = Array.from(new Set(data.map(d => d.region)));
    const nRegions = regions.length;

    const regionGap = Math.PI/360 * 10; // Size of gap between different regions
    const yearLabelGap = Math.PI/360 * 20;
    const xScale = d3.scaleBand()
      .domain(countries)
      .range([Math.PI/2 + yearLabelGap, 2 * Math.PI + Math.PI/2 - (regionGap * nRegions)]); // + pi/2 to leave space for horizontal year labels

    const yScale = d3.scaleRadial()
      .domain([d3.min(years), d3.max(years)])
      .range([innerRadius, outerRadius]);

    // colors (all indicators)
    const colorScale = d3.scaleOrdinal()
      .domain(indInfo.map(d => d.indicator))
      .range(indInfo.map(d => d.color));


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
            hashBackgroundColor = "white",
            hashOpacity = 1,
            hashStroke = 2 
          );
          pattern
            //TODO: also account for region in rotation since will be some space between regions
            //(or add filler country in data??)
            //.attr("patternTransform", "rotate(90)");
            .attr("patternTransform", `rotate(${xScale(country) * 180/Math.PI + 45})`); //rotate to match country rotation
          console.log(country, xScale(country), `rotate(${xScale(country) * 180/Math.PI})`);
          }) 

      }
    })


    // PLOTS
    // based on https://d3-graph-gallery.com/graph/circular_barplot_double.html
    // starting with one as example
  
    // Get first year with each value (i.e., only keep entry if first entry with that year and value)
    // (Note - assumes years are stored in order for each country in the array!)
    const firstYears = indData.reduce((result, d) => {
      if (!result.some(entry => (entry.country === d.country) && (entry.value === d.value))) {
        result.push(d); //indicator: d.indicator, country: d.country, country_id: d.country_id, value: d.value, year: d.year });
      }
      return result;
    }, []);
    
    console.log(firstYears);

    // arc generator
    const arcGenerator = d3.arc()
      .innerRadius(d => yScale(d.year))
      .outerRadius(yScale(d3.max(years)))
      .startAngle(d => xScale(d.country_id))
      .endAngle(d => xScale(d.country_id) + xScale.bandwidth())
      .cornerRadius(1)
      .padAngle(0.005);

    innerChart
      .append("g")
        .attr("transform", `translate(${innerWidth/2}, ${innerHeight/2})`)
        .selectAll("path")
        .data(firstYears)
        .join("path")
          .attr("class", "radial-path")
          .attr("d", arcGenerator)
          .attr("fill", d => {
            if (d.value === 0) { // background colour if 0
              return "white";
            } else if (d.value == maxLevel) { // fill if max value
              return colorScale(d.indicator);
            } else { // partial implementation --> hash fill
              return `url(#hash-pattern-${d.indicator}-${d.country_id})`;
            }
          })
          .attr("stroke", d => {
            if (d.value === 0 || d.value == maxLevel) {
              return "none";
            } else {
              return colorScale(d.indicator);
            }
          });

}