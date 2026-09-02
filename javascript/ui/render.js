// ========================================
// Create One Post
// ========================================

function createPostElement(post) {
    const article =
        document.createElement("article");

    article.className = "feed-card";

    article.dataset.postId = post.id;

    const likes =
        typeof post.getLikes === "function"
            ? post.getLikes()
            : 0;

    article.innerHTML = `
        <header class="feed-card-header">
            <h3>
                ${post.author}
            </h3>
        </header>

        <div class="feed-card-body">
            <p class="feed-post-content">
                ${post.content}
            </p>
        </div>

        <footer class="feed-card-actions">
            <span>
                ❤️ ${likes}
            </span>
        </footer>
    `;

    return article;
}


// ========================================
// Render Multiple Posts
// ========================================

function renderPosts(posts, container) {
    if (!container) {
        return;
    }

    posts.forEach((post) => {
        const article =
            createPostElement(post);

        container.appendChild(article);
    });
}


// ========================================
// Clear Posts
// ========================================

function clearPosts(container) {
    if (!container) {
        return;
    }

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
