class Post {
    constructor(id, author, content, likes = 0) {
        this.id = id;
        this.author = author;
        this.content = content;

        // Encapsulated like counter using a closure
        let likeCount = likes;

        this.like = function () {
            likeCount++;
        };

        this.unlike = function () {
            if (likeCount > 0) {
                likeCount--;
            }
        };

        // Getter for controlled read access
        Object.defineProperty(this, "likes", {
            get() {
                return likeCount;
            }
        });
    }
}


class Tweet extends Post {
    constructor(id, author, content, likes = 0) {
        super(id, author, content, likes);

        this.type = "tweet";
    }
}


class Comment extends Post {
    constructor(id, author, content, likes = 0) {
        super(id, author, content, likes);

        this.type = "comment";
    }
}


class Retweet extends Post {
    constructor(id, author, originalPost, likes = 0) {
        super(
            id,
            author,
            `Retweet of: ${originalPost.content}`,
            likes
        );

        this.originalPost = originalPost;
        this.type = "retweet";
    }
}


export {
    Post,
    Tweet,
    Comment,
    Retweet
};