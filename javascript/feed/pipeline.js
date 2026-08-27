function filterByFollowing(posts, following) {
    return posts.filter(post => following.includes(post.author));
}

function sortByRecency(posts) {
    return [...posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
}

function dedupe(posts) {
    return posts.reduce((uniquePosts, post) => {
        if (!uniquePosts.some(item => item.id === post.id)) {
            uniquePosts.push(post);
        }

        return uniquePosts;
    }, []);
}

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