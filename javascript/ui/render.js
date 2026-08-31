export function renderPosts(posts, container) {

    if (!container) {
        return;
    }

    posts.forEach((post) => {

        const article =
            document.createElement("article");

        article.className = "feed-card";

        article.dataset.postId = post.id;

        article.innerHTML = `
            <h3>${post.author}</h3>

            <p>${post.content}</p>

            <div class="feed-card-actions">
                <span>
                    ❤️ ${post.getLikes
                        ? post.getLikes()
                        : post.likes || 0}
                </span>
            </div>
        `;

        container.appendChild(article);
    });
}
