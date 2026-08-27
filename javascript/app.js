import debounce from "./search/debounce.js";
import "./likes/likes.js";
import {
    Tweet,
    Comment,
    Retweet
} from "./models/post.js";
import {
    filterByFollowing,
    sortByRecency,
    dedupe,
    pipe
} from "./feed/pipeline.js";
import {
    loadImagesWithLimit
} from "./images/image-queue.js";
import "./feed/infinite-scroll.js";
import "./notifications/event-emitter.js";
// ================================
// Debounce search
// ================================

const searchInput = document.querySelector("#search-input");

function handleSearch(value) {
    console.log("Searching for:", value);
}

const debouncedSearch = debounce(handleSearch, 500);

searchInput.addEventListener("input", (event) => {
    debouncedSearch(event.target.value);
}); 
 
// ================================
// Post Model
// ================================
  
const tweet = new Tweet(
    1,
    "Koushik Maya",
    "Learning JavaScript classes",
    10
);

console.log("Tweet:", tweet);
console.log("Tweet likes:", tweet.likes);

tweet.like();

console.log("After like:", tweet.likes);

tweet.unlike();

console.log("After unlike:", tweet.likes);


const comment = new Comment(
    2,
    "Alex Developer",
    "Great explanation!",
    3
);

console.log("Comment:", comment);
console.log("Comment type:", comment.type);
console.log("Comment likes:", comment.likes);


const retweet = new Retweet(
    3,
    "Sam",
    tweet,
    5
);

console.log("Retweet:", retweet);
console.log("Retweet type:", retweet.type);
console.log("Retweet content:", retweet.content);
console.log("Retweet likes:", retweet.likes);

// ================================
// feed/pipeline
// ================================
const posts = [
    {
        id: 1,
        author: "Koushik Maya",
        createdAt: "2026-08-27T10:00:00",
        content: "Post 1"
    },
    {
        id: 2,
        author: "Alex Developer",
        createdAt: "2026-08-27T11:00:00",
        content: "Post 2"
    },
    {
        id: 2,
        author: "Alex Developer",
        createdAt: "2026-08-27T11:00:00",
        content: "Duplicate Post 2"
    }
];

const following = [
    "Koushik Maya",
    "Alex Developer"
];

const filterFollowing = (posts) =>
    filterByFollowing(posts, following);

const feedPipeline = pipe(
    filterFollowing,
    sortByRecency,
    dedupe
);

const feed = feedPipeline(posts);

console.log("Filtered feed:", feed);


console.log(
    "Filter:",
    filterByFollowing(posts, following)
);

console.log(
    "Sort:",
    sortByRecency(posts)
);

console.log(
    "Dedupe:",
    dedupe(posts)
);

console.log(
    "Pipeline:",
    feed
);
console.log("Original posts:", posts);
console.log("Pipeline result:", feed);
console.log("Same array:", posts === feed);

// ========================================
// Lazy Image Queue Test
// ========================================

const testImages = Array.from(
    { length: 6 },
    (_, index) => {
        const image = document.createElement("img");
        
        image.className = "lazy-image";

        image.dataset.src =
            `https://picsum.photos/300/200?random=${index + 1}`;

        image.alt = `Test image ${index + 1}`;

        return image;
    }
);

document.body.append(...testImages);

loadImagesWithLimit(testImages, 3);