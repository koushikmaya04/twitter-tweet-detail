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
            }
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