import { renderPosts } from "../ui/render.js";
import { sortByRecency, dedupe } from "./pipeline.js";
import { Tweet } from "../models/post.js";
import { observeLazyImages } from "../images/image-queue.js";

/* ========================================
   DOM Elements
   ======================================== */

const feedList = document.querySelector("#feed-list");
const feedLoading = document.querySelector("#feed-loading");
const feedError = document.querySelector("#feed-error");
const feedRetry = document.querySelector("#feed-retry");
const feedSentinel = document.querySelector("#feed-sentinel");

if (!feedList || !feedSentinel) {
    console.warn(
        "Infinite scroll: required feed elements are missing."
    );
} else {

    /* ========================================
       Feed State
       ======================================== */

    if (!window.feedPosts) {
        window.feedPosts = [];
    }

    let currentPage = 1;

    const postsPerPage = 10;

    let isLoading = false;
    let hasMorePosts = true;

    /* ========================================
       JSONPlaceholder Photos API
       ======================================== */

    async function fetchPosts(page) {

        const start =
            (page - 1) * postsPerPage;

        const apiUrl =
            `https://jsonplaceholder.typicode.com/photos` +
            `?_start=${start}&_limit=${postsPerPage}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        return response.json();
    }

    /* ========================================
       Convert Photo API → Tweet Model
       ======================================== */

    function createTweetModels(photos) {

        return photos.map((photo) => {

            const tweet = new Tweet(
                photo.id,
                `User ${photo.albumId}`,
                photo.title,
                0
            );

            tweet.handle =
                `@user${photo.albumId}`;

            /*
             * JSONPlaceholder provides thumbnailUrl.
             * This is used instead of photo.url because
             * the larger placeholder URL can fail.
             */
            tweet.image =
                photo.thumbnailUrl;

            /*
             * Reliable fallback image.
             * It still uses the API photo ID so every
             * tweet gets a different image.
             */
            tweet.fallbackImage =
                `https://picsum.photos/id/${photo.id}/600/400`;

            tweet.replies = 0;
            tweet.reposts = 0;

            return tweet;
        });
    }

    /* ========================================
       Loading State
       ======================================== */

    function showLoading() {

        if (feedLoading) {
            feedLoading.hidden = false;
        }

        feedList.setAttribute(
            "aria-busy",
            "true"
        );
    }

    function hideLoading() {

        if (feedLoading) {
            feedLoading.hidden = true;
        }

        feedList.setAttribute(
            "aria-busy",
            "false"
        );
    }

    /* ========================================
       Error State
       ======================================== */

    function showError() {

        if (feedError) {
            feedError.hidden = false;
        }
    }

    function hideError() {

        if (feedError) {
            feedError.hidden = true;
        }
    }

    /* ========================================
       Load Next Page
       ======================================== */

    async function loadNextPage() {

        /*
         * Prevent duplicate requests.
         *
         * This is important because IntersectionObserver
         * can fire more than once.
         */
        if (isLoading || !hasMorePosts) {
            return;
        }

        isLoading = true;

        hideError();
        showLoading();

        try {

            console.log(
                `[Infinite Scroll] Loading page ${currentPage}`
            );

            const photos =
                await fetchPosts(currentPage);

            if (photos.length === 0) {

                hasMorePosts = false;

                console.log(
                    "[Infinite Scroll] No more posts"
                );

                return;
            }

            /* ========================================
               API → Tweet Models
               ======================================== */

            const tweetPosts =
                createTweetModels(photos);

            /* ========================================
               Functional Pipeline
               ======================================== */

            const processedPosts =
                dedupe(
                    sortByRecency(tweetPosts)
                );

            /* ========================================
               Global Feed State
               ======================================== */

            window.feedPosts =
                dedupe([
                    ...window.feedPosts,
                    ...processedPosts
                ]);

            /* ========================================
               Render
               ======================================== */

            renderPosts(
                processedPosts,
                feedList
            );

            /* ========================================
               Start Lazy Image Observation
               ======================================== */

            observeLazyImages(feedList);

            /* ========================================
               Pagination
               ======================================== */

            if (photos.length < postsPerPage) {

                hasMorePosts = false;

                console.log(
                    "[Infinite Scroll] Last page reached"
                );

            } else {

                currentPage++;

            }

        } catch (error) {

            console.error(
                "[Infinite Scroll] Failed:",
                error
            );

            showError();

        } finally {

            isLoading = false;

            hideLoading();
        }
    }

    /* ========================================
       Infinite Scroll Observer
       ========================================

       root:
       null = browser viewport

       rootMargin:
       200px = start loading before sentinel
       actually reaches the viewport

       threshold:
       0 = trigger when sentinel enters
       the observation area
       ======================================== */

    const observer =
        new IntersectionObserver(
            (entries) => {

                const entry = entries[0];

                if (
                    entry &&
                    entry.isIntersecting
                ) {

                    loadNextPage();
                }
            },
            {
                root: null,
                rootMargin: "200px",
                threshold: 0
            }
        );

    /* ========================================
       Retry
       ======================================== */

    if (feedRetry) {

        feedRetry.addEventListener(
            "click",
            loadNextPage
        );
    }

    /* ========================================
       Start
       ======================================== */

    observer.observe(feedSentinel);

    loadNextPage();
}
