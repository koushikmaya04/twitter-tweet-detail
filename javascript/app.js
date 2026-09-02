import debounce from "./search/debounce.js";

import "./likes/likes.js";
import "./feed/infinite-scroll.js";
import "./notifications/event-emitter.js";
import "./images/image-queue.js";


// ========================================
// Debounced Search
// ========================================

import { renderPosts } from "./ui/render.js";


// ========================================
// Feed Storage
// ========================================

if (!window.feedPosts) {
    window.feedPosts = [];
}

const debouncedSearch = debounce(handleSearch, 500);

searchInput.addEventListener("input", (event) => {
    debouncedSearch(event.target.value);
});
