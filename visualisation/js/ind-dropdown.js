// Adds correct colour to each indicator dropdown button
// Dropdown must be in the same order as indInfo

d3.select("#ind-list").selectAll("button")
  .data(indInfo)
    .style("color", d => d.text_color)
    .each(function(d) {
      const clr_dark = calculateShade(d.color, 0.075) // hover/active colour
      d3.select(this).append('style')
        .html(`
        #accordion-${d.indicator}:after {
          content: "\\F229"; 
          font-family: "bootstrap-icons";
          font-size: 16px;
          float: right;
          margin-left: 5px;
          margin-right: -20px;
          color: ${d.text_color};
        }
        
        #accordion-${d.indicator}.active:after {
          content: "\\F235";
          font-family: "bootstrap-icons";
        }

        #accordion-${d.indicator} {
          background-color: ${d.color};
        }
        #accordion-${d.indicator}.active, #accordion-${d.indicator}:hover {
          background-color: ${clr_dark};
        }
        `
          ); // have to set background color here so it doesn't overwrite hover/active color
  });