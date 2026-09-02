class Post {
    constructor(id, author, content, likes = 0) {
        this.id = id;
        this.author = author;
        this.content = content;

        let likeCount = likes;

        this.like = function () {
            likeCount++;
        };

        this.unlike = function () {
            if (likeCount > 0) {
                likeCount--;
            }
        };

        this.getLikes = function () {
            return likeCount;
        };
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
    constructor(id, author, content, likes = 0) {
        super(id, author, content, likes);
        this.type = "retweet";
    }
}


export {
    Post,
    Tweet,
    Comment,
    Retweet
};
