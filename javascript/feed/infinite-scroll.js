import { renderPosts } from "../ui/render.js";
import { sortByRecency, dedupe } from "./pipeline.js";
import { Tweet } from "../models/post.js";
import { observeLazyImages } from "../images/image-queue.js";

/* ========================================
   DOM Elements
   ======================================== */

const feedList = document.querySelector("#feed-list");
const feedLoading = document.querySelector("#feed-loading");
const feedError = document.querySelector("#feed-error");
const feedRetry = document.querySelector("#feed-retry");
const feedSentinel = document.querySelector("#feed-sentinel");

if (!feedList || !feedSentinel) {
    console.warn("Infinite scroll: required feed elements are missing.");
} else {

/* ========================================
   Feed State
   ======================================== */

if (!window.feedPosts) {
    window.feedPosts = [];
}

let currentPage = 1;
const postsPerPage = 10;
let isLoading = false;
let hasMorePosts = true;

/* ========================================
   JSONPlaceholder Photos API
   ======================================== */

async function fetchPosts(page) {
    const start = (page - 1) * postsPerPage;

    const response = await fetch(
        `https://jsonplaceholder.typicode.com/photos?_start=${start}&_limit=${postsPerPage}`
    );

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
}

/* ========================================
   Convert Photo API → Tweet Model
   ======================================== */

function createTweetModels(photos) {
    return photos.map((photo) => {
        const tweet = new Tweet(
            photo.id,
            `User ${photo.albumId}`,
            photo.title,
            0
        );

        tweet.handle = `@user${photo.albumId}`;
        tweet.image = photo.url;
        tweet.thumbnail = photo.thumbnailUrl;
        tweet.replies = 0;
        tweet.reposts = 0;

        return tweet;
    });
}

/* ========================================
   Loading / Error State
   ======================================== */

function showLoading() {
    if (feedLoading) feedLoading.hidden = false;
    feedList.setAttribute("aria-busy", "true");
}

function hideLoading() {
    if (feedLoading) feedLoading.hidden = true;
    feedList.setAttribute("aria-busy", "false");
}

function showError() {
    if (feedError) feedError.hidden = false;
}

function hideError() {
    if (feedError) feedError.hidden = true;
}

/* ========================================
   Load Next Page
   ======================================== */

async function loadNextPage() {
    if (isLoading || !hasMorePosts) {
        return;
    }

    isLoading = true;
    hideError();
    showLoading();

    try {
        const photos = await fetchPosts(currentPage);

        if (photos.length === 0) {
            hasMorePosts = false;
            return;
        }

        const tweetPosts = createTweetModels(photos);

        const processedPosts = dedupe(
            sortByRecency(tweetPosts)
        );

        window.feedPosts = dedupe([
            ...window.feedPosts,
            ...processedPosts
        ]);

        renderPosts(processedPosts, feedList);

        /* Start observing only the newly rendered images. */
        observeLazyImages(feedList);

        /* A short final page means there is no more data. */
        if (photos.length < postsPerPage) {
            hasMorePosts = false;
        } else {
            currentPage++;
        }

    } catch (error) {
        console.error("Failed to load photos:", error);
        showError();
    } finally {
        isLoading = false;
        hideLoading();
    }
}

/* ========================================
   IntersectionObserver
   ========================================

   root:
   null = browser viewport.

   rootMargin:
   200px starts the next request before the
   sentinel reaches the visible viewport.

   threshold:
   0 = trigger as soon as the sentinel enters
   the observation area.
   ======================================== */

const observer = new IntersectionObserver(
    (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
            loadNextPage();
        }
    },
    {
        root: null,
        rootMargin: "200px",
        threshold: 0
    }
);

/* ========================================
   Retry
   ======================================== */

if (feedRetry) {
    feedRetry.addEventListener("click", loadNextPage);
}

/* ========================================
   Start
   ======================================== */

observer.observe(feedSentinel);
loadNextPage();

}
