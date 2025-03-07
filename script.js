let termImages = {};

// Load term-image mappings from JSON
async function loadTermImages() {
    termImages = await fetch('terms.json').then(res => res.json());
}

// Function to replace terms (including character names) with images in any text
function replaceTermsWithImages(text) {
    // Replace character names with their images if available
    for (const character in termImages) {
        const regex = new RegExp(`\\b${character}\\b`, "gi");  // Match character name case-insensitively

        // If there's an image for this character, add it before the name
        text = text.replace(regex, (match) => {
            const imageSrc = termImages[character.toLowerCase()];  // Get the character's image path
            const imageTag = imageSrc ? `<img src="${imageSrc}" alt="${match}" style="width: 20px; vertical-align: middle;">` : "";
            return imageTag + " " + match;  // Add image before the character name
        });
    }

    // Replace other terms (like "pineapple", etc.) with images as before
    for (const term in termImages) {
        const regex = new RegExp(`\\b${term}\\b`, "gi");
        const imageTag = `<img src="${termImages[term]}" alt="${term}" style="width: 20px; vertical-align: middle;">`;
        text = text.replace(regex, imageTag + " " + term);
    }

    return text;
}

function displayItems(items) {
    const container = document.getElementById("itemsContainer");
    container.innerHTML = "";

    items.forEach(item => {
        // Log the character array to check its structure
        console.log("item.character:", item.character);

        // Ensure that 'character' is an array
        if (!Array.isArray(item.character)) {
            console.error(`Expected 'character' to be an array, but got: ${typeof item.character}`);
            return;
        }

        // Join character names as a string and process them
        let characterNames = item.character.join(", ");  // This will work if it's an array
        characterNames = replaceTermsWithImages(characterNames);  // Add character image in front of the name (via replaceTermsWithImages)

        let sourceTextParts = item.source.split(" + ");
        let sourceImages = item.images && item.images.source
            ? (Array.isArray(item.images.source) 
                ? sourceTextParts.map((text, index) => 
                    (item.images.source[index] ? `<img src="${item.images.source[index]}" alt="Source"> ` : "") + replaceTermsWithImages(text)
                ).join(" + ") 
                : `<img src="${item.images.source}" alt="Source"> ${replaceTermsWithImages(item.source)}`)
            : replaceTermsWithImages(item.source); // Fallback if missing

        container.innerHTML += `
            <div class="item-card">
                <h3>${item.images && item.images.item ? `<img src="${item.images.item}" alt="${item.item}">` : ""} ${replaceTermsWithImages(item.item)}</h3>
                <p><strong>Character:</strong> ${characterNames}</p> <!-- Character names displayed as text, images inserted via replaceTermsWithImages -->
                <p><strong>Value:</strong> ${item.value}</p>
                <p><strong>Hearts:</strong> ${item.hearts}</p>
                <p><strong>Source:</strong> ${sourceImages}</p>
                <p><strong>Requirements:</strong> ${replaceTermsWithImages(item.requirements)}</p>
                <p><strong>Comments:</strong> ${replaceTermsWithImages(item.comments)}</p>
            </div>
        `;
    });
}

// Function to filter items based on character selection
function filterItems() {
    let selectedCharacter = document.getElementById("characterFilter").value;

    if (!database.length) {
        console.error("Database is not loaded yet!");
        return;
    }

    let filteredItems = selectedCharacter === "all"
        ? database
        : database.filter(item => item.character.includes(selectedCharacter));

    displayItems(filteredItems);
}

// Load term images first, then load database
async function loadDatabase() {
    await loadTermImages();
    database = await fetch('data.json').then(res => res.json());
    displayItems(database);
}

loadDatabase();