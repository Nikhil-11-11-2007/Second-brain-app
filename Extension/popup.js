const API_URL = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
    const status = document.getElementById("status");

    const token = await getToken();

    if (!token) {
        status.innerText = "Please login first 🔐";
        return;
    }

    await loadCollections();
});

// 🔥 GET ACCESS TOKEN
async function getToken() {
    const data = await chrome.storage.local.get("accessToken");
    return data.accessToken;
}

// 🔥 REFRESH TOKEN API CALL
async function refreshAccessToken() {
    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: "GET",
            credentials: "include" // 🔥 cookie bhejne ke liye important
        });

        if (!res.ok) throw new Error("Refresh failed");

        const data = await res.json();

        // 🔥 new access token save karo
        await chrome.storage.local.set({
            accessToken: data.accessToken
        });

        return data.accessToken;

    } catch (err) {
        console.log("Refresh token expired ❌");
        return null;
    }
}

// 🔥 FETCH WITH AUTO REFRESH
async function fetchWithAuth(url, options = {}) {
    let token = await getToken();

    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
    };

    let res = await fetch(url, options);

    // 🔥 agar token expire ho gaya
    if (res.status === 401) {
        token = await refreshAccessToken();

        if (!token) throw new Error("Session expired");

        options.headers.Authorization = `Bearer ${token}`;
        res = await fetch(url, options);
    }

    return res;
}

// 🔥 LOAD COLLECTIONS
async function loadCollections() {
    const select = document.getElementById("collectionSelect");

    try {
        const res = await fetchWithAuth(`${API_URL}/collections`);

        console.log("Status:", res.status);

        const data = await res.json();
        console.log("RAW response:", data);

        const collections = Array.isArray(data) ? data : data.collections || [];

        select.innerHTML = `<option value="">Select Collection</option>`;

        if (!collections.length) {
            select.innerHTML += `<option value="">No Collections</option>`;
            return;
        }

        collections.forEach(col => {
            const option = document.createElement("option");
            option.value = col._id;
            option.textContent = col.name;
            select.appendChild(option);
        });

    } catch (err) {
        select.innerHTML = `<option value="">Error loading ❌</option>`;
    }
}


// 🔥 SAVE BUTTON
document.getElementById("saveBtn").addEventListener("click", async () => {

    const status = document.getElementById("status");
    status.innerText = "Saving... ⏳";

    try {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        console.log("ACTIVE TAB URL:", tab.url);

        if (!tab.url || tab.url.startsWith("chrome://")) {
            status.innerText = "Open a normal website ❌";
            return;
        }

        // 🔥 inject content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });

        chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_DATA" }, async (pageData) => {

            if (chrome.runtime.lastError) {
                console.log("ERROR:", chrome.runtime.lastError.message);
                status.innerText = "Content script not responding ❌";
                return;
            }

            if (!pageData) {
                status.innerText = "Page read failed ❌";
                return;
            }

            const collectionId = document.getElementById("collectionSelect").value;

            const payload = {
                type: detectType(pageData.url),
                content: pageData.title,
                url: pageData.url,
                thumbnail: pageData.thumbnail,
                description: pageData.description,
                collectionId: collectionId || null
            };

            try {
                const res = await fetchWithAuth(`${API_URL}/items`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error("Save failed");

                status.innerText = "Saved ✅";

            } catch (err) {
                status.innerText = "API Error ❌";
            }
        });

    } catch (err) {
        status.innerText = "Something went wrong ❌";
    }
});

// 🔥 detect type
function detectType(url) {
    if (!url) return "link";
    if (url.includes("youtube.com")) return "video";
    if (url.includes("twitter.com")) return "tweet";
    if (url.includes("pdf")) return "pdf";
    if (url.startsWith("http")) return "article";
    return "link";
}