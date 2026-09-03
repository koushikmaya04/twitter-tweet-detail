import debounce from "./search/debounce.js";

import "./likes/likes.js";
import "./feed/infinite-scroll.js";
import "./notifications/event-emitter.js";
import "./images/image-queue.js";


// ========================================
// Feed Storage
// ========================================

if (!window.feedPosts) {
    window.feedPosts = [];
}


// ========================================
// Search Elements
// ========================================

const searchInput =
    document.querySelector("#search-input");

const searchResults =
    document.querySelector("#search-results");


// ========================================
// Search Function
// ========================================

function handleSearch(query) {
     console.log("🔎 SEARCH EXECUTED:", query);
    if (!searchResults) {
        return;
    }

    const searchTerm =
        query.trim().toLowerCase();

    if (!searchTerm) {
        searchResults.innerHTML = "";
        return;
    }

    const results =
        window.feedPosts.filter((post) => {
            const content =
                String(post.content || "")
                    .toLowerCase();

            const author =
                String(post.author || "")
                    .toLowerCase();

            return (
                content.includes(searchTerm) ||
                author.includes(searchTerm)
            );
        });

    searchResults.innerHTML = "";

    if (results.length === 0) {
        searchResults.textContent =
            "No posts found.";

        return;
    }

    results.forEach((post) => {
        const result =
            document.createElement("div");

        result.className =
            "search-result";

        result.textContent =
            `${post.author}: ${post.content}`;

        searchResults.appendChild(result);
    });
}


// ========================================
// Debounced Search
// ========================================

const debouncedSearch =
    debounce(handleSearch, 500);

if (searchInput) {
    searchInput.addEventListener(
        "input",
        (event) => {
            debouncedSearch(
                event.target.value
            );
        }
    );
}


// ========================================
// App Loaded
// ========================================

console.log(
    "App loaded successfully"
);
