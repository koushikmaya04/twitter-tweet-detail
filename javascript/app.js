import debounce from "./search/debounce.js";
import "./likes/likes.js";
import "./feed/infinite-scroll.js";
import "./notifications/event-emitter.js";
import "./images/image-queue.js";


// ========================================
// Debounced Search
// ========================================

const searchInput = document.querySelector("#search-input");

function handleSearch(value) {
    console.log("Searching for:", value);
}

const debouncedSearch = debounce(handleSearch, 500);

searchInput.addEventListener("input", (event) => {
    debouncedSearch(event.target.value);
});