let termImages = {};

// Load term-image mappings from JSON
async function loadTermImages() {
    termImages = await fetch('terms.json').then(res => res.json());
}

// Function to replace terms (including character names) with images in any text
function replaceTermsWithImages(text) {
    // Skip processing if it's already an image or HTML content
    const htmlTagRegex = /<[^>]*>/g;
    if (htmlTagRegex.test(text)) {
        return text;  // Return the text without processing if it's HTML
    }

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
        // Apply replaceTermsWithImages to ALL text content
        let itemName = replaceTermsWithImages(item.item);
        let characterNames = replaceTermsWithImages(item.character.join(", "));
        let valueText = replaceTermsWithImages(item.value.toString());
        let heartsText = replaceTermsWithImages(item.hearts.toString());
        let sourceText = replaceTermsWithImages(item.source);
        let requirementsText = replaceTermsWithImages(item.requirements);
        let commentsText = replaceTermsWithImages(item.comments);

        // Apply the same replacement for item sources and images
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
                <h3>${item.images && item.images.item ? `<img src="${item.images.item}" alt="${item.item}">` : ""} ${itemName}</h3>
                <p><strong>Character:</strong> ${characterNames}</p>
                <p><strong>Value:</strong> ${valueText}</p>
                <p><strong>Hearts:</strong> ${heartsText}</p>
                <p><strong>Source:</strong> ${sourceImages}</p>
                <p><strong>Requirements:</strong> ${requirementsText}</p>
                <p><strong>Comments:</strong> ${commentsText}</p>
            </div>
        `;
    });
}

function replaceTextInDocument() {
    const bodyTextNodes = document.body.getElementsByTagName('*'); // Get all elements in the body

    // Loop through all elements and replace text content
    for (let node of bodyTextNodes) {
        if (node.childNodes.length > 0) {
            node.childNodes.forEach(child => {
                if (child.nodeType === 3) { // Only modify text nodes
                    child.textContent = replaceTermsWithImages(child.textContent);
                }
            });
        }
    }
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
    replaceTextInDocument();  // Call to replace all text on the page
}

loadDatabase();
