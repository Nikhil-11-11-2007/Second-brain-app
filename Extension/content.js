function getPageData() {
  const url = window.location.href;
  const title = document.title;

  // 🔹 description
  const description =
    document.querySelector('meta[name="description"]')?.content ||
    document.querySelector('meta[property="og:description"]')?.content ||
    "";

  // 🔹 thumbnail (default)
  let thumbnail =
    document.querySelector('meta[property="og:image"]')?.content || "";

  // 🔥 YouTube fix
  if (url.includes("youtube.com")) {
    const videoId = new URLSearchParams(window.location.search).get("v");
    thumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : thumbnail;
  }

  return {
    url,
    title,
    description,
    thumbnail
  };
}

// message listener
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_PAGE_DATA") {
    sendResponse(getPageData());
  }
});

console.log("CONTENT SCRIPT LOADED ✔");