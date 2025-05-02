export function generateRandomColor() {
    // Generate a random color in hex format
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to calculate contrast and determine text color (white or black)
export function getTextColor(backgroundColor: string) {
    const color = backgroundColor.substring(1); // Remove the '#' symbol
    const rgb = parseInt(color, 16); // Convert to RGB
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    // Calculate the luminance (perceived brightness) of the color
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // If luminance is above 128, use black text; otherwise, use white text
    return luminance > 128 ? "black" : "white";
}
