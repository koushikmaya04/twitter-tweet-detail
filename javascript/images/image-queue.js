/* ========================================
   Lazy Image Loading Queue

   Maximum:
   3 images loading simultaneously
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

        const imageUrl =
            image.dataset.src;

        const fallbackUrl =
            image.dataset.fallback;

        if (!imageUrl) {

            reject(
                new Error(
                    "Image URL is missing"
                )
            );

            return;
        }

        image.classList.add(
            "is-loading"
        );

        const loader = new Image();

        let usingFallback = false;

        /* ========================================
           Successful Load
           ======================================== */

        loader.onload = () => {

            image.src = loader.src;

            image.removeAttribute(
                "data-src"
            );

            image.removeAttribute(
                "data-fallback"
            );

            image.dataset.queued = "false";

            image.classList.remove(
                "is-loading"
            );

            image.classList.remove(
                "is-error"
            );

            image.classList.add(
                "is-loaded"
            );

            resolve(image);
        };

        /* ========================================
           Failed Load
           ======================================== */

        loader.onerror = () => {

            /*
             * First failure:
             * try fallback image.
             */
            if (
                !usingFallback &&
                fallbackUrl
            ) {

                usingFallback = true;

                console.warn(
                    "[Image Queue] Primary image failed. Using fallback."
                );

                loader.src =
                    fallbackUrl;

                return;
            }

            /* ========================================
               Both URLs failed
               ======================================== */

            image.classList.remove(
                "is-loading"
            );

            image.classList.add(
                "is-error"
            );

            image.dataset.queued = "false";

            reject(
                new Error(
                    `Failed to load image: ${imageUrl}`
                )
            );
        };

        /*
         * Start actual browser image request.
         */
        loader.src = imageUrl;
    });
}


/* ========================================
   Custom Promise.all-style Function
   ======================================== */

function promiseAllCustom(tasks) {

    return new Promise(
        (resolve, reject) => {

            const results = [];

            let completed = 0;

            if (tasks.length === 0) {

                resolve(results);

                return;
            }

            tasks.forEach(
                (task, index) => {

                    Promise.resolve()
                        .then(task)
                        .then((result) => {

                            results[index] =
                                result;

                            completed++;

                            if (
                                completed ===
                                tasks.length
                            ) {

                                resolve(
                                    results
                                );
                            }
                        })
                        .catch(reject);
                }
            );
        }
    );
}


/* ========================================
   Add Image To Queue
   ======================================== */

function enqueueImage(image) {

    if (!image) {
        return;
    }

    if (!image.dataset.src) {
        return;
    }

    if (
        image.dataset.queued === "true"
    ) {
        return;
    }

    if (
        image.classList.contains(
            "is-loaded"
        )
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


/* ========================================
   Process Queue
   ======================================== */

async function processImageQueue() {

    if (queueRunning) {
        return;
    }

    queueRunning = true;

    try {

        while (
            imageQueue.length > 0
        ) {

            const availableSlots =
                MAX_CONCURRENT_IMAGES -
                activeLoads;

            if (
                availableSlots <= 0
            ) {

                await new Promise(
                    (resolve) => {

                        setTimeout(
                            resolve,
                            50
                        );
                    }
                );

                continue;
            }

            /*
             * Never take more than 3 images.
             */
            const batch =
                imageQueue.splice(
                    0,
                    availableSlots
                );

            activeLoads +=
                batch.length;

            console.log(
                `[Image Queue] START batch=${batch.length} active=${activeLoads}`
            );

            /*
             * Convert each image into a task.
             */
            const tasks =
                batch.map(
                    (image) => {

                        return () => {

                            console.log(
                                `[Image Queue] loading ${image.dataset.src}`
                            );

                            return loadImage(
                                image
                            );
                        };
                    }
                );

            /*
             * Our own Promise.all implementation
             * waits for the whole batch.
             */
            await promiseAllCustom(
                tasks.map(
                    (task) => {

                        return () =>
                            task()
                                .catch(
                                    (error) => {

                                        console.error(
                                            "[Image Queue] failed:",
                                            error
                                        );

                                        return null;
                                    }
                                );
                    }
                )
            );

            activeLoads -=
                batch.length;

            console.log(
                `[Image Queue] END batch active=${activeLoads}`
            );
        }

    } finally {

        queueRunning = false;
    }
}


/* ========================================
   IntersectionObserver
   ======================================== */

function observeLazyImages(
    container = document
) {

    /*
     * Browser fallback.
     */
    if (
        !(
            "IntersectionObserver"
            in window
        )
    ) {

        const images =
            [
                ...container.querySelectorAll(
                    ".lazy-image[data-src]"
                )
            ];

        images.forEach(
            enqueueImage
        );

        return;
    }

    /* ========================================
       Create Observer Once
       ======================================== */

    if (!lazyImageObserver) {

        lazyImageObserver =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }

                            enqueueImage(
                                entry.target
                            );

                            /*
                             * Stop watching after
                             * putting it in the queue.
                             */
                            lazyImageObserver.unobserve(
                                entry.target
                            );
                        }
                    );
                },
                {
                    /*
                     * null = viewport
                     */
                    root: null,

                    /*
                     * Start loading 200px
                     * before the image enters.
                     */
                    rootMargin: "200px",

                    /*
                     * Trigger immediately
                     * when entering.
                     */
                    threshold: 0
                }
            );
    }

    /* ========================================
       Find New Lazy Images
       ======================================== */

    const images =
        [
            ...container.querySelectorAll(
                ".lazy-image[data-src]"
            )
        ];

    images.forEach(
        (image) => {

            if (
                image.dataset.queued !==
                "true"
            ) {

                lazyImageObserver.observe(
                    image
                );
            }
        }
    );
}


/* ========================================
   Existing Page Initialization
   ======================================== */

if (
    document.querySelector(
        ".lazy-image"
    )
) {

    observeLazyImages(
        document
    );
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
