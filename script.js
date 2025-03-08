let termImages = {};

// Load term-image mappings from JSON
async function loadTermImages() {
    termImages = await fetch('terms.json').then(res => res.json());
}

// Replace terms with images in text
function replaceTermsWithImages(text) {
    Object.keys(termImages).forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, "gi");
        const imageTag = `<img src="${termImages[term]}" alt="${term}>`;
        text = text.replace(regex, `${imageTag} ${term}`);
    });
    return text;
}

function displayItems(items) {
    const container = document.getElementById("itemsContainer");
    container.innerHTML = items.map(item => {
        const characterNames = replaceTermsWithImages(item.character.join(", "));
        const sourceText = item.images && item.images.source
            ? (Array.isArray(item.images.source)
                ? item.source.split(" + ").map((text, i) => `<img src="${item.images.source[i]}" alt="Source"> ${replaceTermsWithImages(text)}`).join(" + ")
                : `<img src="${item.images.source}" alt="Source"> ${replaceTermsWithImages(item.source)}`)
            : replaceTermsWithImages(item.source);

        return `
            <div class="item-card">
                <h3>${item.images?.item ? `<img src="${item.images.item}" alt="${item.item}">` : ""} ${replaceTermsWithImages(item.item)}</h3>
                <p><strong>Character:</strong> ${characterNames}</p>
                <p><strong>Value:</strong> ${item.value}</p>
                <p><strong>Hearts:</strong> ${item.hearts}</p>
                <p><strong>Source:</strong> ${sourceText}</p>
                <p><strong>Requirements:</strong> ${replaceTermsWithImages(item.requirements)}</p>
                <p><strong>Comments:</strong> ${replaceTermsWithImages(item.comments)}</p>
            </div>
        `;
    }).join('');
}

function filterItems() {
    const selectedCharacter = document.getElementById("characterFilter").value;
    if (!database.length) return console.error("Database is not loaded yet!");

    const filteredItems = selectedCharacter === "all"
        ? database
        : database.filter(item => item.character.includes(selectedCharacter));

    displayItems(filteredItems);
}

// Load term images and database, then display items
async function loadDatabase() {
    await loadTermImages();
    database = await fetch('data.json').then(res => res.json());
    displayItems(database);
}

loadDatabase();
