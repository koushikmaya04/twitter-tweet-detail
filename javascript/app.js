import debounce from "./search/debounce.js";
import "./likes/likes.js";
import {
    Tweet,
    Comment,
    Retweet
} from "./models/post.js";



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
