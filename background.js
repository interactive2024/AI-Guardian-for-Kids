// Layer 2: Emergency Brake List (Hardcoded)
const emergencyBrakeList = [
  "example-adult-site.com",
  "example-malware-site.com",
  "hate-speech-domain.org",
];

const CACHE_DURATION_MINUTES = 15;

// The main navigation listener
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Ignore sub-frame navigations and our own extension pages
  if (details.frameId !== 0 || details.url.startsWith(chrome.runtime.getURL(""))) {
    return;
  }

  const destinationUrl = new URL(details.url);
  const hostname = destinationUrl.hostname;

  // --- Layer 1 Check: Absolute Block List (from cache) ---
  const data = await chrome.storage.local.get("absoluteBlocklist");
  const cachedBlocklist = data.absoluteBlocklist;

  if (cachedBlocklist && cachedBlocklist.list) {
    const isCacheValid = (Date.now() - cachedBlocklist.timestamp) < CACHE_DURATION_MINUTES * 60 * 1000;
    if (isCacheValid) {
      for (const blockedDomain of cachedBlocklist.list) {
        if (hostname.includes(blockedDomain)) {
          console.log(`Blocking ${hostname} (Layer 1)`);
          const blockedPageUrl = chrome.runtime.getURL("blocked.html");
          chrome.tabs.update(details.tabId, { url: blockedPageUrl });
          return; // Stop further processing
        }
      }
    }
  }

  // --- Layer 2 Check: Emergency Brake List ---
  for (const blockedDomain of emergencyBrakeList) {
    if (hostname.includes(blockedDomain)) {
      console.log(`Blocking ${hostname} (Layer 2)`);
      const blockedPageUrl = chrome.runtime.getURL("blocked.html");
      chrome.tabs.update(details.tabId, { url: blockedPageUrl });
      return; // Stop further processing
    }
  }

  // --- Layer 3 Redirection (Default) ---
  const warningUrl = chrome.runtime.getURL("warning.html");
  const originalUrl = encodeURIComponent(details.url);
  chrome.tabs.update(details.tabId, {
    url: `${warningUrl}?originalUrl=${originalUrl}`
  });
}, { url: [{ urlMatches: 'https?://*/*' }] });


// --- Blocklist Fetching and Caching Logic ---

async function fetchAndCacheBlocklist() {
  console.log("Fetching and caching blocklist...");
  try {
    // --- SIMULATION ---
    const simulatedFetchedList = [
      "www.some-game-site.com",
      "another-blocked-site.net",
    ];
    // --- END SIMULATION ---

    const cacheData = {
      list: simulatedFetchedList,
      timestamp: Date.now()
    };
    await chrome.storage.local.set({ absoluteBlocklist: cacheData });
    console.log("Blocklist cached successfully:", cacheData);
    return { success: true };
  } catch (error) {
    console.error("Failed to fetch and cache blocklist:", error);
    return { success: false, error: error.message };
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_BLOCKLIST') {
    (async () => {
      const result = await fetchAndCacheBlocklist();
      sendResponse(result);
    })();
    return true; // Indicates asynchronous response
  }
});
