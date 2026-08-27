// ========================================
// Lazy Image Loading Queue
// ========================================


// Load one image
function loadImage(image) {
    return new Promise((resolve, reject) => {
        const imageUrl = image.dataset.src;

        // Check whether the image has a URL
        if (!imageUrl) {
            reject(new Error("Image URL is missing"));
            return;
        }

        image.classList.add("is-loading");

        const loader = new Image();

        // Image loaded successfully
        loader.onload = () => {
            image.src = imageUrl;

            image.classList.remove("is-loading");
            image.classList.add("is-loaded");

            resolve(image);
        };

        // Image failed
        loader.onerror = () => {
            image.classList.remove("is-loading");
            image.classList.add("is-error");

            reject(
                new Error(`Failed to load image: ${imageUrl}`)
            );
        };

        // Start loading
        loader.src = imageUrl;
    });
}


// ========================================
// Custom Promise.all-style helper
// ========================================

function promiseAllCustom(tasks) {
    return new Promise((resolve, reject) => {
        const results = [];
        let completed = 0;

        // No tasks
        if (tasks.length === 0) {
            resolve(results);
            return;
        }

        tasks.forEach((task, index) => {
            task()
                .then((result) => {
                    results[index] = result;
                    completed++;

                    // All tasks completed
                    if (completed === tasks.length) {
                        resolve(results);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    });
}


// ========================================
// Load images in batches
// Maximum 3 images at a time
// ========================================

async function loadImagesWithLimit(images, limit = 3) {
    for (let i = 0; i < images.length; i += limit) {
        const batch = images.slice(i, i + limit);

        console.log(
            `Loading batch ${Math.floor(i / limit) + 1}:`,
            batch.length,
            "images"
        );

        const tasks = batch.map((image) => {
            return () => loadImage(image);
        });

        try {
            await promiseAllCustom(tasks);

            console.log(
                `Batch ${Math.floor(i / limit) + 1} completed`
            );
        } catch (error) {
            console.error(
                `Batch ${Math.floor(i / limit) + 1} failed:`,
                error
            );
        }
    }
}


// ========================================
// Find lazy images
// ========================================

const lazyImages = [
    ...document.querySelectorAll(".lazy-image")
];


// ========================================
// Start image queue
// ========================================

loadImagesWithLimit(lazyImages, 3);


// ========================================
// Export functions for testing
// ========================================

export {
    loadImage,
    promiseAllCustom,
    loadImagesWithLimit
};