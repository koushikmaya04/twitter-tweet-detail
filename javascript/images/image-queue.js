/* ========================================
   Lazy Image Loading Queue
   Maximum 3 concurrent loads
   ======================================== */

const MAX_CONCURRENT_IMAGES = 3;

let activeLoads = 0;
const imageQueue = [];
let queueRunning = false;
let lazyImageObserver = null;

/* ========================================
   Load One Image
   ======================================== */

function loadImage(image) {
    return new Promise((resolve, reject) => {
        const imageUrl = image.dataset.src;

        if (!imageUrl) {
            reject(new Error("Image URL is missing"));
            return;
        }

        image.classList.add("is-loading");

        const loader = new Image();

        loader.onload = () => {
            image.src = imageUrl;
            image.removeAttribute("data-src");
            image.classList.remove("is-loading");
            image.classList.add("is-loaded");
            resolve(image);
        };

        loader.onerror = () => {
            image.classList.remove("is-loading");
            image.classList.add("is-error");
            reject(new Error(`Failed to load image: ${imageUrl}`));
        };

        loader.src = imageUrl;
    });
}

/* ========================================
   Custom Promise.all-style helper
   ======================================== */

function promiseAllCustom(tasks) {
    return new Promise((resolve, reject) => {
        const results = [];
        let completed = 0;

        if (tasks.length === 0) {
            resolve(results);
            return;
        }

        tasks.forEach((task, index) => {
            Promise.resolve()
                .then(task)
                .then((result) => {
                    results[index] = result;
                    completed++;

                    if (completed === tasks.length) {
                        resolve(results);
                    }
                })
                .catch(reject);
        });
    });
}

/* ========================================
   Queue
   ======================================== */

function enqueueImage(image) {
    if (
        !image ||
        !image.dataset.src ||
        image.dataset.queued === "true" ||
        image.classList.contains("is-loaded")
    ) {
        return;
    }

    image.dataset.queued = "true";
    imageQueue.push(image);

    console.log(
        `[Image Queue] queued: ${image.dataset.src}`
    );

    processImageQueue();
}

async function processImageQueue() {
    if (queueRunning) {
        return;
    }

    queueRunning = true;

    try {
        while (imageQueue.length > 0) {
            const availableSlots =
                MAX_CONCURRENT_IMAGES - activeLoads;

            if (availableSlots <= 0) {
                await new Promise((resolve) => {
                    setTimeout(resolve, 50);
                });
                continue;
            }

            const batch = imageQueue.splice(
                0,
                availableSlots
            );

            activeLoads += batch.length;

            console.log(
                `[Image Queue] starting ${batch.length} image(s); active=${activeLoads}`
            );

            const tasks = batch.map((image) => {
                return () => loadImage(image)
                    .then((result) => {
                        console.log(
                            `[Image Queue] loaded: ${result.src}`
                        );
                        return result;
                    })
                    .catch((error) => {
                        console.error(
                            "[Image Queue] failed:",
                            error
                        );
                        return null;
                    });
            });

            await promiseAllCustom(tasks);

            activeLoads -= batch.length;

            console.log(
                `[Image Queue] batch complete; active=${activeLoads}`
            );
        }
    } finally {
        queueRunning = false;
    }
}

/* ========================================
   IntersectionObserver for Images
   ======================================== */

function observeLazyImages(container = document) {
    if (!("IntersectionObserver" in window)) {
        const images = [
            ...container.querySelectorAll(".lazy-image[data-src]")
        ];

        images.forEach(enqueueImage);
        return;
    }

    if (!lazyImageObserver) {
        lazyImageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    enqueueImage(entry.target);
                    lazyImageObserver.unobserve(entry.target);
                });
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0
            }
        );
    }

    const images = [
        ...container.querySelectorAll(".lazy-image[data-src]")
    ];

    images.forEach((image) => {
        lazyImageObserver.observe(image);
    });
}

/* ========================================
   Existing-page initialization
   ======================================== */

if (document.querySelector(".lazy-image")) {
    observeLazyImages(document);
}

/* ========================================
   Exports
   ======================================== */

export {
    MAX_CONCURRENT_IMAGES,
    loadImage,
    promiseAllCustom,
    observeLazyImages
};
