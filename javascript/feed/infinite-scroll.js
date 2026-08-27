// ========================================
// Infinite Scroll Feed
// ========================================

const feedList = document.querySelector("#feed-list");
const feedLoading = document.querySelector("#feed-loading");
const feedError = document.querySelector("#feed-error");
const feedRetry = document.querySelector("#feed-retry");
const feedSentinel = document.querySelector("#feed-sentinel");

let currentPage = 1;
const postsPerPage = 10;

let isLoading = false;
let hasMorePosts = true;


// ========================================
// Fetch one page of posts
// ========================================

async function fetchPosts(page) {
    const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${postsPerPage}`
    );

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    return response.json();
}


// ========================================
// Render posts
// ========================================

function renderPosts(posts) {
    posts.forEach((post) => {
        const article = document.createElement("article");

        article.className = "feed-card";

        article.innerHTML = `
            <h3>Post #${post.id}</h3>
            <p>${post.title}</p>
            <p>${post.body}</p>
        `;

        feedList.appendChild(article);
    });
}


// ========================================
// Loading state
// ========================================

function showLoading() {
    feedLoading.hidden = false;
    feedList.setAttribute("aria-busy", "true");
}

function hideLoading() {
    feedLoading.hidden = true;
    feedList.setAttribute("aria-busy", "false");
}


// ========================================
// Error state
// ========================================

function showError() {
    feedError.hidden = false;
}

function hideError() {
    feedError.hidden = true;
}


// ========================================
// Load next page
// ========================================

async function loadNextPage() {
    if (isLoading || !hasMorePosts) {
        return;
    }

    isLoading = true;

    hideError();
    showLoading();

    try {
        const posts = await fetchPosts(currentPage);

        // No more posts
        if (posts.length === 0) {
            hasMorePosts = false;
            return;
        }

        renderPosts(posts);

        currentPage++;
    } catch (error) {
        console.error("Failed to load posts:", error);
        showError();
    } finally {
        isLoading = false;
        hideLoading();
    }
}


// ========================================
// IntersectionObserver
// ========================================

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


// ========================================
// Retry
// ========================================

feedRetry.addEventListener("click", () => {
    loadNextPage();
});


// ========================================
// Start observing
// ========================================

observer.observe(feedSentinel);


// ========================================
// Initial load
// ========================================

loadNextPage();