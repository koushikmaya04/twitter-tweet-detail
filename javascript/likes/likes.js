const likeButton = document.querySelector(".like-button");
const likeCount = document.querySelector("#like-count");

let likeQueue = [];
let isProcessing = false;

function fakeLikeRequest(shouldFail = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error("Like request failed"));
            } else {
                resolve({ success: true });
            }import { notificationEmitter } from "../notifications/event-emitter.js";

const likeButton = document.querySelector(".like-button");
const likeCount = document.querySelector("#like-count");

let likeQueue = [];
let isProcessing = false;


// ========================================
// Fake API request
// ========================================

function fakeLikeRequest(shouldFail = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error("Like request failed"));
            } else {
                resolve({ success: true });
            }
        }, 1000);
    });
}


// ========================================
// Process Like Queue
// ========================================

async function processLikeQueue() {
    if (isProcessing || likeQueue.length === 0) {
        return;
    }

    isProcessing = true;

    const update = likeQueue.shift();

    try {
        await fakeLikeRequest(update.shouldFail);

        console.log(
            `${update.type} request succeeded`
        );

        // Notify only for a successful like
        if (update.type === "like") {
            notificationEmitter.emit("like", {
                name: "You"
            });
        }

    } catch (error) {
        console.error(error);

        // Roll back failed optimistic update
        const currentCount = Number(likeCount.textContent);

        if (update.type === "like") {
            likeCount.textContent =
                Math.max(0, currentCount - 1);

            likeButton.setAttribute(
                "aria-pressed",
                "false"
            );
        } else {
            likeCount.textContent =
                currentCount + 1;

            likeButton.setAttribute(
                "aria-pressed",
                "true"
            );
        }

    } finally {
        isProcessing = false;
        processLikeQueue();
    }
}


// ========================================
// Like / Unlike
// ========================================

function handleLike() {
    const isLiked =
        likeButton.getAttribute("aria-pressed") === "true";

    const currentCount =
        Number(likeCount.textContent);

    if (isLiked) {

        // Optimistic unlike
        likeCount.textContent =
            Math.max(0, currentCount - 1);

        likeButton.setAttribute(
            "aria-pressed",
            "false"
        );

        likeQueue.push({
            type: "unlike",
            shouldFail: false
        });

    } else {

        // Optimistic like
        likeCount.textContent =
            currentCount + 1;

        likeButton.setAttribute(
            "aria-pressed",
            "true"
        );

        likeQueue.push({
            type: "like",
            shouldFail: false
        });
    }

    processLikeQueue();
}


likeButton.addEventListener(
    "click",
    handleLike
);
        }, 1000);
    });
}

async function processLikeQueue() {
    if (isProcessing || likeQueue.length === 0) {
        return;
    }

    isProcessing = true;

    const update = likeQueue.shift();

    console.log("Call stack: processing like");

    try {
        await fakeLikeRequest(update.shouldFail);

        console.log("Microtask: like request succeeded");
    } catch (error) {
        console.log("Microtask: like request failed");

        // Rollback optimistic update
        likeCount.textContent = update.previousCount;
        likeButton.setAttribute("aria-pressed", update.previousState);
    }

    isProcessing = false;

    processLikeQueue();
}

function handleLike() {
    const previousCount = Number(likeCount.textContent);
    const previousState = likeButton.getAttribute("aria-pressed");

    // Optimistic UI update
    likeCount.textContent = previousCount + 1;
    likeButton.setAttribute("aria-pressed", "true");

    console.log("Call stack: optimistic update applied");

    likeQueue.push({
        previousCount,
        previousState,
        shouldFail: false
    });

    console.log("Call stack: update added to queue");

    processLikeQueue();
}

likeButton.addEventListener("click", handleLike);

console.log("Call stack: app started");

Promise.resolve().then(() => {
    console.log("Microtask: Promise callback");
});

setTimeout(() => {
    console.log("Macrotask: setTimeout callback");
}, 0);
