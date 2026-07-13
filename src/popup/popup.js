const checkbox = document.querySelector("#reputation");
chrome.storage.local.get("settings", ({ settings }) => { checkbox.checked = Boolean(settings?.reputationChecks); });
checkbox.addEventListener("change", () => chrome.storage.local.set({ settings: { reputationChecks: checkbox.checked } }));
