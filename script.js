let termImages = {}, database = [];

async function fetchJSON(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
        return {};
    }
}

async function loadDatabase() {
    termImages = await fetchJSON('terms.json');
    database = await fetchJSON('data.json');
    database.sort((a, b) => a.item.localeCompare(b.item));
    createFilterOptions();
    updateRequirementFilters(); // Ensure upgrades are hidden initially
    displayItems(database);
}

document.addEventListener("DOMContentLoaded", loadDatabase);

document.querySelectorAll("#requirementFilter").forEach(filter => 
    filter.addEventListener("change", updateRequirementFilters)
);

function updateRequirementFilters() {
    document.querySelectorAll("#requirementFilter input[type='checkbox']").forEach(checkbox => {
        const requirementID = checkbox.value;
        termImages[requirementID]?.upgrades?.forEach(upgradeID => {
            const upgradeCheckbox = document.querySelector(`#requirementFilter input[value="${upgradeID}"]`);
            if (upgradeCheckbox) {
                const upgradeContainer = upgradeCheckbox.closest("label");
                if (checkbox.checked) {
                    upgradeContainer.style.display = "";
                } else {
                    upgradeContainer.style.display = "none";
                    upgradeCheckbox.checked = false;
                }
            }
        });
    });
}

function replaceIDsWithIcons(text) {
    return text.replace(/\|([\w-]+)\|/g, (match, id) => 
        termImages[id] ? `<img src="${termImages[id].img}" alt="${termImages[id].name}" style="width: 20px; vertical-align: middle;"> ${termImages[id].name}` : match
    );
}

function displayItems(items) {
    document.getElementById("itemsContainer").innerHTML = items.map(item => `
        <div class="item-card">
            <h3>${replaceIDsWithIcons(item.item)}</h3>
            <p><strong>Character(s):</strong> ${replaceIDsWithIcons(item.character.join(", "))}</p>
            <p><strong>Value:</strong> ${getValueText(item)}</p>
            <p><strong>Hearts:</strong> ${getHeartsText(item)}</p>
            <p><strong>Source:</strong> ${replaceIDsWithIcons(item.source)}</p>
            <p><strong>Requirement(s):</strong> ${replaceIDsWithIcons(item.requirements || "None")}</p>
            <p><strong>Comments:</strong> ${getCommentsText(item)}</p>
        </div>`
    ).join('');
}

function getValueText(item) {
    const selectedCharacter = document.getElementById("characterFilter").value;
    return selectedCharacter === "all" ? "Select a character" : (item.value[selectedCharacter] || 0);
}

function getHeartsText(item) {
    const selectedCharacter = document.getElementById("characterFilter").value;
    if (selectedCharacter === "all") return "Select a character";
    const hearts = item.hearts[selectedCharacter] || 0;
    return hearts > 0 ? `<span class="hearts">${'<img src="images/misc/Heart.webp" alt="heart" style="width: 16px;"> '.repeat(hearts)}</span>` : "0";
}

function getCommentsText(item) {
    const selectedCharacter = document.getElementById("characterFilter").value;
    if (selectedCharacter === "all") return "Select a character";
    return replaceIDsWithIcons(item.comments[selectedCharacter] || "No comments available");
}

function filterItems() {
    const selectedCharacter = document.getElementById("characterFilter").value;
    const filters = Array.from(document.querySelectorAll("#requirementFilter input:checked")).map(cb => `|${cb.value}|`);

    let filteredItems = database.filter(item => 
        (selectedCharacter === "all" || item.character.includes(selectedCharacter)) &&
        (filters.length === 0 || item.requirements === "None" || filters.some(req => item.requirements.includes(req)))
    );

    filteredItems.sort((a, b) => selectedCharacter === "all" ? a.item.localeCompare(b.item) : (b.value[selectedCharacter] || 0) - (a.value[selectedCharacter] || 0));
    displayItems(filteredItems);
}

function createFilterOptions() {
    const characterFilter = document.getElementById("characterFilter");
    const requirementFilter = document.getElementById("requirementFilter");
    
    Object.entries(termImages).forEach(([id, { name }]) => {
        if (id.startsWith("|")) {
            requirementFilter.innerHTML += `<label><input type="checkbox" value="${id.replace(/\|/g, '')}"> ${name}</label><br>`;
            if (id !== "|all|") characterFilter.innerHTML += `<option value="${id.replace(/\|/g, '')}">${name}</option>`;
        }
    });
}
