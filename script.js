let termImages = {};
let database = [];

// Load term-image mappings from JSON
async function loadTermImages() {
    try {
        const response = await fetch('terms.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch terms.json: ${response.statusText}`);
        }
        termImages = await response.json();
        console.log(termImages); // This should log the data if it's loaded successfully
    } catch (error) {
        console.error("Error loading term images:", error);
    }
}

// Replace IDs with images and names
function replaceIDsWithIcons(text) {
    // Regular expression to match terms between | symbols
    return text.replace(/\|([\w-]+)\|/g, (match, id) => {
        // Check if the term exists in termImages
        if (termImages[id]) {
            const { name, img } = termImages[id];
            return `<img src="${img}" alt="${name}" style="width: 20px; vertical-align: middle;"> ${name}`;
        }
        return match;  // If no match is found in termImages, return the original term
    });
}


function displayItems(items) {
    const container = document.getElementById("itemsContainer");
    container.innerHTML = items.map(item => {
        const characterNames = replaceIDsWithIcons(item.character.join(", "));
        const sourceText = replaceIDsWithIcons(item.source);
        const requirementsText = item.requirements
            ? replaceIDsWithIcons(Array.isArray(item.requirements) ? item.requirements.join(", ") : item.requirements)
            : "None";

        return `
            <div class="item-card">
                <h3>${replaceIDsWithIcons(item.item)}</h3>
                <p><strong>Character:</strong> ${characterNames}</p>
                <p><strong>Value:</strong> ${item.value}</p>
                <p><strong>Hearts:</strong> ${item.hearts}</p>
                <p><strong>Source:</strong> ${sourceText}</p>
                <p><strong>Requirements:</strong> ${requirementsText}</p>
                <p><strong>Comments:</strong> ${replaceIDsWithIcons(item.comments)}</p>
            </div>
        `;
    }).join('');
}

function filterItems() {
    const selectedCharacter = document.getElementById("characterFilter").value;
    const applianceFilters = Array.from(document.querySelectorAll("#applianceFilter input[type='checkbox']:checked"))
                                  .map(checkbox => checkbox.value);

    if (!database.length) return console.error("Database is not loaded yet!");

    const filteredItems = database.filter(item =>
        (selectedCharacter === "all" || item.character.includes(selectedCharacter)) &&
        (applianceFilters.length === 0 || applianceFilters.some(appliance => item.requirements.includes(appliance)))
    );

    displayItems(filteredItems);
}

// Load database and terms, then display items
async function loadDatabase() {
    database = await fetch('data.json').then(res => res.json());
    displayItems(database);
}

document.addEventListener("DOMContentLoaded", loadDatabase);
