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

    let users = [];


    /* ========================================
       Fetch Users
       ======================================== */

    async function fetchUsers() {

        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
        );

        if (!response.ok) {
            throw new Error(
                `Users API error: ${response.status}`
            );
        }

        return response.json();
    }


    /* ========================================
       Fetch Posts
       ======================================== */

    async function fetchPosts(page) {

        const start =
            (page - 1) * postsPerPage;

        const apiUrl =
            `https://jsonplaceholder.typicode.com/photos` +
            `?_start=${start}&_limit=${postsPerPage}`;

        const response =
            await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(
                `Posts API error: ${response.status}`
            );
        }

        return response.json();
    }


    /* ========================================
       Convert API Data → Tweet Models
       ======================================== */

    function createTweetModels(photos) {

        return photos.map((photo, index) => {

            /*
             * Give every post a real different user.
             *
             * We use the Users API instead of
             * photo.albumId because the first many
             * photos have albumId = 1.
             */
            const userIndex =
                ((photo.id - 1) % users.length);

            const user =
                users[userIndex];


            const tweet =
                new Tweet(
                    photo.id,
                    user.name,
                    photo.title,
                    0
                );


            /* ========================================
               User Information
               ======================================== */

            tweet.handle =
                `@${user.username.toLowerCase()}`;

            tweet.avatar =
                `https://i.pravatar.cc/100?img=${user.id}`;


            /* ========================================
               Image API
               ========================================

               Picsum is used as the actual image API.

               Each seed is different, therefore each
               post receives a different image.
            */

            tweet.image =
                `https://picsum.photos/seed/twitter-${photo.id}/600/400`;


            /* ========================================
               Fallback Image
               ======================================== */

            tweet.fallbackImage =
                `https://picsum.photos/seed/fallback-${photo.id}/600/400`;


            tweet.replies =
                Math.floor(Math.random() * 100);

            tweet.reposts =
                Math.floor(Math.random() * 100);


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
         * Prevent duplicate API requests.
         */
        if (
            isLoading ||
            !hasMorePosts
        ) {
            return;
        }

        isLoading = true;

        hideError();
        showLoading();


        try {

            console.log(
                `[Infinite Scroll] Loading page ${currentPage}`
            );


            /* ========================================
               Load Users Once
               ======================================== */

            if (users.length === 0) {

                users =
                    await fetchUsers();

                console.log(
                    `[Users API] Loaded ${users.length} users`
                );
            }


            /* ========================================
               Load Posts
               ======================================== */

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
               Global Feed
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
               Lazy Image Queue
               ======================================== */

            observeLazyImages(
                feedList
            );


            /* ========================================
               Pagination
               ======================================== */

            if (
                photos.length <
                postsPerPage
            ) {

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
       ======================================== */

    const observer =
        new IntersectionObserver(
            (entries) => {

                const entry =
                    entries[0];

                if (
                    entry &&
                    entry.isIntersecting
                ) {

                    loadNextPage();
                }
            },
            {
                /*
                 * Browser viewport.
                 */
                root: null,

                /*
                 * Start loading 200px
                 * before sentinel.
                 */
                rootMargin: "200px",

                /*
                 * Trigger as soon as
                 * sentinel enters.
                 */
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

    observer.observe(
        feedSentinel
    );

    loadNextPage();
}