// Adds correct colour to each indicator dropdown button
// Dropdown must be in the same order as indInfo

d3.select("#ind-list").selectAll("button")
  .data(indInfo)
    .style("background-color", d => d.color)
    .style("color", d => d.text_color)
    .each(function(d) {
      const clr = d.text_color;
      console.log(clr)
      d3.select(this).append('style')
        .html(`
        #accordion-${d.indicator}:after {
          content: "\\F229"; 
          font-family: "bootstrap-icons";
          font-size: 16px;
          float: right;
          margin-left: 5px;
          color: ${clr};
        }
        
        #accordion-${d.indicator}.active:after {
          content: "\\F235";
          font-family: "bootstrap-icons";
        }`
          );
  });