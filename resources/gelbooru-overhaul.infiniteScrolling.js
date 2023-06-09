/**
 * @class Class that manages infinite scroll feature
 */
class InfiniteScrolling {
    /**
     * @callback InfiniteScrollingCallback
     * @param {HTMLImageElement[]} e
     */
    
    /**
     * break applying if hit last page
     * @type {boolean}
     */
    isInfiniteScrollHitLastPage = false;
    
    /**
     * prevent same page appended twice on slow connections
     * @type {boolean}
     */
    isBusy = false;
    
    /**
     * throttled/debounced apply function
     * calls only first time and waits at least 1000ms for next call
     */
    throttledApply = utils.debounceFirst(this.apply, 1000);
    
    /**
     * Stores all the dispatch handlers
     * @private
     * @type {InfiniteScrollingCallback[]}
     */
    dispatchHandlers = [];

    constructor() {
        this.check = this.check.bind(this);
    }

    /**
     * Setup infScrolling with value
     * @public
     * @param {boolean} value 
     */
    setup(value) {
        if (value) document.addEventListener("scroll", this.check);
        else document.removeEventListener("scroll", this.check);
    }
    
    /**
     * Registers an event listener
     * @public
     * @param {InfiniteScrollingCallback} handler 
     * @returns {number} Number of listeners
     */
    addUpdateListener(handler) {
        return this.dispatchHandlers.push(handler);
    }
    
    /**
     * Infinite scroll event listener
     * @private
     */
    check() {
        if (this.isInfiniteScrollHitLastPage) return;

        const threshold = Number(context.configManager.findValueByKey("infiniteScroll.threshold"));

        if (!this.isBusy && document.scrollingElement.scrollTop + document.scrollingElement.clientHeight >= document.scrollingElement.scrollHeight - threshold) {
            this.throttledApply();
        }
    }
    
    /**
     * Main function
     * @private
     */
    apply() {
        if (this.isInfiniteScrollHitLastPage) return;

        this.isBusy = true;

        // build next page URL
        let params = new URLSearchParams(document.URL.split('?')[1]);
        params.has("pid") ? params.set("pid", String(Number(params.get("pid")) + 42)) : params.set("pid", String(42));
        let nextPage = "https://" + window.location.host + document.location.pathname + "?" + params;

        utils.debugLog(`InfScrolling to pid ${params.get("pid")}`);

        // using RepeatFetchQueue is not necessary because we trying to apply infScroll every 1000ms anyway
        fetch(nextPage)
            .then(response => {
                if (!response.ok) {
                    utils.debugLog("Failed to InfScroll", response);
                    return;
                }
                return response.text();
            })
            .then(text => {
                // parse next page as DOM object
                let parser = new DOMParser();
                let htmlDocument = parser.parseFromString(text, "text/html");

                let newThumbContainer = htmlDocument.querySelector(".thumbnail-container");
                let oldThumbContainer = document.querySelector(".thumbnail-container");

                // check if there's a new images
                if (!newThumbContainer || !newThumbContainer.childElementCount) {
                    utils.debugLog("InfScrolling hit last page");
                    this.isInfiniteScrollHitLastPage = true;
                    return;
                }

                // append new images to the current page
                let newThumbImgs = [];
                Object.values(newThumbContainer.children).forEach(t => {
                    oldThumbContainer.appendChild(t);
                    newThumbImgs.push(t.children[0].children[0]);
                });

                // notify handlers for the new images
                this.dispatchHandlers.map(h => h(newThumbImgs));

                // update tha pagination element
                let newPaginator = htmlDocument.querySelector(".pagination");
                let oldPaginator = document.querySelector(".pagination:not(.top-pagination)");
                oldPaginator.replaceWith(newPaginator);

                let oldTopPaginator = document.querySelector(".top-pagination");
                if (oldTopPaginator) {
                    /** @type {HTMLElement} */
                    let newTopPaginator = newPaginator.cloneNode(true);
                    newTopPaginator.classList.add("top-pagination");
                    oldTopPaginator.replaceWith(newTopPaginator);
                }

                // push history state and update page title
                window.history.pushState(nextPage, htmlDocument.title, nextPage);
                history.scrollRestoration = 'manual';
                document.title = htmlDocument.title;

                this.isBusy = false;
            });
    }
}
