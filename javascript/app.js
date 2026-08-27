import debounce from "./search/debounce.js";

const searchInput = document.querySelector("#search-input");

function handleSearch(value) {
    console.log("Searching for:", value);
}

const debouncedSearch = debounce(handleSearch, 500);

searchInput.addEventListener("input", (event) => {
    debouncedSearch(event.target.value);
});