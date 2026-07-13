chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ settings: { reputationChecks: false } });
});
