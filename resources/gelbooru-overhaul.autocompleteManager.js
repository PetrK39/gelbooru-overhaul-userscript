/**
 * @class Class that manages the custom autocomplete features
 */
class AutocompleteManager {
    /**
     * @typedef SuggestionItem
     * @type {Object}
     * @property {string} type
     * @property {string} label
     * @property {string} value
     * @property {string} post_count
     * @property {string} category
     */
    metaTagSpaces = {
        id: "id", score: "score", rating: "rating",
        user: "user", height: "height", width: "width",
        source: "source", updated: "updated", sort: "sort",
        pool: "pool", fav: "fav", md5: "md5"
    };
    metaTagRatings = {
        explicit: "explicit", questionable: "questionable",
        sensitive: "sensitive", general: "general"
    };
    metaTagSort = { random: "random", updated: "updated", score: "score" };

    isEnabled = false;

    inputElement = null;
    suggestionULElement = null;

    constructor() {
        if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

        this.registerSearchArea();

        this.searchHotkeyListener = this.searchHotkeyListener.bind(this);
        this.replaceInputWithSuggestion = this.replaceInputWithSuggestion.bind(this);

        this.interceptTagPM();
    }

    getBookmarkedItems() {
        return localStorage.getItem("bookmarked-tags");
    }
    setupManager(value) {
        if (![utils.pageTypes.GALLERY, utils.pageTypes.POST].includes(context.pageType)) return;

        if (value != this.isEnabled && value) {
            this.showCustomSearchArea();
            this.isEnabled = true;
        } else {
            this.showDefaultSearchArea();
            this.isEnabled = false;
        }
    }
    registerSearchArea() {
        let divSA = document.createElement("div");
        divSA.setAttribute("class", "searchArea");
        divSA.setAttribute("id", "go-searchArea");
        divSA.setAttribute("style", "display:none;");

        let divSADiv = document.createElement("div");
        divSA.appendChild(divSADiv);

        let divSADivForm = document.createElement("form");
        divSADivForm.setAttribute("action", "index.php?page=search");
        divSADivForm.setAttribute("method", "post");
        divSADiv.appendChild(divSADivForm);

        let a = document.createElement("a");
        a.setAttribute("href", "javascript:;");
        a.setAttribute("onclick", "saveTagSearch();return false;");
        divSADivForm.appendChild(a);

        let img = document.createElement("img");
        img.setAttribute("class", "invert");
        img.setAttribute("src", "layout/heart-fill.svg");
        img.setAttribute("style", "vertical-align: top; margin: 4px 10px 0px 10px; height: 24px; width: 24px; border: 0px !important; opacity: .6;");
        img.setAttribute("title", "Save this search. Check your account page.");

        a.appendChild(img);

        let divInputSuggest = document.createElement("div");
        divInputSuggest.setAttribute("style", "display:inline;");
        divSADivForm.appendChild(divInputSuggest);

        let input = document.createElement("input");
        input.setAttribute("id", "go-tags-search");
        input.setAttribute("name", "tags");
        input.setAttribute("autocomplete", "off");
        input.setAttribute("type", "text");
        input.setAttribute("style", "padding: 7px; width: calc(100% - 180px); border: 1px solid #e0e0e0; margin: 1px;");
        input.setAttribute("placeholder", "Search Example: video black_hair rating:sensitive");
        input.setAttribute("class", "ui-autocomplete-input");
        input.addEventListener("input", (e) => { this.onInput(); });
        divInputSuggest.appendChild(input);
        this.inputElement = input;

        let submit = document.createElement("input");
        submit.setAttribute("type", "submit");
        submit.setAttribute("value", "Search");
        submit.setAttribute("name", "commit");
        submit.setAttribute("class", "searchList");
        divInputSuggest.appendChild(submit);

        let ulSuggest = document.createElement("ul");
        ulSuggest.setAttribute("class", "go-suggestion-list ui-front ui-menu ui-widget ui-widget-content");
        ulSuggest.setAttribute("style", "width: calc(100% - 160px); position: relative;");
        divInputSuggest.appendChild(ulSuggest);
        this.suggestionULElement = ulSuggest;


        document.querySelector("#container").insertBefore(divSA, document.querySelector(".searchArea"));


    }
    showCustomSearchArea() {
        document.querySelector("#go-tags-search").value = document.querySelector("#tags-search").value;

        document.querySelector("#go-searchArea").removeAttribute("style");
        document.querySelector(".searchArea:not(#go-searchArea)").setAttribute("style", "display: none;");
    }
    showDefaultSearchArea() {
        document.querySelector("#tags-search").value = document.querySelector("#go-tags-search").value;

        document.querySelector("#go-searchArea").setAttribute("style", "display: none;");
        document.querySelector(".searchArea:not(#go-searchArea)").removeAttribute("style");
    }
    applyTweakHotkey(value) {
        if (value)
            document.addEventListener("keydown", this.searchHotkeyListener);
        else
            document.removeEventListener("keydown", this.searchHotkeyListener);
    }
    /**
     * 
     * @param {KeyboardEvent} e 
     */
    searchHotkeyListener(e) {
        if (this.isEnabled && e.code == "Slash" && document.activeElement != this.inputElement) {
            e.preventDefault();
            this.inputElement.focus();
        }
    }
    interceptTagPM() {
        let oldTagPM = tagPM;
        tagPM = function (tagInput) {
            oldTagPM(tagInput);

            if (!context.autocompleteManager.isEnabled) return;

            let inputElement = document.querySelector("#go-tags-search");
            let needSpace = inputElement.value != "" && !inputElement.value.endsWith(" ");

            if (needSpace) inputElement.value = inputElement.value.concat(" ");
            inputElement.value = inputElement.value.concat(tagInput + " ");

            if (Boolean(context.configManager.findValueByKey("autocomplete.sidebar"))) inputElement.focus();
        }
    }
    onInput() {
        if (!this.isEnabled) return;

        let currentCursor = this.inputElement.selectionStart;
        let currentInput = this.inputElement.value.substring(0, currentCursor);
        let currentTerm = currentInput.match(/\S*$/)[0]
        console.log("CURRENT TERM: " + currentTerm);

        this.showSuggestions(currentTerm);
    }
    showSuggestions(tag) {
        if (tag.match(/\s/)) return;

        let namespaceRegExp = new RegExp(`^[-~(]*(${Object.values(this.metaTagSpaces).join("|")})?`);
        let matchMeta = tag.match(namespaceRegExp);

        /** @type {SuggestionItem[]} */
        let suggestions = [];

        if (matchMeta) {
            let metaTag = matchMeta[1];

            switch (metaTag) {
                case this.metaTagSpaces.rating:
                    suggestions.push(...Object.values(this.metaTagRatings).map(tag => ({ type: "tag", label: tag, value: tag, post_count: "", category: "tag" })));
                    break;
                case this.metaTagSpaces.sort:
                    suggestions.push(...Object.values(this.metaTagSort).map(tag => ({ type: "tag", label: tag, value: tag, post_count: "", category: "tag" })));
                    break;
            }
        }

        fetch(`https://gelbooru.com/index.php?page=autocomplete2&term=${tag}&type=tag_query&limit=10`)
            .then(response => response.json())
            .then(tags => suggestions.push(...tags))
            .then(() => {
                console.log("PREPARED SUGGESTIONS:" + suggestions.length);
                this.renderSuggestions(suggestions);
            });
    }
    renderSuggestions(suggestions) {
        while (this.suggestionULElement.firstChild) { this.suggestionULElement.removeChild(this.suggestionULElement.firstChild); }
        if (suggestions.length == 0) return;

        // generate the list items for each suggestion li > div > a > text
        for (var i = 0; i < suggestions.length; i++) {
            let suggestion = suggestions[i];

            let li = document.createElement("li");
            li.setAttribute("class", "ui-menu-item");

            let div = document.createElement("div");
            div.setAttribute("class", "ui-menu-item-wrapper");
            div.addEventListener("mouseenter", (e) => e.target.classList.add("ui-state-active"));
            div.addEventListener("mouseleave", (e) => e.target.classList.remove("ui-state-active"));
            div.addEventListener("click", () => this.replaceInputWithSuggestion(suggestion.value));
            li.appendChild(div);

            let a = document.createElement("a");
            a.setAttribute("class", `tag-type-${suggestion.category}`);
            a.setAttribute("href", `/index.php?page=post&s=list&tags=${suggestion.value}`);
            a.addEventListener("click", (e) => e.preventDefault());
            a.textContent = suggestion.label;
            div.appendChild(a);

            let span = document.createElement("span");
            span.setAttribute("style", "float: right;");
            span.setAttribute("class", "post-count");
            span.textContent = suggestion.post_count;
            a.appendChild(span);

            this.suggestionULElement.appendChild(li);
        }
    }
    replaceInputWithSuggestion(suggestion) {
        var before_caret_text = this.inputElement.value.substring(0, this.inputElement.selectionStart).replace(/^[ \t]+|[ \t]+$/gm, "");
        var after_caret_text = this.inputElement.value.substring(this.inputElement.selectionStart).replace(/^[ \t]+|[ \t]+$/gm, "");

        var regexp = new RegExp("(" + "-|~|{|" + Object.keys({ ch: 4, co: 3, gen: 0, char: 4, copy: 3, art: 1, meta: 5, general: 0, character: 4, copyright: 3, artist: 1 }).map(category => category + ":").join("|") + ")?\\S+$", "g");
        before_caret_text = before_caret_text.replace(regexp, "$1") + suggestion + " ";

        this.inputElement.value = before_caret_text + after_caret_text;
        this.inputElement.selectionStart = this.inputElement.selectionEnd = before_caret_text.length;
    }

    // the autocomplete function
    // bookmarked tags
    // custom appearance with ?+- tag and count
    // cheatsheet on bottom
}