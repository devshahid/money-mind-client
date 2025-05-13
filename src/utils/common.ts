export function generateRandomColor(): string {
    // Generate a random color in hex format
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to calculate contrast and determine text color (white or black)
export function getTextColor(backgroundColor: string): string {
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

export function stringToColor(string: string): string {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
}

export function stringAvatar(name: string): { sx: { bgcolor: string }; children: string } {
    let firstName: string | string[] = name.split(" ");
    if (Array.isArray(firstName)) firstName = firstName[0][0];

    let lastName: string | string[] = name.split(" ");
    if (Array.isArray(lastName) && lastName.length > 1) lastName = lastName[1][0];
    else lastName = "";

    return {
        sx: { bgcolor: stringToColor(name) },
        children: `${firstName.toUpperCase()}${lastName.toUpperCase()}`,
    };
}
