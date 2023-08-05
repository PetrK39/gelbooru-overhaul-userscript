//
//  CSS VARIABLES SECTION
//

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {string} value
 */
function applyCssSidebarWidth(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    utils.debugLog("Applying css variable #goCollapseSidebarWidth");
    utils.setDynamicStyle("goCollapseSidebarWidth", `
        .go-collapse-sidebar {
            --collapsed-width: ${value};
        }
        .go-collapse-sidebar-container-tweak {
            --collapsed-width: ${value};
        }
    `);
}

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {string} value
 */
function applyCssSidebarColor(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    utils.debugLog("Applying css variable #goCollapseSidebarColor");
    utils.setDynamicStyle("goCollapseSidebarColor", `
        .go-collapse-sidebar {
            --collapsed-color: ${value};
        }
    `);
}

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {string} value
 */
function applyCssSidebarOpacity(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    utils.debugLog("Applying css variable #goCollapseSidebarOpacity");
    utils.setDynamicStyle("goCollapseSidebarOpacity", `
        .go-collapse-sidebar {
            --collapsed-opacity: ${value};
        }
    `);
}

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {number} value
 */
function applyCssThumbnailEnlarge(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    utils.debugLog("Applying css variable #goThumbnailEnlarge");
    utils.setDynamicStyle("goThumbnailEnlarge", `
        .go-thumbnail-enlarge {
            --enlarge-scale: ${value};
        }
    `);
}

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {number} value
 */
function applyCssThumbnailResize(value) {
    if (context.pageType != utils.pageTypes.GALLERY) return;

    utils.debugLog("Applying css variable #goThumbnailResize");
    utils.setDynamicStyle("goThumbnailResize", `
        .go-thumbnail-resize {
            --thumb-gallery-size: ${value};
        }
    `);
}

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {number} value
 */
function applyCssMoreLikeThisThumbnailResize(value) {
    if (context.pageType != utils.pageTypes.POST) return;

    utils.debugLog("Applying css variable #goMoreLikeThisThumbnailResize");
    utils.setDynamicStyle("goMoreLikeThisThumbnailResize", `
        .go-thumbnail-resize {
            --thumb-morelikethis-size: ${value};
        }
    `);
}

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {string} value
 */
function applyCssBlacklistMode(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    utils.debugLog("Applying css variable #goBlacklistMode");
    utils.setDynamicStyle("goBlacklistMode", `
        .go-blacklisted {
            --blacklist-visibility: ${value == "Collapse" ? "none" : "block"};
        }
    `);
}

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {string} value
 */
function applyCssBlacklistFilter(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    utils.debugLog("Applying css variable #goBlacklistFilter");
    utils.setDynamicStyle("goBlacklistFilter", `
        .go-blacklisted {
            --blacklist-filter: ${value};
        }
    `);
}

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {string} value
 */
function applyCssBlacklistShowOnHover(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    utils.debugLog("Applying css variable #goBlacklistShowOnHover");
    utils.setDynamicStyle("goBlacklistShowOnHover", `
        .go-blacklisted {
            --blacklist-hoverFilter: ${value ? "unset" : "var(--blacklist-filter)"};
        }
    `);
}

/** 
 * @type {PreferenceUpdateCallback} 
 * @param {boolean} value
 */
function applyCssBlacklistEnlargeOnHover(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    utils.debugLog("Applying css variable #goBlacklistEnlargeOnHover");
    utils.setDynamicStyle("goBlacklistEnlargeOnHover", `
        .go-blacklisted {
            ${value ? "" : "--disable-blacklist-enlarge: 1;"}
        }
    `);
}

//
//  TWEAKS SECTION
//

//  Collapsible sidebar

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value
 */
function applyTweakCollapseSidebar(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;
    utils.debugLog(`Applying TweakCollapseSidebar state: ${String(value)}`);

    document.querySelector("#container > section").classList.toggle("go-collapse-sidebar", value);
    document.querySelector("#tag-list").classList.toggle("go-tag-list-top-bottom-padding", value);

    document.querySelectorAll("#tag-list > li[class^='tag-type']").forEach((i) => { i.classList.toggle("go-collapse-sidebar-tags-list-tweak", value); });
    document.querySelector("#container").classList.toggle("go-collapse-sidebar-container-tweak", value);
    Object.values(document.getElementsByClassName("mobile-spacing")).forEach((i) => { i.classList.toggle("go-mobile-unspacing", value); });
    Object.values(document.getElementsByClassName("sm-hidden")).forEach((i) => { i.classList.toggle("go-sm-unhidden", value); });

}

//  Post

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value 
 */
function applyTweakArtistDetector(value) {
    if (context.pageType != utils.pageTypes.POST) return;
    utils.debugLog(`Applying ArtistDetector state: ${String(value)}`);

    let tagList = document.querySelector("#tag-list");

    switch (value) {
        case true:
            if (tagList.querySelector("b").textContent == "Artist") break;

            let tags = {};
            
            let generalTagNames = Object.values(document.querySelectorAll(".tag-type-general a:nth-child(2)")).map(i => i.textContent);
            let generalTagCounts = Object.values(document.querySelectorAll(".tag-type-general span:nth-child(3)")).map(i => Number(i.textContent));
            
            generalTagNames.forEach((name, i) => tags[name] = generalTagCounts[i]);

            var lowestCount = Math.min.apply(null, generalTagNames.map(function (x) { return tags[x] }));
            var lowestTag = generalTagNames.filter(function (y) { return tags[y] === lowestCount });

            let span = document.createElement('span');
            span.setAttribute('class', 'sm-hidden go-sm-unhidden');
            span.innerHTML = `
                <li style="margin-top: 10px;">
                    <b>Artist?</b>
                </li>
            `;

            
            let li = document.createElement("li");
            li.classList.add("tag-type-artist");
            li.innerHTML = `
            <span class="sm-hidden go-sm-unhidden">
                <a href="index.php?page=wiki&amp;s=list&amp;search=${lowestTag}">?</a> 
            </span>
            <a href="index.php?page=post&amp;s=list&amp;tags=${lowestTag}">${lowestTag}</a>
            <span style="color: #a0a0a0;">${lowestCount}</span>
            `;
            
            tagList.insertBefore(li, tagList.firstChild);
            tagList.insertBefore(span, tagList.firstChild);

            break;
        case false:
            if (tagList.querySelector("b").textContent != "Artist?") break;

            tagList.removeChild(tagList1.firstChild);
            tagList.removeChild(tagList1.firstChild);
            break;
    }
}

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value 
 */
function applyTweakPostFit(value) {
    if (context.pageType != utils.pageTypes.POST) return;
    utils.debugLog(`Applying PostFit state: ${String(value)}`);

    document.querySelectorAll(".note-container, #image, #gelcomVideoPlayer").forEach(i => {
        i.classList.toggle("go-fit-height", value);
        i.classList.toggle("fit-width", !value);
    });

    let resizeLink = document.querySelector("#resize-link > a");
    if (!resizeLink)
        return;

    if (value)
        resizeLink.addEventListener("click", toggleFitMode);
    else
        resizeLink.removeEventListener("click", toggleFitMode);
}

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value 
 */
function applyTweakPostCenter(value) {
    if (context.pageType != utils.pageTypes.POST) return;
    utils.debugLog(`Applying PostCenter state: ${String(value)}`);

    document.querySelectorAll(".note-container, #image, #gelcomVideoPlayer").forEach(i => {
        i.classList.toggle("go-center", value);
    });
}

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value 
 */
function applyTweakPostAutoScroll(value) {
    if (context.pageType != utils.pageTypes.POST) return;
    utils.debugLog(`Applying PostAutoScroll state: ${String(value)}`);

    if (value)
        document.addEventListener("readystatechange", autoScroll);
    else
        document.removeEventListener("readystatechange", autoScroll);
}

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value 
 */
function applyTweakPostOnNarrow(value) {
    if (context.pageType != utils.pageTypes.POST) return;
    utils.debugLog(`Applying PostOnNarrow state: ${String(value)}`);

    document.querySelectorAll(".note-container, #image, #gelcomVideoPlayer").forEach(i => {
        i.classList.toggle("go-fit-width-on-narrow", value);
    });
}

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value 
 */
function applyTweakPostClickSwitchFit(value) {
    if (context.pageType != utils.pageTypes.POST) return;
    utils.debugLog(`Applying PostClickSwitchFit state: ${String(value)}`);

    let img = document.querySelector("#image");
    let resizeLink = document.querySelector("#resize-link > a");

    if (!img || !resizeLink)
        return;

    if (value) {
        img.classList.add("go-cursor-zoom-in");
        img.addEventListener("click", toggleFitModeWithCursors);
    } else {
        img.classList.remove("go-cursor-zoom-in");
        img.classList.remove("go-cursor-zoom-out");
        img.removeEventListener("click", toggleFitModeWithCursors);
    }
}

//  Thumbs

/**
* @type {PreferenceUpdateCallback}
* @param {boolean} value
* @param {HTMLImageElement[]} thumbs
*/
function applyTweakEnlargeOnHover(value, thumbs = undefined) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    utils.debugLog(`Applying EnlargeOnHover state: ${String(value)}`);

    if (!thumbs) thumbs = utils.getThumbnails();

    thumbs.forEach((i) => {
        i.parentElement.classList.toggle("go-thumbnail-enlarge", value);

        if (context.pageType == utils.pageTypes.POST)
            i.style.margin = '';
        i.parentElement.style.margin = '10px'; //TODO: css

        if (value) {
            i.parentElement.addEventListener("mouseenter", updateTransformOrigin);
        } else {
            i.parentElement.removeEventListener("mouseenter", updateTransformOrigin);
            i.parentElement.style.transformOrigin = "";
        }
    });
}

/** 
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value
 */
function applyTweakLoadHighRes(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;
    utils.debugLog(`Applying LoadHighRes state: ${String(value)}`);

    utils.getThumbnails().forEach((i) => {
        if (value) {
            i.setAttribute("data-thumb-src", i.src);
            i.addEventListener("mouseenter", setImageHighResSource);
            i.addEventListener("mouseleave", setImageLowResSource);
        } else {
            i.removeEventListener("mouseenter", setImageHighResSource);
            i.removeEventListener("mouseleave", setImageLowResSource);
        }
    });

    // Dependent tweak
    applyTweakLoadingIndicator(Boolean(context.configManager.findValueByKey("thumbs.loader")));
}

/** 
* @type {PreferenceUpdateCallback}
* @param {boolean} value
* @param {HTMLImageElement[]} thumbs
*/
function applyTweakLoadingIndicator(value, thumbs = undefined) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

    // Dependencies check
    let dependValue = context.configManager.findValueByKey("thumbs.highRes") && value;
    utils.debugLog(`Applying LoadingIndicator state: ${String(dependValue)}`);

    if (!thumbs) thumbs = utils.getThumbnails();

    thumbs.forEach((i) => {
        if (dependValue) {
            i.addEventListener("mouseenter", addLoadingIndicator);
        } else {
            i.removeEventListener("mouseenter", addLoadingIndicator);
        }
    });
}

/** 
* @type {PreferenceUpdateCallback}
* @param {boolean} value
* @param {HTMLImageElement[]} thumbs
*/
function applyTweakRoundCorners(value, thumbs = undefined) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;
    utils.debugLog(`Applying RoundCorners state: ${String(value)}`);

    if (!thumbs) thumbs = utils.getThumbnails();

    thumbs.forEach((i) => {
        i.classList.toggle("go-thumbnail-corners", value);
    });
}

/** 
* @type {PreferenceUpdateCallback}
* @param {boolean} value
* @param {HTMLImageElement[]} thumbs
*/
function applyTweakRemoveTitle(value, thumbs = undefined) {
    if (utils.pageTypes.GALLERY != context.pageType) return;
    utils.debugLog(`Applying RemoveTitle state: ${String(value)}`);

    if (!thumbs) thumbs = utils.getThumbnails();

    thumbs.forEach((i) => {
        if (value) {
            i.setAttribute("data-title", i.getAttribute("title"));
            i.removeAttribute("title");
        } else if (i.hasAttribute("data-title")) {
            i.setAttribute("title", i.getAttribute("data-title"));
            i.removeAttribute("data-title");
        }

    });
}

/** 
* @type {PreferenceUpdateCallback}
* @param {boolean} value
* @param {HTMLImageElement[]} thumbs
*/
function applyTweakResizeThumbsGallery(value, thumbs = undefined) {
    if (utils.pageTypes.GALLERY != context.pageType) return;

    utils.debugLog(`Applying ResizeThumbGallery state: ${String(value)}`);

    if (!thumbs) thumbs = utils.getThumbnails();
    thumbs.forEach((i) => {
        i.classList.toggle("go-thumbnail-resize", value);
        i.parentElement.parentElement.classList.toggle("go-thumbnail-resize", value); // img < a < (article) < div.thumbnail-container
    });
}

/** 
* @type {PreferenceUpdateCallback}
* @param {boolean} value
*/
function applyTweakResizeThumbsMoreLikeThis(value) {
    if (utils.pageTypes.POST != context.pageType) return;
    utils.debugLog(`Applying ResizeThumbMoreLikeThis state: ${String(value)}`);

    utils.getThumbnails().forEach((i) => {
        i.classList.toggle("go-thumbnail-resize", value);
    });
}

//  FastDL

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value
 * @param {HTMLImageElement[]} thumbs
 */
function applyTweakFastDL(value, thumbs = undefined) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;
    utils.debugLog(`Applying FastDL state: ${String(value)}`);

    if (!thumbs) thumbs = utils.getThumbnails();

    thumbs.forEach((i) => {
        if (value) {
            i.addEventListener("contextmenu", downloadThumbWithRMB);
        } else {
            i.removeEventListener("contextmenu", downloadThumbWithRMB);
        }
    });
}

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value
 */
function applyTweakFastDLPost(value) {
    if (context.pageType != utils.pageTypes.POST) return;

    utils.debugLog(`Applying FastDLPost state: ${String(value)}`);

    let post = document.querySelector("#gelcomVideoPlayer, #image");

    if (value) {
        post.addEventListener("contextmenu", downloadPostWithRMB);
    } else {
        post.removeEventListener("contextmenu", downloadPostWithRMB);
    }
}

//  Infinite Scroll

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value
 */
function applyTweakInfiniteScroll(value) {
    if (context.pageType != utils.pageTypes.GALLERY) return;

    utils.debugLog(`Applying InfiniteScroll state: ${String(value)}`);

    context.infiniteScrolling.setup(value);
}

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value
 */
function applyTweakPaginatorOnTop(value) {
    if (context.pageType != utils.pageTypes.GALLERY) return;
    utils.debugLog(`Applying PaginatorOnTop state: ${String(value)}`);

    if (value) {
        if (document.querySelector(".top-pagination")) return;

        /** @type {HTMLElement} */
        let topPagination = document.querySelector(".pagination").cloneNode(true);
        topPagination.classList.add("top-pagination");
        document.querySelector("main").insertBefore(topPagination, document.querySelector(".thumbnail-container"));
    } else {
        document.querySelector(".top-pagination").remove();
    }
}

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value
 */
function applyTweakGoToTop(value) {
    if (context.pageType != utils.pageTypes.GALLERY) return;
    utils.debugLog(`Applying GoToTop state: ${String(value)}`);

    if (value) {
        let goTopDiv = document.createElement("div");
        let goTopSvg = document.createElement("svg");

        goTopDiv.setAttribute("class", "alert alert-info");
        goTopDiv.setAttribute("id", "go-top");
        goTopDiv.addEventListener("click", () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        goTopSvg.innerHTML =
            '<svg height="1em" width="1em" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"' +
            'xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 492.002 492.002" xml:space="preserve">' +
            '<g id="SVGRepo_bgCarrier" stroke-width="0"></g>' +
            '<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>' +
            '<g id="SVGRepo_iconCarrier"> ' +
            '<g> <g> <path d="M484.136,328.473L264.988,109.329c-5.064-5.064-11.816-7.844-19.172-7.844c-7.208,' +
            '0-13.964,2.78-19.02,7.844 L7.852,328.265C2.788,333.333,0,340.089,0,347.297c0,7.208,2.784,13.968,' +
            '7.852,19.032l16.124,16.124 c5.064,5.064,11.824,7.86,19.032,7.86s13.964-2.796,19.032-7.86l183.852' +
            '-183.852l184.056,184.064 c5.064,5.06,11.82,7.852,19.032,7.852c7.208,0,13.96-2.792,19.028-7.852l16' +
            '.128-16.132 C494.624,356.041,494.624,338.965,484.136,328.473z"></path> </g> </g> </g></svg>';

        goTopDiv.appendChild(goTopSvg);
        document.body.appendChild(goTopDiv);
    } else {
        document.querySelector("#go-top").remove();
    }
}

//  Advanced Blacklist

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value
 */
function applyTweakAdvancedBlacklist(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;
    utils.debugLog(`Applying AdvancedBlacklist state: ${String(value)}`);

    context.blacklistManager.setupManager(value);
}

/**
 * @type {PreferenceUpdateCallback}
 * @param {boolean} value
 */
function applyVariableBlacklist(value) {
    if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;
    utils.debugLog(`Applying AdvancedBlacklist Order Entries by Hit Count: ${String(value)}`);

    context.blacklistManager.orderEntriesByHitCount = value;
    context.blacklistManager.updateSidebarEntries();
}

//
//  FUNCTIONS SECTION
//

/**
 * @param {MouseEvent} e
 */
function setImageHighResSource(e) {
    /** @type {HTMLImageElement} */
    let img = e.target;

    utilsPost.loadPostItem(utils.getThumbPostId(img))
        .then(post => img.src = post.highResThumb)
        .catch(error => utils.debugLog("Failed to load highres image for following element with following error:", { img, error }));

}

/**
 * @param {MouseEvent} e
 */
function setImageLowResSource(e) {
    /** @type {HTMLImageElement} */
    let img = e.target;

    if (img.complete)
        img.src = img.getAttribute("data-thumb-src");
    else
        img.addEventListener("load", () => img.src = img.getAttribute("data-thumb-src"), { once: true });

}

function autoScroll() {
    /** @type {HTMLImageElement} */
    let image = document.querySelector("#image");

    // not works for video
    if (!image)
        return;

    if (window.innerHeight > image.height && window.innerWidth > image.width) {
        utils.debugLog("Scrolling");
        image.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
        history.scrollRestoration = 'manual';
    } else {
        history.scrollRestoration = 'auto';
    }
}

function toggleFitMode() {
    utils.debugLog("Toggling fit mode");

    let noteContainer = document.querySelector(".note-container");
    noteContainer.classList.toggle("go-fit-height");
    noteContainer.classList.toggle("go-fit-width");

    /** @type {HTMLImageElement} */
    let image = noteContainer.querySelector("#image");
    image.classList.toggle("go-fit-height");
    image.classList.toggle("go-fit-width");

    image.style.width = "";
    image.style.height = "";
    image.removeAttribute("width");
    image.removeAttribute("height");

    /** @type {HTMLDivElement} */
    let resizeLink = document.querySelector("#resize-link");
    resizeLink.style.display = "";
}

/**
 * @param {MouseEvent} e
 */
function updateTransformOrigin(e) {
    /** @type {HTMLElement} */
    let elem = e.target;
    let rect = elem.getBoundingClientRect();
    let xOrigin = rect.x + (rect.width / 2);
    let scale = Number(context.configManager.findValueByKey("thumbs.scale"))

    if (xOrigin - (rect.width * scale / 2) <= window.innerWidth * 0.01) {
        elem.style.transformOrigin = 'left';
    } else if (xOrigin + (rect.width * scale / 2) >= window.innerWidth * 0.99) {
        elem.style.transformOrigin = 'right';
    } else {
        elem.style.transformOrigin = '';
    }
}

/**
 * @param {MouseEvent} e
 */
function addLoadingIndicator(e) {
    e.target.parentElement.classList.add("go-loader");

    e.target.addEventListener("load", ee => {
        ee.target.parentElement.classList.remove("go-loader");
    }, { once: true });
}

/**
 * FastDL contextmenu event listener
 * @param {MouseEvent} e
 */
function downloadThumbWithRMB(e) {
    if (e.shiftKey) {
        return;
    }

    e.preventDefault();

    utilsPost.downloadPostById(utils.getThumbPostId(e.target));
}

/**
 * FastDL contextmenu event listener
 * @param {MouseEvent} e
 */
function downloadPostWithRMB(e) {
    if (e.shiftKey) {
        return;
    }

    e.preventDefault();

    let postId = Number(/id=([0-9]+)/.exec(document.location.href)[1]);
    utilsPost.downloadPostById(postId);
}

/**
 * @param {MouseEvent} e 
 */
function toggleFitModeWithCursors(e) {
    /** @type {HTMLAnchorElement} */
    let resizeLink = document.querySelector("#resize-link > a");
    resizeLink.click();

    e.target.classList.toggle("go-cursor-zoom-in");
    e.target.classList.toggle("go-cursor-zoom-out");
}
