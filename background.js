chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "save-json" && msg.date) {
    const filename = `asken_${msg.date.replace(/-/g, "")}.json`;
    const blob = new Blob([JSON.stringify(msg, null, 2)], {
      type: "application/json",
    });
    const reader = new FileReader();
    reader.onload = () => {
      chrome.downloads.download({
        url: reader.result,
        filename,
        conflictAction: "overwrite",
      });
    };
    reader.readAsDataURL(blob); // Service Worker では createObjectURL できないため
  }
});
