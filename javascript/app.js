import debounce from "./search/debounce.js";
import "./likes/likes.js";
import "./feed/infinite-scroll.js";
import "./notifications/event-emitter.js";
import "./images/image-queue.js";
import {
    filterByFollowing,
    sortByRecency,
    dedupe,
    pipe
} from "./feed/pipeline.js";
import {
    Post,
    Tweet,
    Comment,
    Retweet
} from "./models/post.js";
import { renderPosts } from "./ui/render.js";

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
