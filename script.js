let termImages = {};
let database = [];

// Load term-image mappings from JSON
async function loadTermImages() {
    termImages = await fetch('terms.json').then(res => res.json());
}

// Replace IDs with images and names
function replaceIDsWithIcons(text) {
    return text.replace(/\b(char_\d+|appl_\d+)\b/g, (match) => {
        if (termImages[match]) {
            const { name, img } = termImages[match];
            return `<img src="${img}" alt="${name}" style="width: 20px; vertical-align: middle;"> ${name}`;
        }
        return match;
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
    const selectedAppliance = document.getElementById("applianceFilter").value;
    if (!database.length) return console.error("Database is not loaded yet!");

    const filteredItems = database.filter(item => 
        (selectedCharacter === "all" || item.character.includes(selectedCharacter)) &&
        (selectedAppliance === "all" || item.requirements.includes(selectedAppliance))
    );

    displayItems(filteredItems);
}

async function createFilterOptions() {
    await loadTermImages();
    const characterFilter = document.getElementById("characterFilter");
    const applianceFilter = document.getElementById("applianceFilter");

    Object.entries(termImages).forEach(([id, { name, img }]) => {
        if (id.startsWith(".")) {
            characterFilter.innerHTML += `<option value="${id}">${name}</option>`;
        }
    });
}

// Load database and terms, then display items
async function loadDatabase() {
    await createFilterOptions();
    database = await fetch('data.json').then(res => res.json());
    displayItems(database);
}

document.addEventListener("DOMContentLoaded", loadDatabase);
