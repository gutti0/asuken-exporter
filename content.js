(function () {
  const num = (s) => Number(String(s || "").replace(/[^\d.-]+/g, ""));
  let lastSavedDate = null;

  function scrape() {
    const dateEl = document.querySelector("#date_pager .center");
    if (!dateEl) return null;

    const dateTxt = dateEl.textContent.trim();
    const dateIso = dateTxt
      .replace(/\(.+\)/, "")
      .replace("年", "-")
      .replace("月", "-")
      .replace("日", "")
      .split("-")
      .map((p) => p.padStart(2, "0"))
      .join("-");

    // 摂取カロリー「今日の値」
    const intakeToday = num(
      document.querySelector("#energy_data_box .today_value")?.textContent || 0
    );

    // 今日の体重・体脂肪率（未入力だと空になる）
    const weight = num(document.querySelector("#BodyWeight")?.value || 0);
    const fat = num(document.querySelector("#BodyBodyFat")?.value || 0);

    const meals = ["breakfast", "lunch", "dinner", "sweets"].map((type) => {
      const sumEl = document.querySelector(
        `#karute_report_${type} .sum_energy`
      );
      const trs = document.querySelectorAll(
        `#karute_report_${type} .detail_table tr`
      );
      return {
        type,
        total_kcal: num(sumEl?.textContent || 0),
        items: [...trs]
          .map((tr) => {
            const [name, qty, kcal] = [...tr.cells].map((td) =>
              td.innerText.trim()
            );
            return { name, quantity: qty, kcal: num(kcal) };
          })
          .filter((item) => item.name),
      };
    });

    return {
      date: dateIso,
      intake_today: intakeToday,
      weight,
      fat_percent: fat,
      meals,
    };
  }

  function tryExport() {
    const data = scrape();
    if (data && data.date !== lastSavedDate) {
      lastSavedDate = data.date;
      chrome.runtime.sendMessage({ type: "save-json", ...data });
    }
  }

  tryExport();
  const observer = new MutationObserver(() => tryExport());
  observer.observe(document.body, { childList: true, subtree: true });
})();
