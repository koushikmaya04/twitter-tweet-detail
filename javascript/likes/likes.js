import { notificationEmitter } from "../notifications/event-emitter.js";

const likeButton = document.querySelector(".like-button");
const likeCount = document.querySelector("#like-count");

let likeQueue = [];
let isProcessing = false;


// ========================================
// Fake Like Request
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

    const action = likeQueue.shift();

    try {
        await fakeLikeRequest(action.shouldFail);

        console.log(
            `${action.type} request succeeded`
        );

        if (action.type === "like") {
            notificationEmitter.emit("like", {
                name: "Sam"
            });
        }

    } catch (error) {
        console.error(
            `${action.type} request failed:`,
            error
        );

        const currentCount =
            Number(likeCount.textContent);

        // Rollback optimistic update
        if (action.type === "like") {
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

        // Optimistic Unlike
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

        // Optimistic Like
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


// ========================================
// Event Listener
// ========================================

if (likeButton && likeCount) {
    likeButton.addEventListener(
        "click",
        handleLike
    );
}
