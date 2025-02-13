const pokemonContainer = document.getElementById("pokemonContainer");
const loadMoreButton = document.getElementById("load-more");
const searchBar = document.getElementById("search-bar");

let currentStart = 1; 
const batchSize = 60;
let maxPokemon = 1000; 
const threshold = 240;
let allPokemon = [];
let isLoading = false;

function getImageUrl(ID) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ID}.png`
}

async function getPokemonData(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        const name = data.name;
        const types = data.types.map(typeInfo => typeInfo.type.name);
        return { name, types };
    } catch (error) {
        console.error(`Error while fetching Pokémon with ID ${id}:`, error);
        return { name: `Pokemon ${id}`, types: [] };
    }
}

async function createPokemonElement(pokemon) {
    const imgSrc = './image/placeholder-img.png';
    const pokeImg = document.createElement("img");
    pokeImg.src = imgSrc;
    pokeImg.className = 'pokemon-skeleton';

    return pokeImg;
}

// async function loadAllPokemon() {
//     for (let i=1;i<=maxPokemon;i++) {
//         const { name, types } = await getPokemonData(i);
//         allPokemon.push({ i, name, types });
//     }
// }

async function renderPokemon(id) {
    const { name, types } = await getPokemonData(id);

    allPokemon.push({ id, name, types });

    const div = document.createElement('div');
    div.className = 'pokemon';
    div.dataset.name = name.toLowerCase(); 
    div.dataset.types = types.join(" ").toLowerCase(); 

    const idTag = document.createElement('h4');
    idTag.className = 'pokemon-id';
    idTag.innerText = `#${id}`;

    const pokeImg = await createPokemonElement({ id, name, types });

    const finalImageUrl = getImageUrl(id);
    const tempImg = new Image();
    tempImg.src = finalImageUrl;
    tempImg.onload = () => {
        pokeImg.src = finalImageUrl; 
    };

    const nameTag = document.createElement('h3');
    nameTag.innerText = name;

    const typesContainer = document.createElement('div');
    typesContainer.className = 'pokemon-types';
    types.forEach(type => {
        const typeTag = document.createElement('span');
        typeTag.className = `type ${type}`;
        typeTag.innerText = type;
        typesContainer.appendChild(typeTag);
    });

    div.appendChild(idTag);
    div.appendChild(pokeImg);
    div.appendChild(nameTag);
    div.appendChild(typesContainer);

    pokemonContainer.appendChild(div);
}

async function loadPokemon(start, count) {
    for (let i = start; i < start + count; i++) {
        if (i > maxPokemon) break;
        await renderPokemon(i);
    }
}

async function loadFilteredPokemon(start, count, searchValue) {
    let loaded = 0;
    let current = start;
    searchValue = searchValue.toLowerCase();
    
    while (loaded < count && current <= maxPokemon) {
        const data = await getPokemonData(current);
        
        // Kiểm tra tên Pokémon
        if (data.name.toLowerCase().includes(searchValue)) {
            await renderPokemon(current);
            loaded++;
        }
        
        current++;
    }
    
    // Cập nhật vị trí bắt đầu cho lần tải tiếp theo
    currentStart = current;
    
    // Ẩn nút nếu đã tải hết
    if (current > maxPokemon) {
        loadMoreButton.style.display = "none";
    }
}

loadMoreButton.addEventListener("click", async () => {
    if (isLoading) return;
    isLoading = true;

    const searchValue = searchBar.value.trim();

    if (searchValue) {
        // Tải Pokémon có điều kiện
        await loadFilteredPokemon(currentStart, batchSize, searchValue);
    }
    else {
        if (currentStart <= maxPokemon) {
            await loadPokemon(currentStart, batchSize);
            currentStart += batchSize; 
        }
        if (currentStart > threshold && currentStart <= maxPokemon) {
            await loadPokemon(currentStart, maxPokemon - currentStart + 1);
            currentStart = maxPokemon + 1; 
            loadMoreButton.style.display = "none";
        } 
    }
    isLoading = false;
});
//bat dau load
// loadAllPokemon();
loadPokemon(currentStart, batchSize);
currentStart += batchSize;

function renderFilteredPokemon(filteredPokemon) {
    pokemonContainer.innerHTML = ""; 

    filteredPokemon.forEach(pokemon => {
        const { id, name, types } = pokemon;

        const div = document.createElement('div');
        div.className = 'pokemon';

        const idTag = document.createElement('h4');
        idTag.className = 'pokemon-id';
        idTag.innerText = `#${id}`;

        const pokeImg = document.createElement('img');
        pokeImg.className = 'pokemon-skeleton';
        pokeImg.src = getImageUrl(id);

        const nameTag = document.createElement('h3');
        nameTag.innerText = name;

        const typesContainer = document.createElement('div');
        typesContainer.className = 'pokemon-types';
        types.forEach(type => {
            const typeTag = document.createElement('span');
            typeTag.className = `type ${type}`;
            typeTag.innerText = type;
            typesContainer.appendChild(typeTag);
        });

        div.appendChild(idTag);
        div.appendChild(pokeImg);
        div.appendChild(nameTag);
        div.appendChild(typesContainer);

        pokemonContainer.appendChild(div);
    });
}

const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

searchBar.addEventListener("input", debounce(() => {
    const searchValue = searchBar.value.trim().toLowerCase();

    currentStart = 1;
    pokemonContainer.innerHTML = "";
    loadMoreButton.style.display = "block";
    if (searchValue) {
        loadFilteredPokemon(currentStart, batchSize, searchValue).finally(() => {
        });
        // const filteredPokemon = allPokemon.filter(pokemon => 
        //     pokemon.name.toLowerCase().includes(searchValue)
        // );
        // renderFilteredPokemon(filteredPokemon);
        // loadMoreButton.style.display = 'none';
    } else {
        loadPokemon(1, batchSize);
        currentStart = batchSize + 1;
        // pokemonContainer.innerHTML = ''; 
        // loadMoreButton.style.display = 'block'; 
        // loadPokemon(1, 60);
    }
}, 150));
