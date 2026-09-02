import { renderPosts } from "../ui/render.js";

import {
    sortByRecency,
    dedupe
} from "./pipeline.js";

import { Tweet } from "../models/post.js";


// ========================================
// DOM Elements
// ========================================

const feedList =
    document.querySelector("#feed-list");

const feedLoading =
    document.querySelector("#feed-loading");

const feedError =
    document.querySelector("#feed-error");

const feedRetry =
    document.querySelector("#feed-retry");

const feedSentinel =
    document.querySelector("#feed-sentinel");


// ========================================
// Feed State
// ========================================

if (!window.feedPosts) {
    window.feedPosts = [];
}

let currentPage = 1;

const postsPerPage = 10;

let isLoading = false;
let hasMorePosts = true;


// ========================================
// Fetch Posts
// ========================================

async function fetchPosts(page) {
    const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${postsPerPage}`
    );

    if (!response.ok) {
        throw new Error(
            `HTTP error: ${response.status}`
        );
    }

    return response.json();
}


// ========================================
// Loading State
// ========================================

function showLoading() {
    feedLoading.hidden = false;
    feedList.setAttribute(
        "aria-busy",
        "true"
    );
}


function hideLoading() {
    feedLoading.hidden = true;
    feedList.setAttribute(
        "aria-busy",
        "false"
    );
}


// ========================================
// Error State
// ========================================

function showError() {
    feedError.hidden = false;
}


function hideError() {
    feedError.hidden = true;
}


// ========================================
// Convert API Data → Tweet Models
// ========================================

function createTweetModels(posts) {
    return posts.map((post) => {
        return new Tweet(
            post.id,
            `User ${post.userId}`,
            post.body,
            0
        );
    });
}


// ========================================
// Load Next Page
// ========================================

async function loadNextPage() {
    if (isLoading || !hasMorePosts) {
        return;
    }

    isLoading = true;

    hideError();
    showLoading();

    try {
        const posts =
            await fetchPosts(currentPage);

        if (posts.length === 0) {
            hasMorePosts = false;
            return;
        }

        const tweetPosts =
            createTweetModels(posts);

        const processedPosts =
            dedupe(
                sortByRecency(tweetPosts)
            );

        window.feedPosts =
            dedupe([
                ...window.feedPosts,
                ...processedPosts
            ]);

        renderPosts(
            processedPosts,
            feedList
        );

        currentPage++;

    } catch (error) {

        console.error(
            "Failed to load posts:",
            error
        );

        showError();

    } finally {

        isLoading = false;
        hideLoading();
    }
}


// ========================================
// Intersection Observer
// ========================================

const observer =
    new IntersectionObserver(
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


// ========================================
// Retry
// ========================================

if (feedRetry) {
    feedRetry.addEventListener(
        "click",
        loadNextPage
    );
}


// ========================================
// Start Observer
// ========================================

if (feedSentinel) {
    observer.observe(feedSentinel);
}


// ========================================
// Initial Load
// ========================================

loadNextPage();
