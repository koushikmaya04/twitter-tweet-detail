// ========================================
// Filter By Following
// ========================================

function filterByFollowing(posts, following) {
    return posts.filter(
        (post) => following.includes(post.author)
    );
}


// ========================================
// Sort By Recency
// ========================================

function sortByRecency(posts) {
    return [...posts].sort(
        (a, b) => Number(b.id) - Number(a.id)
    );
}


// ========================================
// Remove Duplicates
// ========================================

function dedupe(posts) {
    return posts.reduce(
        (uniquePosts, post) => {

            if (
                !uniquePosts.some(
                    (item) => item.id === post.id
                )
            ) {
                uniquePosts.push(post);
            }

            return uniquePosts;
        },
        []
    );
}


// ========================================
// Function Pipeline
// ========================================

function pipe(...functions) {
    return function (initialValue) {
        return functions.reduce(
            (value, fn) => fn(value),
            initialValue
        );
    };
}


export {
    filterByFollowing,
    sortByRecency,
    dedupe,
    pipe
};
