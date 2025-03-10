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

function updateRequirementFilters() {
    document.querySelectorAll("#requirementFilter input[type='checkbox']").forEach(checkbox => {
        const requirementID = checkbox.value;

        if (termImages[requirementID] && termImages[requirementID].upgrades) {
            termImages[requirementID].upgrades.forEach(upgradeID => {
                const upgradeCheckbox = document.querySelector(`#requirementFilter input[value="${upgradeID}"]`);
                if (upgradeCheckbox) {
                    const upgradeContainer = upgradeCheckbox.closest("label") || upgradeCheckbox.parentElement;

                    if (checkbox.checked) {
                        upgradeContainer.style.display = ""; // Show upgrade
                    } else {
                        upgradeContainer.style.display = "none"; // Fully hide the upgrade option
                        upgradeCheckbox.checked = false; // Uncheck if hidden
                    }
                }
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadTermImages().then(() => {
        document.querySelectorAll("#requirementFilter input[type='checkbox']").forEach(checkbox => {
            checkbox.addEventListener("change", updateRequirementFilters);
        });

        updateRequirementFilters(); // Hide upgrades on page load
    });
});

// Run the function once to initialize the correct visibility
updateRequirementFilters();

// Replace IDs with images and names
function replaceIDsWithIcons(text) {
    return text.replace(/\|([\w-]+)\|/g, (match, id) => {
        if (termImages[id]) {
            const { name, img } = termImages[id];
            return `<img src="${img}" alt="${name}" style="width: 20px; vertical-align: middle;"> ${name}`;
        }
        return match; // If no match is found in termImages, return the original term
    });
}

function displayItems(items) {
    const selectedCharacter = document.getElementById("characterFilter").value;
    const container = document.getElementById("itemsContainer");
    container.innerHTML = items.map(item => {
        const characterNames = replaceIDsWithIcons(item.character.join(", "));
        const sourceText = replaceIDsWithIcons(item.source);
        const requirementsText = item.requirements
            ? replaceIDsWithIcons(Array.isArray(item.requirements) ? item.requirements.join(", ") : item.requirements)
            : "None";

        // Display value & hearts only if a specific character is selected
        let valueText = selectedCharacter !== "all" ? (item.value[selectedCharacter] || "N/A") : "Select a character";
        let heartsText = selectedCharacter !== "all" ? (item.hearts[selectedCharacter] || "N/A") : "Select a character";

        return `
            <div class="item-card">
                <h3>${replaceIDsWithIcons(item.item)}</h3>
                <p><strong>Character:</strong> ${characterNames}</p>
                <p><strong>Value:</strong> ${valueText}</p>
                <p><strong>Hearts:</strong> ${heartsText}</p>
                <p><strong>Source:</strong> ${sourceText}</p>
                <p><strong>Requirements:</strong> ${requirementsText}</p>
                <p><strong>Comments:</strong> ${replaceIDsWithIcons(item.comments)}</p>
            </div>
        `;
    }).join('');
}

function filterItems() {
    const selectedCharacter = document.getElementById("characterFilter").value;
    const requirementFilters = Array.from(document.querySelectorAll("#requirementFilter input[type='checkbox']:checked"))
                                  .map(checkbox => checkbox.value);

    if (!database.length) return console.error("Database is not loaded yet!");

    let filteredItems = database.filter(item => {
        // Check if the selected character matches
        const characterMatch = selectedCharacter === "all" || item.character.includes(selectedCharacter);

        // Check if the item meets any selected requirements
        const requirementsMatch = requirementFilters.length === 0 || item.requirements === "None" || requirementFilters.some(requirement => 
            item.requirements.includes(`|${requirement}|`)
        );

        return characterMatch && requirementsMatch;
    });

    // Sorting logic
    if (selectedCharacter === "all") {
        // Sort alphabetically by item name if no character is selected
        filteredItems.sort((a, b) => a.item.localeCompare(b.item));
    } else {
        // Sort by highest to lowest value for the selected character, then alphabetically
        filteredItems.sort((a, b) => {
            const valueA = a.value[selectedCharacter] || 0;
            const valueB = b.value[selectedCharacter] || 0;

            if (valueB === valueA) {
                return a.item.localeCompare(b.item); // Alphabetical order as a tiebreaker
            }
            return valueB - valueA; // Descending order of value
        });
    }

    displayItems(filteredItems);
}

// Populate the filter UI (dropdown and checkboxes) with character and requirement names
async function createFilterOptions() {
    const characterFilter = document.getElementById("characterFilter");
    const requirementFilter = document.getElementById("requirementFilter");

    // Add characters to character filter
    Object.entries(termImages).forEach(([id, { name }]) => {
        if (id.startsWith("|") && id !== "|all|") {  // Avoid adding "all" as a character
            characterFilter.innerHTML += `<option value="${id.replace(/^\|([\w-]+)\|$/, '$1')}">${name}</option>`;
        }
    });

    // Add requirements to requirement filter checkboxes (using names from terms.json)
    Object.entries(termImages).forEach(([id, { name }]) => {
        if (id.startsWith("|")) {  // Only include terms that start with "|"
            requirementFilter.innerHTML += `
                <label>
                    <input type="checkbox" value="${id.replace(/^\|([\w-]+)\|$/, '$1')}"> ${name}
                </label><br>
            `;
        }
    });
}

// Load database and terms, then display items
async function loadDatabase() {
    await loadTermImages();  // Ensure terms.json is loaded first
    await createFilterOptions();  // Create filter options after loading termImages
    database = await fetch('data.json').then(res => res.json());
    database.sort((a, b) => a.item.localeCompare(b.item)); // Sort the database alphabetically by item name
    displayItems(database);
}

document.addEventListener("DOMContentLoaded", loadDatabase);
