// Helper functions

// Functions for tinting/shading
// https://medium.com/@carlosabpreciado/adding-tint-shade-dynamically-to-a-color-with-javascript-or-any-language-fa5b51ef5777

function calculateShade(
  hexColor, 
  percentage
) {
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

function calculateTint(
  hexColor, 
  percentage
) {
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

// Patterns/gradients

function addHashPatternDef(
  def, // svg definitions to append to
  id, // id to give pattern
  hashSpacing, // spacing
  hashAngle, // angle (off vertical)
  hashColor, // colour
  hashBackgroundColor, // background colour
  hashOpacity, // opacity
  hashStroke, //stroke width
  ) {

    let pattern = def
    .append("pattern")
      .attr("id", id)
      .attr("width", hashSpacing)
      .attr("height", hashSpacing)
      .attr("patternUnits", "userSpaceOnUse")
      .attr("patternTransform", `rotate(${hashAngle} 0 0)`);
    pattern.append("rect")
      .attr("height", "100%")
      .attr("width", "100%")
      .attr("fill", hashBackgroundColor);
    pattern.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", hashSpacing)
      .attr("stroke", hashColor)
      .attr("stroke-width", hashStroke)
      .attr("opacity", hashOpacity);
}