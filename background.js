chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Ignore sub-frame navigations
  if (details.frameId !== 0) {
    return;
  }

  // Avoid redirection loops
  const warningUrl = chrome.runtime.getURL("warning.html");
  if (details.url.startsWith(warningUrl)) {
    return;
  }

  // Redirect the tab to the warning page, passing the original URL as a query parameter
  const originalUrl = encodeURIComponent(details.url);
  chrome.tabs.update(details.tabId, {
    url: `${warningUrl}?originalUrl=${originalUrl}`
  });
}, { url: [{ urlMatches: 'https?://*/*' }] });
