/**
     * @class Class that manages blacklist features
     */
class BlacklistManager {
    /**
     * @typedef  BlacklistEntry
     * @type     {Object}
     * @property {string}  [tag]        Blacklisted tag
     * @property {string[]} [tags]      Blacklisted tags if AND
     * @property {boolean} isAnd      Describes if entry includes multiple tags
     * @property {number[]}  hits     Post ids affected by this entry
     * @property {boolean} isDisabled Describes if entry is disabled
     * 
     * @typedef BlacklistItem
     * @type {Object}
     * @property {string} name
     * @property {string} value
     * @property {[boolean]} isReadOnly
     * @property {[boolean]} isUnRemovable
     * @property {[string]} hash
     */
    /**
     * @type {BlacklistEntry[]}
     * @private
     */
    blacklistEntries;
    /**
     * @type {BlacklistItem}
     * @private
     */
    selectedBlacklistItem;
    /**
     * Total list of post ids affected by blacklist
     * @type {number[]}
     */
    totalHits;
    /** @type {Number} */
    totalPosts;
    /** @type {boolean} */
    orderEntriesByHitCount = false;

    constructor() {
    }
    /**
     * Stores all the dispatch handlers
     * @private
     * @type {function[]}
     */
    dispatchHandlers = [];
    /**
     * Registers an event listener
     * @public
     * @param {function} handler 
     * @returns {number} Number of listeners
     */
    addAppliedListener(handler) {
        return this.dispatchHandlers.push(handler);
    }
    /**
     * Checks for default blacklists
     */
    checkDefaultBlacklists() {
        /** @type {BlacklistItem} */
        let safeMode = { name: "Safe mode", value: "rating:q*\nrating:e*", isReadOnly: true, isUnRemovable: true };
        let noBlacklist = { name: "No blacklist", value: "", isReadOnly: true, isUnRemovable: true };

        let existingSafeModeIndex = this.blacklistItems.findIndex(i => i.name == safeMode.name);
        let existingNoBlacklistIndex = this.blacklistItems.findIndex(i => i.name == noBlacklist.name);

        if (existingSafeModeIndex == -1)
            this.blacklistItems.push(safeMode);
        else if (JSON.stringify(this.blacklistItems[existingSafeModeIndex]) != JSON.stringify(safeMode)) {
            let newBlacklistItems = this.blacklistItems;
            newBlacklistItems[existingSafeModeIndex] = safeMode;
            this.blacklistItems = newBlacklistItems;
        }

        if (existingNoBlacklistIndex == -1)
            this.blacklistItems.push(noBlacklist);
        else if (JSON.stringify(this.blacklistItems[existingNoBlacklistIndex]) != JSON.stringify(noBlacklist)) {
            let newBlacklistItems = this.blacklistItems;
            newBlacklistItems[existingNoBlacklistIndex] = noBlacklist;
            this.blacklistItems = newBlacklistItems;
        }

    }
    /**
     * @private
     * @returns {BlacklistItem[]} List of available blacklists
     */
    get blacklistItems() {
        return GM_getValue("blacklists", undefined);
    }
    /**
     * @private
     * @param {BlacklistItem[]} value
     */
    set blacklistItems(value) {
        GM_setValue("blacklists", value);
    }

    /**
     * Adds/updates blacklist item to storage
     * @param {BlacklistItem} item 
     * @private
     */
    addUpdateBlacklist(item) {
        let items = this.blacklistItems;

        if (!items)
            items = [];

        let index = items.findIndex(i => i.name == item.name);

        if (index == -1) {
            items.push(item);
        } else if (!items[index].hash || items[index].hash != item.hash) {
            items[index] = item;
        }

        this.blacklistItems = items;

        if (this.selectedBlacklistItem && this.selectedBlacklistItem.name)
            this.selectedBlacklistChanged(item.name);
        this.updateSidebarSelect();
    }
    /**
     * Removes blacklist item from storage
     * @param {BlacklistItem} item 
     * @private
     */
    removeBlacklist(item) {
        if (item.name == "Safe mode" || item.name == "No blacklist") return;

        let index = this.blacklistItems.findIndex(i => i.name == item.name);

        let items = this.blacklistItems;
        items.splice(index, 1);
        this.blacklistItems = items;

        this.updateSidebarSelect();

        let nameList = document.querySelector("#go-advBlacklistListNames");
        while (nameList.firstChild) nameList.firstChild.remove();

        this.blacklistItems.forEach(i => {
            let option = document.createElement("option");
            option.value = i.name;
            nameList.appendChild(option);
        });
    }
    registerEditWinow() {
        let eDiv = buildEditWindow(this);
        document.querySelector("#container").appendChild(eDiv);

        /** @param {BlacklistManager} scope*/
        function buildEditWindow(scope = this) {
            /** @type {HTMLDivElement} */
            let sDiv = document.createElement("div");
            sDiv.className = "go-config-window go-config-window-hidden";
            sDiv.id = "goBlacklistEditWindow";

            let header = document.createElement("header");
            header.className = "topnav";
            let headerA = document.createElement("a");
            headerA.textContent = "Edit blacklist";
            header.appendChild(headerA);

            let mainContent = document.createElement("dl");
            let textInputLI = document.createElement("li");
            let nameInputLI = document.createElement("li");
            nameInputLI.className = "text-input";

            let nameInputLabel = document.createElement("label");
            nameInputLabel.textContent = "Blacklist name";
            nameInputLabel.setAttribute("for", "NameInput");
            let nameInputDescript = document.createElement("p");
            nameInputDescript.textContent = "Input or select name (content will be replaced)";

            let textInputLabel = document.createElement("label");
            textInputLabel.textContent = "Blacklist entries";
            let textInputDescript = document.createElement("p");
            textInputDescript.style.whiteSpace = "pre";
            textInputDescript.textContent = "Input blacklist entries\nEach item on new line\nSupports wildcards\nSupports AND, comments (//, #), not sensitive to ' ' and '_'";

            let textInput = document.createElement("textarea");
            let submitSave = document.createElement("input");
            let submitDelete = document.createElement("input");
            let pReadonly = document.createElement("p");
            let pUnRemovable = document.createElement("p");

            let nameInput = document.createElement("input");
            nameInput.setAttribute("list", "go-advBlacklistListNames");
            nameInput.name = "NameInput";
            nameInput.addEventListener("input", e => {
                let foundItem = scope.blacklistItems.find(i => i.name == nameInput.value);

                if (foundItem) {
                    textInput.value = foundItem.value;

                    if (foundItem.isReadOnly) {
                        submitSave.disabled = true;
                        pReadonly.setAttribute("style", "color: red;");
                    }
                    else {
                        submitSave.disabled = false;
                        pReadonly.setAttribute("style", "display: none;");
                    }

                    if (foundItem.isUnRemovable) {
                        submitDelete.disabled = true;
                        pUnRemovable.setAttribute("style", "color: red;");
                    }
                    else {
                        submitDelete.disabled = false;
                        pUnRemovable.setAttribute("style", "display: none;");
                    }
                }
            });

            let nameList = document.createElement("datalist");
            nameList.setAttribute("id", "go-advBlacklistListNames");
            scope.blacklistItems.forEach(i => {
                let option = document.createElement("option");
                option.value = i.name;
                nameList.appendChild(option);
            });

            pReadonly.textContent = "This blacklist is readonly";
            pUnRemovable.textContent = "This blacklist is unremovable";

            nameInputLI.appendChild(nameInputLabel);
            nameInputLI.appendChild(nameInput);
            nameInputLI.appendChild(nameInputDescript);

            textInputLI.appendChild(textInputLabel);
            textInputLI.appendChild(textInput);
            textInputLI.appendChild(textInputDescript);
            textInputLI.appendChild(pReadonly);
            textInputLI.appendChild(pUnRemovable);

            mainContent.appendChild(nameInputLI);
            mainContent.appendChild(textInputLI);
            mainContent.appendChild(nameList);

            let footer = document.createElement("footer");
            let submitClose = document.createElement("input");
            submitClose.type = "submit";
            submitClose.className = "searchList";
            submitClose.value = "Close";
            submitClose.title = "Close window without saving";
            submitClose.addEventListener("click", () => {
                sDiv.classList.add("go-config-window-hidden");
            });


            submitSave.type = "submit";
            submitSave.className = "searchList";
            submitSave.value = "Save";
            submitSave.title = "Add or update blacklist";
            submitSave.addEventListener("click", () => {
                if (nameInput.value == "") return;

                /** @type {BlacklistItem} */
                let foundItem = scope.blacklistItems.find(i => i.name == nameInput.value);

                if (!foundItem) foundItem = { name: nameInput.value, value: textInput.value };
                foundItem.value = textInput.value;

                scope.addUpdateBlacklist(foundItem);

                sDiv.classList.add("go-config-window-hidden");
            });


            submitDelete.type = "submit";
            submitDelete.className = "searchList";
            submitDelete.value = "Delete";
            submitDelete.title = "Delete selected blacklist";
            submitDelete.addEventListener("click", () => {
                /** @type {BlacklistItem} */
                let foundItem = scope.blacklistItems.find(i => i.name == nameInput.value);

                if (!foundItem) return;

                scope.removeBlacklist(foundItem);

                sDiv.classList.add("go-config-window-hidden");
            });

            footer.appendChild(submitClose);
            footer.appendChild(submitSave);
            footer.appendChild(submitDelete);

            sDiv.appendChild(header);
            sDiv.appendChild(mainContent);
            sDiv.appendChild(footer);

            return sDiv;
        }
    }
    removeEditWindow() {
        let elem = document.querySelector("#container > #goBlacklistEditWindow");
        if (elem) elem.remove();
    }

    /**
     * Parse current blacklist item's entries
     */
    parseEntries() {
        this.blacklistEntries = [];

        let text = this.selectedBlacklistItem.value;
        let lines = text.split(/[\n|\r\n]/);
        lines = lines.filter((l) => !(["", " ", "\n", "\r\n"].includes(l) || l.startsWith("#") || l.startsWith("//"))); // empty, space or newline, comments


        // clear inline comments and trim spaces
        lines = lines.map((l) => {
            return l.replace(/([\/\/|#].*)/, "").trim();
        });

        // clear namespace excep rating:
        lines = lines.map(l => {
            return l.replace(/^(?!rating:)(?:.+:)(.+)$/, "$1");
        });

        // fix spaces and lowercase
        lines = lines.map(l => l.replaceAll(" AND ", " && ").replaceAll("_", " ").toLowerCase());

        // deduplicate
        lines = [...new Set(lines)];

        let entries = lines.map((l) => {
            if (Boolean(l.match(/ && /))) {
                /** @type {BlacklistEntry} */
                let entry = {
                    tags: l.split(/ && /),
                    isAnd: true,
                    hits: [],
                    isDisabled: false
                };
                return entry;
            } else {
                /** @type {BlacklistEntry} */
                let entry = {
                    tag: l,
                    isAnd: false,
                    hits: [],
                    isDisabled: false
                };
                return entry;
            }
        });

        this.blacklistEntries = entries;
    }
    /**
     * 
     * @param {BlacklistEntry} entry 
     * @param {boolean} force 
     */
    toggleEntry(entry, force = undefined, skipStorageSet = false) {
        if (force)
            entry.isDisabled = force;
        else
            entry.isDisabled = !entry.isDisabled;

        let thumbs = utils.getThumbnails();

        if (entry.isDisabled) {                                                                          // if this entry was disabled
            entry.hits.forEach(id => {                                                          // for each post its hits
                if (!this.blacklistEntries                                                               // from all the current blacklist entries
                    .filter(e => !(e.hits.length == 0 || e.isDisabled || e == entry))   // filter other entries that has hits and not disabled
                    .some(e => e.hits.includes(id))) {                                  // if there are none entries which also hits current post
                    let thumb = Object.values(thumbs).find(t => utils.getThumbPostId(t) == id);     // find img element for given post id

                    thumb.closest(".thumbnail-preview")?.classList.toggle("go-blacklisted", false);
                    thumb.parentElement.classList.toggle("go-blacklisted", false);                                    // disable blacklist class
                }

            });
        } else {                                                                                        // if entry was enabled
            entry.hits.forEach(id => {                                                         // for each its hit
                let thumb = Object.values(thumbs).find(t => utils.getThumbPostId(t) == id); // find img element for given post id

                thumb.closest(".thumbnail-preview")?.classList.toggle("go-blacklisted", true);
                thumb.parentElement.classList.toggle("go-blacklisted", true);                                // enable blacklist class
            });
        }

        this.updateSidebarTitle();
        this.updateSidebarEntries();

        if (!skipStorageSet)
            this.storageSetDisbledEntries(JSON.stringify(this.blacklistEntries.filter(e => e.isDisabled)));
    }
    /**
     * this function CAN'T toggle an arbitary array of entries
     * designed only for making changes on all entries but needs it as an arg because will be invoked from a local function
     * @param {BlacklistEntry[]} entries 
     * @param {boolean} force 
     */
    toggleEntries(entries = undefined, force = undefined, skipStorageSet = false) {
        if (!entries) entries = this.blacklistEntries;
        if (entries.length < 1) return;

        if (force == undefined) force = !entries[0].isDisabled;

        entries.forEach(e => e.isDisabled = force);

        let thumbs = utils.getThumbnails();

        this.totalHits.forEach(id => {
            let thumb = Object.values(thumbs).find(t => utils.getThumbPostId(t) == id);

            thumb.closest(".thumbnail-preview")?.classList.toggle("go-blacklisted", !force);
            thumb.parentElement.classList.toggle("go-blacklisted", !force);
        });

        this.updateSidebarTitle();
        this.updateSidebarEntries();

        if (!skipStorageSet)
            this.storageSetDisbledEntries(JSON.stringify(this.blacklistEntries.filter(e => e.isDisabled)));
    }

    /**
     * Creates blacklist sidebar placed above tags sidebar
     * @private
     */
    createSidebar() {
        //title
        let titleSpan = document.createElement("span");
        titleSpan.id = "go-advBlacklistTitle";

        let b = document.createElement("b");
        b.textContent = `Blacklist`;

        titleSpan.appendChild(document.createElement("br"));
        titleSpan.appendChild(b);
        titleSpan.appendChild(document.createElement("br"));
        titleSpan.appendChild(document.createElement("br"));

        //select
        let select = document.createElement("select");
        select.id = "go-advBlacklistSelect";
        select.addEventListener("change", e => this.selectedBlacklistChanged(e.target.value));

        //select edit
        let edit = document.createElement("svg");
        edit.id = "go-advBlacklistEdit";
        edit.innerHTML = '<svg class="go-svg" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="m19.3 8.925l-4.25-4.2l1.4-1.4q.575-.575 1.413-.575q.837 0 1.412.575l1.4 1.4q.575.575.6 1.388q.025.812-.55 1.387ZM17.85 10.4L7.25 21H3v-4.25l10.6-10.6Z"/></svg>';
        edit.addEventListener("click", (e) => {
            document.querySelector("#container > #goBlacklistEditWindow").classList.toggle("go-config-window-hidden");
        });
        //entries
        let entries = document.createElement("ul");
        entries.id = "go-advBlacklistEntries";
        entries.className = "tag-list";

        //insert elements (reverse order)
        let aside = document.querySelector(".aside");
        aside.insertBefore(entries, aside.firstChild);
        aside.insertBefore(edit, aside.firstChild);
        aside.insertBefore(select, aside.firstChild);
        aside.insertBefore(titleSpan, aside.firstChild);
    }
    /**
     * Removes blacklist sidebar placed above tags sidebar
     * @private
     */
    removeSidebar() {
        let aside = document.querySelector(".aside");
        let title = aside.querySelector("#go-advBlacklistTitle");
        let select = aside.querySelector("#go-advBlacklistSelect");
        let edit = aside.querySelector("#go-advBlacklistEdit");
        let entries = aside.querySelector("#go-advBlacklistEntries");


        if (title) {
            title.remove();
            select.remove();
            edit.remove();
            entries.remove();
        }
    }
    updateSidebarTitle() {
        let thumbs = Object.values(utils.getThumbnails());

        document.querySelector("#go-advBlacklistTitle").querySelector("b").textContent =
            `Blacklist ${thumbs.filter(e => e.parentElement.classList.contains("go-blacklisted")).length}/${thumbs.length}`;
    }
    updateSidebarSelect() {
        /** @type {HTMLSelectElement} */
        let select = document.querySelector("#go-advBlacklistSelect");

        while (select.firstChild) select.firstChild.remove();

        if (this.blacklistItems && this.blacklistItems.length > 0) {
            this.blacklistItems.forEach(i => select.appendChild(buildBlacklistItem(i)));
        } else {
            select.appendChild(buildBlacklistItem(null));
        }

        if (this.selectedBlacklistItem) select.value = this.selectedBlacklistItem.name;

        function buildBlacklistItem(i) {
            let opt = document.createElement("option");

            if (i == null) {
                opt.value = "There is no blacklists";
                opt.textContent = "There is no blacklists";
                select.setAttribute("disabled", "");
            } else {
                opt.value = i.name;
                opt.textContent = i.name;
            }

            return opt;
        }
    }
    updateSidebarEntries() {
        let entries = document.querySelector("#go-advBlacklistEntries");

        while (entries.firstChild) entries.firstChild.remove();

        if (this.blacklistEntries && this.blacklistEntries.length > 0) {
            let displayEntries = this.blacklistEntries.filter(i => i.hits.length > 0);
            if (this.orderEntriesByHitCount) displayEntries = displayEntries.sort((e1, e2) => e2.hits.length - e1.hits.length);

            displayEntries.forEach(i => entries.appendChild(buildEntryItem(i, this)));
            if (displayEntries.length > 1) entries.appendChild(buildDisableAll(this));
        }
        /** @param {BlacklistManager} scope @param {BlacklistEntry} i*/
        function buildEntryItem(i, scope = this) {
            let li = document.createElement("li");
            li.className = "tag-type-general";

            let a_tag = document.createElement("a");
            a_tag.textContent = i.isAnd ? i.tags.join(" && ") : i.tag;
            a_tag.addEventListener("click", e => { scope.toggleEntry(i); });
            a_tag.classList.toggle("go-advBlacklistDisabledEntry", i.isDisabled);
            a_tag.href = "javascript:;";

            let separator = document.createElement("a");
            separator.textContent = " ";

            let span = document.createElement("span");
            span.style.color = "#a0a0a0";
            span.textContent = String(i.hits.length);

            li.appendChild(a_tag);
            li.appendChild(separator);
            li.appendChild(span);

            return li;
        }
        /** @param {BlacklistManager} scope */
        function buildDisableAll(scope = this) {
            let li = document.createElement("li");
            li.className = "tag-type-general";

            let state = scope.blacklistEntries.filter(e => e.hits.length > 0).every(e => e.isDisabled);

            let a_tag = document.createElement("a");
            a_tag.textContent = state ? "Enable all" : "Disable all";
            a_tag.addEventListener("click", e => scope.toggleEntries(scope.blacklistEntries, !state));
            a_tag.href = "javascript:;";

            li.appendChild(a_tag);

            return li;
        }
    }

    /**
     * Enable/disable blacklist manager
     * @param {boolean} value 
     * @public
     */
    setupManager(value) {
        if (value) {
            this.removeEditWindow();
            this.removeSidebar();
            this.registerEditWinow();
            this.createSidebar();

            this.checkDefaultBlacklists();

            setTimeout(() => this.loadBlacklistsFromLocalStorage(), 1000);

            let stored = this.storageGetBlacklist();
            if (stored && this.blacklistItems.some(i => i.name == stored))
                this.selectedBlacklistChanged(stored);
            else
                this.selectedBlacklistChanged(this.blacklistItems[0].name);

            this.updateSidebarSelect();
        } else {
            this.removeSidebar();
            this.removeEditWindow();
        }
    }
    /**
     * Listeren for blacklist select onchange
     * @param {string} name 
     */
    selectedBlacklistChanged(name) {
        this.selectedBlacklistItem = this.blacklistItems.find(i => i.name == name);

        this.totalHits = [];
        this.totalPosts = 0;

        this.parseEntries();
        this.applyBlacklist();

        if (this.selectedBlacklistItem.name == this.storageGetBlacklist()) {        // if current blacklist name was found as saved in the storage
            let entrStr = this.storageGetDisabledEntries();                         // load disabled entries from the storage
            if (entrStr == null || entrStr == "") return;                           // check if it wasn't broken

            let entries = JSON.parse(entrStr);                                      // parse json to array
            entries.forEach(entry => {                                        // foreach stored disabled entry
                let found = this.blacklistEntries.find(e =>
                    e.tag == entry.tag ||
                    e.tags && entry.tags &&
                    e.tags.every((v, i) => v == entry.tags[i]));    // try to find it by its tags

                if (found) this.toggleEntry(found, true, true);                     // if entry was found, disable it
            });

            this.updateSidebarTitle();
            this.updateSidebarEntries();
        } else {                                                                    // if current bl wasn't found in the storage
            this.storageSetBlacklist(this.selectedBlacklistItem.name);              // write current blacklist name
            this.storageSetDisbledEntries("[]");                                    // with no disabled entries
        }
    }
    /**
     * Loads blacklists from local storage as readonly items
     */
    loadBlacklistsFromLocalStorage() {
        let storedBlacklistsString = localStorage.getItem("go-helper-blacklists");
        if (!storedBlacklistsString) return;

        let storedBlacklists = JSON.parse(storedBlacklistsString);
        if (!storedBlacklists || storedBlacklists.length == 0) return;

        storedBlacklists.forEach(i => this.addUpdateBlacklist(i));
    }
    async applyBlacklist(thumbs = null) {
        if (!thumbs) {
            thumbs = utils.getThumbnails();
            this.totalPosts = Object.values(thumbs).length;
        } else {
            this.totalPosts += Object.values(thumbs).length;
        }

        await this.checkPosts(thumbs);
        await this.hidePosts(thumbs);

        this.updateSidebarTitle();
        this.updateSidebarEntries();

        this.dispatchHandlers.forEach(h => h());
    }
    async checkPosts(thumbs) {
        await Promise.all(                                                                                  // wait until all
            Object.values(thumbs).map(async t => {                                                    // map each thumb to an promise
                let item = await utilsPost.loadPostItem(utils.getThumbPostId(t));                                // load post item for current post
                let isHit = await this.checkPost(item);                                                     // check every entry for hits on current post
                if (isHit) this.totalHits.push(item.id);                                                    // if it's any hits, push post to total hits array
            }));
    }
    async hidePosts(thumbs) {
        Promise.all(
            Object.values(thumbs).map(async t => {                                                     // map each thumb to an promise
                if (!this.blacklistEntries                                                                   // from all the current blacklist entries
                    .filter(e => !(e.isDisabled || e.hits.length == 0))                     // filter entries that has hits and not disabled
                    .some(e => e.hits.includes(utils.getThumbPostId(t)))) {                 // if there are none entries which also hits current post

                    t.closest(".thumbnail-preview")?.classList.toggle("go-blacklisted", false);             // find img element for given post id
                    t.parentElement.classList.toggle("go-blacklisted", false);                              // disable blacklist class                                           
                }
                else {                                                                                      // if there are entries which hits current post
                    t.closest(".thumbnail-preview")?.classList.toggle("go-blacklisted", true);
                    t.parentElement.classList.toggle("go-blacklisted", true);                               // enable blacklist class
                }
                t.parentElement.classList.remove("go-blacklisted-pending");
            })
        );
    }
    /**
     * 
     * @param {PostItem} item 
     * @returns {Promise<boolean>} Is post was hit by any entry
     */
    async checkPost(item) {
        // O(post count * blacklist entries count)
        let isHit = false;

        await Promise.all(this.blacklistEntries.map(e => this.checkEntryHit(item, e)))    // map every entry to check hit on given post item
            .then(retarr => {                                     // then
                retarr.forEach(ret => {                             // for each entry
                    if (ret) isHit = true;                                    // if it hits set isHit for current post item
                });
            });

        return isHit;
    }
    /**
     * 
     * @param {PostItem} post 
     * @param {BlacklistEntry} entry 
     * @returns {boolean} Is post was hit with given entry
     */
    checkEntryHit(post, entry) {
        let postTags = post.tags.artist.concat(post.tags.character, post.tags.copyright, post.tags.general, post.tags.metadata);    // concat all the tags to avoid intercategory mis hits
        postTags.push(`rating:${post.rating}`);                                                                                     // push post rating as a tag

        if (entry.isAnd) {                                                                                                            // there are different ways for And and non And bl entries
            if (entry.tags.every(entryTag => postTags.some(postTag => utils.wildTest(entryTag, postTag)))) {        // if all the And tags hits any off post tags each
                entry.hits.push(post.id);                                                                                             // push the post to the entry
                return true;                                                                                                          // report hit
            }
        } else {
            if (postTags.some(postTag => utils.wildTest(entry.tag, postTag))) {                                            // if any post tag hits entry tag
                entry.hits.push(post.id);                                                                                           // push the post to the entry
                return true;                                                                                                        // report hit
            }
        }

        return false;                                                                                             // report no hit
    }

    storageSetBlacklist(name) {
        localStorage.setItem("go-blacklist", name);
    }
    storageGetBlacklist() {
        let name = localStorage.getItem("go-blacklist");

        return name;
    }
    storageSetDisbledEntries(entries) {
        sessionStorage.setItem("go-blacklist-disabled", entries);
    }
    storageGetDisabledEntries() {
        return sessionStorage.getItem("go-blacklist-disabled");
    }
}
