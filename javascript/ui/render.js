/* ========================================
   HTML Safety
   ======================================== */

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/* ========================================
   Create One Post
   ======================================== */

function createPostElement(post) {
    const article = document.createElement("article");

    article.className = "feed-card";
    article.dataset.postId = post.id;
    article.dataset.postType = post.type || "tweet";

    const likes =
        typeof post.getLikes === "function"
            ? post.getLikes()
            : Number(post.likes) || 0;

    const author = escapeHtml(post.author);
    const handle = escapeHtml(post.handle || `@user${post.id}`);
    const content = escapeHtml(post.content);

    const imageMarkup = post.image
        ? `
            <div class="feed-card-media">
                <img
                    class="lazy-image"
                    data-src="${escapeHtml(post.image)}"
                    alt="${content}"
                    loading="lazy"
                >
            </div>
        `
        : "";

    article.innerHTML = `
        <header class="feed-card-header">
            <div>
                <h3>${author}</h3>
                <span class="feed-card-handle">${handle}</span>
            </div>
        </header>

        <div class="feed-card-body">
            <p class="feed-post-content">${content}</p>
            ${imageMarkup}
        </div>

        <footer class="feed-card-actions" aria-label="Post actions">
            <button type="button" data-action="reply" aria-label="Reply">
                💬 <span>0</span>
            </button>

            <button type="button" data-action="repost" aria-label="Repost">
                🔁 <span>0</span>
            </button>

            <button type="button" data-action="like" aria-label="Like">
                ❤️ <span>${likes}</span>
            </button>

            <button type="button" data-action="share" aria-label="Share">
                📤
            </button>
        </footer>
    `;

    return article;
}

/* ========================================
   Render Multiple Posts
   ======================================== */

function renderPosts(posts, container) {
    if (!container) {
        return;
    }

    const fragment = document.createDocumentFragment();

    posts.forEach((post) => {
        fragment.appendChild(
            createPostElement(post)
        );
    });

    container.appendChild(fragment);
}

/* ========================================
   Clear Posts
   ======================================== */

function clearPosts(container) {
    if (!container) {
        return;
    }

    container.innerHTML = "";
}

/* ========================================
   Export
   ======================================== */

export {
    createPostElement,
    renderPosts,
    clearPosts
};
