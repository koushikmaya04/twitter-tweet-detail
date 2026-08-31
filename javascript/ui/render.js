
// ========================================
// Feed Rendering
// ========================================

// Create one feed post element
function createPostElement(post) {
    const article = document.createElement("article");

    article.className = "feed-card";
    article.dataset.postId = post.id;

    article.innerHTML = `
        <header class="feed-card-header">
            <h3>Post #${post.id}</h3>
        </header>

        <div class="feed-card-body">
            <p class="feed-post-title">
                ${post.title}
            </p>

            <p class="feed-post-content">
                ${post.body}
            </p>
        </div>
    `;

    return article;
}


// ========================================
// Render multiple posts
// ========================================

function renderPosts(posts, container) {
    posts.forEach((post) => {
        const article = createPostElement(post);

        container.appendChild(article);
    });
}


// ========================================
// Clear feed
// ========================================

function clearPosts(container) {
    container.innerHTML = "";
}


// ========================================
// Export
// ========================================

export {
    createPostElement,
    renderPosts,
    clearPosts
};
