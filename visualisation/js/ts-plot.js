
const drawStackedTimeSeries = (data) => {

  // custom curve - see https://gist.github.com/kevinweber/bdcf28ec47de7cc8263de1ffa50b29a4

  // Functions for tinting/shading
  // https://medium.com/@carlosabpreciado/adding-tint-shade-dynamically-to-a-color-with-javascript-or-any-language-fa5b51ef5777
  const calculateShade = (
    hexColor, 
    percentage
  ) => {
      const r = parseInt(hexColor.slice(1, 3), 16); 
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      const shadeR = Math.round(Math.max(0, r - r * percentage));
      const shadeG = Math.round(Math.max(0, g - g * percentage));
      const shadeB = Math.round(Math.max(0, b - b * percentage));

      const hexShade = '#' + [shadeR, shadeG, shadeB]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')

      return hexShade;
  };
  const calculateTint = (
    hexColor, 
    percentage
  ) => {
      const r = parseInt(hexColor.slice(1, 3), 16); 
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      const tintR = Math.round(Math.min(255, r + (255 - r) * percentage));
      const tintG = Math.round(Math.min(255, g + (255 - g) * percentage));
      const tintB = Math.round(Math.min(255, b + (255 - b) * percentage));

      const hexShade = '#' + [tintR, tintG, tintB]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')

      return hexShade;
  };

  // Dimensions
  const width = 1000;
  const height = 600;

  const margin = {top: 50, right: 300, bottom: 50, left: 50};

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Append new svg to time series container
  const svg = d3.select("#ts")
    .append("svg")
      .attr("viewBox", [0, 0, width, height]);

  // Append gradient definitions to svg
  const gradientDefinitions = svg
    .append("defs");

  // Create gradient for each series
  indSeparatedInfo.forEach(ind => {
    let linearGradient = gradientDefinitions
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


  // Inner chart for plot
  const innerChart = svg
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Compute number of countries with each indicator in each year
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

  // Initialise the stack layout and create the stack data
  const stackGenerator = d3.stack()
    .keys(indSeparatedInfo.map(d => d.indicator))
    .order(d3.stackOrderReverse);

  const stackData = stackGenerator(dataForStack);
  console.log("stack data", stackData);

  // Scales
  const yScale = d3.scaleLinear()
    //.domain([0, d3.max(stackData[stackData.length - 1], d => d[1])]) // if not reversed
    .domain([0, d3.max(stackData[0], d => d[1])]) // if order reversed
    .range([innerHeight, 0])
    .nice();

  const xScale = d3.scaleLinear()
    .domain([d3.min(dataForStack, d => d.year), d3.max(dataForStack, d => d.year)])
    .range([0, innerWidth]);

  const xScaleBand = d3.scaleBand()
    .domain(dataForStack.map(d => d.year))
    .range([0, innerWidth])

  const colorScale = d3.scaleOrdinal()
    .domain(indSeparatedInfo.map(d => d.indicator))
    .range(indSeparatedInfo.map(d => d.color))

  // Area generator
  const areaGenerator = d3.area()
    .x(d => xScale(d.data.year))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]))
    .curve(d3.curveBumpX); // CURVE

    // // Alternative: bars
    // stackData.forEach(series => {
    //   innerChart
    //     .selectAll(`.bar-${series.key}`)
    //     .data(series)
    //     .join("rect")
    //       .attr("class", d => `bar-${series.key}`)
    //       .attr("x", d => xScaleBand(d.data.year))
    //       .attr("y", d => yScale(d[1]))
    //       .attr("width", xScaleBand.bandwidth() - 5 ) // Add one to prevent visible borders
    //       .attr("height", d => yScale(d[0]) - yScale(d[1]))
    //       .attr("fill", colorScale(series.key))
    //       .attr("fill-opacity", 1); // TODO: remove if unused

    // })

    // Alternative: custom path
    stackData.forEach(series => {
      innerChart
        .selectAll(`.path-${series.key}`)
        .data(series)
        .join("path")
          .attr("class", `bar bar-${series.key}`)
          .attr("d", (d, i) => {

            const barWidthBuff = 0;
            //const x = xScale(d.data.year); // Better spacing than xScaleBand
            const x = xScaleBand(d.data.year)
            const barWidth = xScaleBand.bandwidth() + barWidthBuff

            const rMax = 6; // max radius; must be < half the band width


            const y0 = Math.min(yScale(d[0]) + rMax, innerHeight); // need some overlap since bars below end early if curve
            const y1 = yScale(d[1]);
            const height = y0 - y1; 


            //const barWidth = Math.ceil(xScale(series[i+1]?.data.year) - x + barWidthBuff) || xScaleBand.bandwidth() // Use next x to determine spacing to avoid gaps due to rounding

            // Get previous and next values (scaled)
            // Note that since origin starts in top left, a lower value indicates a higher bar
            const currentValue = y1;
            const prevValue = yScale(series[i-1]?.[1]) || Math.min(currentValue + rMax, innerHeight); // If not available, round
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
            path += `v-${height + (rRight * (flipRight? 1 : -1))}` // right edge
            path += `a${rMax},${rRight} 0 0 ${flipRight} ${-1 * rMax}, ${rRight * (flipRight ? 1 : -1)}`; // Top right arc
            path += `h-${barWidth - (rMax * 2)}`; // top edge
            path += `a${rMax},${rLeft} 0 0 ${flipLeft} ${-1 * rMax}, ${rLeft * (flipLeft ? -1 : 1)}`; // Top left arc
            path += `v${height - rLeft * ((flipLeft ? -1 : 1))}`; // left edge

            path += `Z`; // Close the path

            return path;

          })
          .attr("fill", `url(#linear-gradient-${series.key})`) //colorScale(series.key))
          .attr("fill-opacity", d => {
            const entry = indSeparatedInfo.find(obj => obj.indicator == series.key)
            return entry.partial ? 1 : 1
          });


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

  console.log(dataLastYear);
  let indLabelData = indSeparatedInfo
  indLabelData.forEach(ind => {
    const entry = dataLastYear.find(obj => obj.key == ind.indicator);

    ind.finalY = entry.y;
    ind.finalYear = entry.year;
    ind.finalCount = entry.count;
  });
  console.log(indLabelData)

  indLabels = innerChart
    .selectAll(".g-ts-label")
    .data(indLabelData)
    .join("g")
      .attr("class", d => `g-ts-label g-ts-label-${d.indicator}`);
  
  indLabels
      .append("text")
        .attr("class", d => `ind-label ind-label-${d.indicator}`)
        .text(d => d.label) // indicator label
        .attr("x", d => xScaleBand(d.finalYear) + (xScaleBand.bandwidth() * 1.2))
        .attr("y", d => yScale(d.finalY))
        .attr("dominant-baseline", "hanging");
        
  indLabels
    .append("text")
      .attr("class", d => `country-label country-label-${d.indicator}`)
      .text(d => d.finalCount + d.country_text) // number of countries
      .attr("x", d => xScaleBand(d.finalYear) + (xScaleBand.bandwidth() * 1.2))
      .attr("y", (d, i) => {
        const yAddBase = 15
        const yInd = d.partial ? indLabelData[i-1].finalY : d.finalY // if partial measure, use y of previous series as baseline
        console.log(d.indicator, yInd)
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
  // y axis