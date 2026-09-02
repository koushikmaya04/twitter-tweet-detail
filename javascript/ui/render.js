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
   SVG Icons
   ======================================== */

const icons = {

    reply: `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M14.046 2.242c-5.056 0-9.158 3.31-9.158 7.397 0 2.286 1.273 4.33 3.278 5.68-.14 1.004-.57 2.07-1.31 3.18 1.61-.17 3.18-.73 4.39-1.49.87.2 1.79.31 2.8.31 5.056 0 9.158-3.31 9.158-7.397s-4.102-7.68-9.158-7.68z"
            />
        </svg>
    `,

    repost: `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M4 6h11l-2-2 1.4-1.4L20.8 9l-6.4 6.4L13 14l2-2H6v5h3v2H4c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2zm16 12H9l2 2-1.4 1.4L3.2 15l6.4-6.4L11 10l-2 2h9v-5h-3V5h3c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2z"
            />
        </svg>
    `,

    like: `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M20.884 13.19c-1.14 1.12-5.84 5.36-8.06 7.36a1.18 1.18 0 0 1-1.62 0c-2.22-2-6.92-6.24-8.06-7.36C.93 11.02 1.13 6.88 3.85 4.52a5.43 5.43 0 0 1 7.15.26l1 1 1-1a5.43 5.43 0 0 1 7.15-.26c2.72 2.36 2.92 6.5.73 8.67z"
            />
        </svg>
    `,

    share: `
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 1 0 15 5c0 .24.04.47.09.7L8.04 9.81A3 3 0 1 0 9 15c0-.24-.04-.47-.09-.7l7.12 4.16c.5.45 1.16.72 1.89.72a3 3 0 1 0 .08-6z"
            />
        </svg>
    `
};


/* ========================================
   Create One Post
   ======================================== */

function createPostElement(post) {

    const article =
        document.createElement("article");

    article.className =
        "feed-card";

    article.dataset.postId =
        post.id;

    article.dataset.postType =
        post.type || "tweet";


    const likes =
        typeof post.getLikes === "function"
            ? post.getLikes()
            : Number(post.likes) || 0;


    const author =
        escapeHtml(post.author);


    const handle =
        escapeHtml(
            post.handle ||
            `@user${post.id}`
        );


    const content =
        escapeHtml(post.content);


    const avatar =
        escapeHtml(
            post.avatar ||
            "assets/images/profile-placeholder.png"
        );


    /* ========================================
       Image
       ======================================== */

 const imageMarkup =
    post.image
        ? `
            <div class="feed-card-media">

                <div class="image-loading">
                    <div class="image-spinner"></div>
                </div>

                <img
                    class="lazy-image"
                    src=""
                    data-src="${escapeHtml(post.image)}"
                    data-fallback="${escapeHtml(
                        post.fallbackImage || ""
                    )}"
                    alt="${content}"
                >

            </div>
        `
        : "";


    /* ========================================
       Post HTML
       ======================================== */

    article.innerHTML = `

        <header class="feed-card-header">

            <div class="feed-author">

                <img
                    class="feed-avatar"
                    src="${avatar}"
                    alt="${author} profile picture"
                >

                <div class="feed-author-info">

                    <div class="feed-author-name">
                        ${author}
                    </div>

                    <div class="feed-author-handle">
                        ${handle}
                    </div>

                </div>

            </div>

            <button
                type="button"
                class="feed-menu-button"
                aria-label="More options"
            >
                ···
            </button>

        </header>


        <div class="feed-card-body">

            <p class="feed-post-content">
                ${content}
            </p>

            ${imageMarkup}

        </div>


        <footer
            class="feed-card-actions"
            aria-label="Post actions"
        >

            <button
                type="button"
                class="feed-action-button"
                data-action="reply"
                aria-label="Reply"
            >
                ${icons.reply}

                <span>
                    ${post.replies || 0}
                </span>
            </button>


            <button
                type="button"
                class="feed-action-button"
                data-action="repost"
                aria-label="Repost"
            >
                ${icons.repost}

                <span>
                    ${post.reposts || 0}
                </span>
            </button>


            <button
                type="button"
                class="feed-action-button like-action"
                data-action="like"
                aria-label="Like"
                aria-pressed="false"
            >
                ${icons.like}

                <span>
                    ${likes}
                </span>
            </button>


            <button
                type="button"
                class="feed-action-button"
                data-action="share"
                aria-label="Share"
            >
                ${icons.share}
            </button>

        </footer>
    `;


    return article;
}


/* ========================================
   Render Multiple Posts
   ======================================== */

function renderPosts(
    posts,
    container
) {

    if (!container) {
        return;
    }


    const fragment =
        document.createDocumentFragment();


    posts.forEach((post) => {

        fragment.appendChild(
            createPostElement(post)
        );

    });


    container.appendChild(
        fragment
    );
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