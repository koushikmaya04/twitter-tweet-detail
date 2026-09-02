import { Tweet, Comment, Retweet } from "../models/post.js";
import { filterByFollowing, sortByRecency, dedupe, pipe } from "../feed/pipeline.js";
import { promiseAllCustom, observeLazyImages } from "../images/image-queue.js";
import { EventEmitter } from "../notifications/event-emitter.js";

const $ = (selector) => document.querySelector(selector);

function write(selector, message) {
  const element = $(selector);
  if (element) element.textContent = message;
  console.log(message);
}

/* 01. OOP */
$("#run-oop")?.addEventListener("click", () => {
  const tweet = new Tweet(1, "Koushik", "Learning JavaScript", 10);
  const comment = new Comment(2, "Alex", "Nice implementation", 3);
  const retweet = new Retweet(3, "Sam", "Sharing this post", 5);
  tweet.like();
  tweet.like();

  write("#oop-output", [
    `Tweet inherits from Post: ${tweet instanceof Tweet && Object.getPrototypeOf(Tweet.prototype).constructor.name === "Post"}`,
    `Tweet type: ${tweet.type}`,
    `Comment type: ${comment.type}`,
    `Retweet type: ${retweet.type}`,
    `Tweet likes after two like(): ${tweet.getLikes()}`,
    `Direct likeCount access: ${typeof tweet.likeCount === "undefined"}`,
    "",
    "The like counter is hidden inside the Post closure.",
    "Tweet, Comment and Retweet inherit Post's behavior."
  ].join("\n"));
});

/* 02. Functional pipeline */
$("#run-pipeline")?.addEventListener("click", () => {
  const posts = [
    { id: 2, author: "Alex", content: "Post B" },
    { id: 5, author: "Koushik", content: "Post E" },
    { id: 5, author: "Koushik", content: "Duplicate E" },
    { id: 9, author: "Sam", content: "Post I" },
    { id: 7, author: "Koushik", content: "Post G" }
  ];
  const following = ["Koushik", "Alex"];

  const feedPipeline = pipe(
    (items) => filterByFollowing(items, following),
    sortByRecency,
    dedupe
  );
  const result = feedPipeline(posts);

  write("#pipeline-output", [
    `Input: ${posts.length} posts`,
    `Following: ${following.join(", ")}`,
    "",
    "After filterByFollowing + sortByRecency + dedupe:",
    ...result.map((post) => `${post.id} | ${post.author} | ${post.content}`),
    "",
    "No input array is mutated by the pipeline."
  ].join("\n"));
});

/* 03. Lazy image queue */
$("#run-image-queue")?.addEventListener("click", () => {
  const container = $("#image-demo-list");
  if (!container) return;
  observeLazyImages(container);
  write("#image-output", [
    "IntersectionObserver activated.",
    "Images are queued when they approach the viewport.",
    "Maximum concurrent image loads: 3.",
    "",
    "Scroll the page and watch the Console for queue activity."
  ].join("\n"));
});

/* 04. Custom Promise.all */
function createTask(name, delay) {
  return () => new Promise((resolve) => {
    console.log(`${name} started`);
    setTimeout(() => {
      console.log(`${name} finished`);
      resolve(name);
    }, delay);
  });
}

$("#run-promise")?.addEventListener("click", async () => {
  const start = performance.now();
  const results = await promiseAllCustom([
    createTask("Task A", 900),
    createTask("Task B", 400),
    createTask("Task C", 650)
  ]);
  const elapsed = Math.round(performance.now() - start);

  write("#promise-output", [
    "promiseAllCustom() completed.",
    "",
    `Result order: ${results.join(" → ")}`,
    `Approximate elapsed time: ${elapsed}ms`,
    "",
    "Tasks finish at different times, but results keep input order."
  ].join("\n"));
});

/* 05. IntersectionObserver */
let observerStarted = false;

$("#run-observer")?.addEventListener("click", () => {
  const target = $("#observer-target");
  if (!target) return;

  if (observerStarted) {
    write("#observer-output", "Observer is already active. Scroll to the target.");
    return;
  }

  observerStarted = true;

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (!entry.isIntersecting) return;

    target.classList.add("is-visible");
    write("#observer-output", [
      "IntersectionObserver fired.",
      "Target entered the viewport.",
      `intersectionRatio: ${entry.intersectionRatio.toFixed(2)}`,
      "",
      "This is the same browser API used by infinite scroll."
    ].join("\n"));
    observer.unobserve(target);
  }, {
    root: null,
    rootMargin: "0px",
    threshold: 0
  });

  observer.observe(target);
  write("#observer-output", "Observer active. Scroll until the target enters the viewport.");
});

/* 06. EventEmitter */
$("#run-events")?.addEventListener("click", () => {
  const emitter = new EventEmitter();
  const logs = [];

  const likeListener = (data) => {
    logs.push(`LIKE listener received: ${data.name} liked post #${data.postId}`);
  };
  const commentListener = (data) => {
    logs.push(`COMMENT listener received: ${data.name} commented`);
  };

  emitter.on("like", likeListener);
  emitter.on("comment", commentListener);
  logs.push("Listeners subscribed with on().");

  emitter.emit("like", { name: "Sam", postId: 42 });
  emitter.emit("comment", { name: "Alex", postId: 42 });

  emitter.off("like", likeListener);
  logs.push("LIKE listener removed with off().");

  emitter.emit("like", { name: "John", postId: 42 });
  logs.push("Final LIKE event produces no output because its listener was removed.");

  write("#event-output", logs.join("\n"));
});

console.log("JavaScript Lab loaded.");
