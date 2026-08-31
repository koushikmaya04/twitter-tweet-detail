import debounce from "./search/debounce.js";

import "./likes/likes.js";
import "./feed/infinite-scroll.js";
import {
    notificationEmitter
} from "./notifications/event-emitter.js";
import "./images/image-queue.js";

import {
    Tweet,
    Comment,
    Retweet
} from "./models/post.js";

import {
    pipe,
    dedupe
} from "./feed/pipeline.js";

import { renderPosts } from "./ui/render.js";


// ========================================
// Feed Storage
// ========================================

if (!window.feedPosts) {
    window.feedPosts = [];
}


// ========================================
// Search
// ========================================

const searchForm =
    document.querySelector("#search-form");

const searchInput =
    document.querySelector("#search-input");

const searchResults =
    document.querySelector("#search-results");


function handleSearch(value) {

    const query =
        value.trim().toLowerCase();

    if (!searchResults) {
        return;
    }

    searchResults.innerHTML = "";

    if (!query) {
        return;
    }

    const results =
        window.feedPosts.filter((post) => {

            const content =
                post.content ||
                post.body ||
                "";

            const author =
                post.author ||
                "";

            const title =
                post.title ||
                "";

            return (
                content
                    .toLowerCase()
                    .includes(query) ||

                author
                    .toLowerCase()
                    .includes(query) ||

                title
                    .toLowerCase()
                    .includes(query)
            );
        });

    if (results.length === 0) {

        searchResults.textContent =
            "No posts found.";

        return;
    }

    renderPosts(
        results,
        searchResults
    );
}


const debouncedSearch =
    debounce(handleSearch, 500);


if (searchInput) {

    searchInput.addEventListener(
        "input",
        (event) => {

            debouncedSearch(
                event.target.value
            );
        }
    );
}


if (searchForm) {

    searchForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            handleSearch(
                searchInput.value
            );
        }
    );
}


// ========================================
// Follow
// ========================================

const followButton =
    document.querySelector(".follow-button");


if (followButton) {

    followButton.addEventListener(
        "click",
        () => {

            const isFollowing =
                followButton.getAttribute(
                    "aria-pressed"
                ) === "true";

            const newState =
                !isFollowing;

            followButton.setAttribute(
                "aria-pressed",
                String(newState)
            );

            followButton.textContent =
                newState
                    ? "Following"
                    : "Follow";

            if (newState) {

                notificationEmitter.emit(
                    "new-follower",
                    {
                        name: "You"
                    }
                );
            }
        }
    );
}


// ========================================
// Reply
// ========================================

const replyForm =
    document.querySelector(".reply-form");

const replyInput =
    document.querySelector("#reply-input");

const characterCount =
    document.querySelector("#character-count");


if (replyInput && characterCount) {

    replyInput.addEventListener(
        "input",
        () => {

            characterCount.textContent =
                `${replyInput.value.length}/280`;
        }
    );
}


if (replyForm) {

    replyForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            const content =
                replyInput.value.trim();

            if (!content) {
                return;
            }

            const comment =
                new Comment(
                    `comment-${Date.now()}`,
                    "You",
                    content,
                    0
                );

            console.log(
                "Created comment:",
                comment
            );

            notificationEmitter.emit(
                "comment",
                {
                    name: "You"
                }
            );

            replyInput.value = "";

            if (characterCount) {
                characterCount.textContent =
                    "0/280";
            }
        }
    );
}


// ========================================
// Repost
// ========================================

const repostButton =
    document.querySelector(
        '[data-action="repost"]'
    );


if (repostButton) {

    repostButton.addEventListener(
        "click",
        () => {

            const repost =
                new Retweet(
                    `retweet-${Date.now()}`,
                    "You",
                    "You reposted this post.",
                    0
                );

            console.log(
                "Created repost:",
                repost
            );
        }
    );
}


// ========================================
// Example Tweet
// ========================================

const exampleTweet =
    new Tweet(
        "tweet-1",
        "Alex Developer",
        "Learning JavaScript!",
        10
    );

console.log(
    "Tweet model:",
    exampleTweet
);


// ========================================
// Pipeline Example
// ========================================

const processPosts =
    pipe(
        dedupe
    );

console.log(
    "Pipeline ready:",
    processPosts(window.feedPosts)
);
