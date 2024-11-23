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