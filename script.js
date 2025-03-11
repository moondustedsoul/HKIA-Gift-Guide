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

function getCharacterValueHeartsTable(item) {
    let tableHTML = `<table class="character-table">
        <tr>
            <th>Character</th>
            <th>Value</th>
            <th>Hearts</th>
        </tr>`;

    item.character.forEach(char => {
        const value = item.value[char] || 0;
        const hearts = item.hearts[char] || 0;
        const heartIcons = hearts > 0 
            ? `<span class="hearts">${'<img src="images/misc/Heart.webp" alt="heart" style="width: 16px;"> '.repeat(hearts)}</span>` 
            : "0";

        tableHTML += `<tr>
            <td>${replaceIDsWithIcons(char)}</td>
            <td>${value}</td>
            <td>${heartIcons}</td>
        </tr>`;
    });

    tableHTML += `</table>`;
    return tableHTML;
}

function displayItems(items) {
    document.getElementById("itemsContainer").innerHTML = items.map(item => `
        <div class="item-card">
            <h3>${replaceIDsWithIcons(item.item)}</h3>
            ${getCharacterValueHeartsTable(item)}
            <h4>Source</h4>
            <p>${replaceIDsWithIcons(item.source)}</p>
            <h4>Requirement(s)</h4>
            <p>${replaceIDsWithIcons(item.requirements || "None")}</p>
            <h4>Comments</h4>
            <p>${getCommentsText(item)}</p>
        </div>`
    ).join('');
}

function getValueText(item) {
    return item.character.map(char => 
        `<strong>${replaceIDsWithIcons(char)}:</strong> ${item.value[char] || 0}`
    ).join("<br>");
}

function getHeartsText(item) {
    return item.character.map(char => {
        const hearts = item.hearts[char] || 0;
        return `<strong>${replaceIDsWithIcons(char)}:</strong> ` + 
               (hearts > 0 ? `<span class="hearts">${'<img src="images/misc/Heart.webp" alt="heart" style="width: 16px;"> '.repeat(hearts)}</span>` : "0");
    }).join("<br>");
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
