/**
 * ConnectSell · 공동구매 운영 리포트
 * 숫자 입력 → 자동 계산 · PDF 전용 DOM + 페이지별 저장
 */

(function () {
  "use strict";

  const SAMPLE_ROWS = [
    { date: "05/18", orders: 12, product: 1535000, shipping: 36000 },
    { date: "05/19", orders: 4, product: 352500, shipping: 12000 },
    { date: "05/20", orders: 2, product: 191500, shipping: 6000 },
  ];

  const DEFAULT_NOTICES = [
    "취소/환불 건은 최종 정산 시 반영됩니다.",
    "최종 정산 금액은 브랜드사 기준에 따라 확정됩니다.",
    "정산 예정일은 공구 종료 후 별도 안내드립니다.",
    "문의사항은 언제든 편하게 연락 부탁드립니다.",
    "ConnectSell 허연선 드림 :)",
  ];

  const STORAGE_KEY_SAVED = "connectsell_report_saved_data";
  const STORAGE_KEY_COMMON = "connectsell_report_common_info";
  const DEFAULT_COMMISSION = "10";

  const els = {
    tbody: document.getElementById("daily-tbody"),
    commissionRate: document.getElementById("commission-rate"),
    productName: document.getElementById("product-name"),
    sellerName: document.getElementById("seller-name"),
    campaignPeriod: document.getElementById("campaign-period"),
    writtenDate: document.getElementById("written-date"),
    supplierName: document.getElementById("supplier-name"),
    managerName: document.getElementById("manager-name"),
    settlementDueDate: document.getElementById("settlement-due-date"),
    btnSave: document.getElementById("btn-save"),
    btnNewReport: document.getElementById("btn-new-report"),
    btnPdf: document.getElementById("btn-pdf"),
    btnAddRow: document.getElementById("btn-add-row"),
    btnAddNotice: document.getElementById("btn-add-notice"),
    noticeList: document.getElementById("notice-list"),
    reportRoot: document.getElementById("report-root"),
    subtotalOrders: document.getElementById("subtotal-orders"),
    subtotalProduct: document.getElementById("subtotal-product"),
    subtotalShipping: document.getElementById("subtotal-shipping"),
    subtotalPayment: document.getElementById("subtotal-payment"),
    totalOrders: document.getElementById("total-orders"),
    totalProduct: document.getElementById("total-product"),
    totalShipping: document.getElementById("total-shipping"),
    totalPayment: document.getElementById("total-payment"),
    cardTotalOrders: document.getElementById("card-total-orders"),
    cardTotalSales: document.getElementById("card-total-sales"),
    cardTotalSalesAmount: document.getElementById("card-total-sales-amount"),
    cardTotalSalesWrap: document.getElementById("card-total-sales-wrap"),
    cardSellerSettlementAmount: document.getElementById("card-seller-settlement-amount"),
    cardSellerSettlementWrap: document.getElementById("card-seller-settlement-wrap"),
    summarySection: document.getElementById("summary-section"),
    adjCancel: document.getElementById("adj-cancel-count"),
    adjExchange: document.getElementById("adj-exchange-count"),
    adjReturn: document.getElementById("adj-return-count"),
    cardFinalTotalOrders: document.getElementById("card-final-total-orders"),
    cardFinalCancel: document.getElementById("card-final-cancel"),
    cardFinalExchange: document.getElementById("card-final-exchange"),
    cardFinalReturn: document.getElementById("card-final-return"),
    cardFinalSettlementAmount: document.getElementById("card-final-settlement-amount"),
    cardFinalSettlementWrap: document.getElementById("card-final-settlement-wrap"),
  };

  function parseNumber(val) {
    if (val === "" || val == null) return 0;
    const n = Number(String(val).replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function formatNumber(n) {
    return Math.round(n).toLocaleString("ko-KR");
  }

  function formatWon(n) {
    return formatNumber(n) + "원";
  }

  function formatCount(n) {
    return formatNumber(n) + "건";
  }

  function setMoneyCard(amountEl, wrapEl, amount) {
    const str = formatNumber(amount);
    if (amountEl) {
      amountEl.textContent = str;
      if (wrapEl) wrapEl.dataset.chars = String(str.length);
    }
  }

  function fitMoneyValues() {
    const cards = [
      { wrap: els.cardTotalSalesWrap, amount: els.cardTotalSalesAmount, max: 16, min: 10 },
      { wrap: els.cardSellerSettlementWrap, amount: els.cardSellerSettlementAmount, max: 28, min: 13 },
    ];

    cards.forEach(({ wrap, amount, max, min }) => {
      if (!wrap || !amount) return;
      const row = amount.closest(".summary-card__value--money, .summary-card__value--primary");
      if (!row) return;

      amount.style.fontSize = "";
      const unit = row.querySelector(".value-unit");
      if (unit) unit.style.fontSize = "";

      let size = max;
      amount.style.fontSize = size + "px";
      if (unit) unit.style.fontSize = Math.round(size * 0.88) + "px";

      let guard = 0;
      while (row.scrollWidth > row.clientWidth + 1 && size > min && guard < 24) {
        size -= 1;
        amount.style.fontSize = size + "px";
        if (unit) unit.style.fontSize = Math.round(size * 0.88) + "px";
        guard += 1;
      }
    });
  }

  function formatInputOnBlur(input) {
    const raw = parseNumber(input.value);
    if (input.dataset.type === "orders") {
      input.value = raw > 0 ? String(raw) : "";
    } else if (input.dataset.type === "money") {
      input.value = raw > 0 ? formatNumber(raw) : "";
    }
  }

  function getDefaultProductName() {
    return els.productName.value.trim() || "상품명";
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function updateRowPayment(tr) {
    const inputs = tr.querySelectorAll("input");
    const product = parseNumber(inputs[3].value);
    const shipping = parseNumber(inputs[4].value);
    const total = product + shipping;
    const cell = tr.querySelector("[data-calc='payment']");
    if (cell) cell.textContent = total > 0 ? formatNumber(total) : "—";
  }

  function createRow(data = {}) {
    const tr = document.createElement("tr");
    tr.className = "data-row";
    const productVal = data.product != null ? data.product : data.sales != null ? data.sales : "";
    const shippingVal = data.shipping != null ? data.shipping : "";
    tr.innerHTML = `
      <td class="col-date"><input type="text" class="table-input" data-type="date" placeholder="MM/DD" value="${escapeAttr(data.date || "")}"></td>
      <td class="col-product"><input type="text" class="table-input table-input--product" data-type="product" value="${escapeAttr(data.productName || data.product_label || getDefaultProductName())}"></td>
      <td class="col-num"><input type="text" class="table-input table-input--num" data-type="orders" inputmode="numeric" value="${data.orders != null && data.orders !== "" ? formatNumber(parseNumber(data.orders)) : ""}"></td>
      <td class="col-num"><input type="text" class="table-input table-input--num" data-type="money" data-field="product" inputmode="numeric" value="${productVal !== "" ? formatNumber(parseNumber(productVal)) : ""}"></td>
      <td class="col-num"><input type="text" class="table-input table-input--num" data-type="money" data-field="shipping" inputmode="numeric" value="${shippingVal !== "" ? formatNumber(parseNumber(shippingVal)) : ""}"></td>
      <td class="col-num cell-readonly cell-payment" data-calc="payment">—</td>
    `;
    bindRowEvents(tr);
    updateRowPayment(tr);
    return tr;
  }

  function bindRowEvents(tr) {
    tr.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        updateRowPayment(tr);
        recalculate();
      });
      input.addEventListener("blur", () => {
        formatInputOnBlur(input);
        updateRowPayment(tr);
        recalculate();
      });
    });
  }

  function recalculate() {
    const rows = [...els.tbody.querySelectorAll(".data-row")];
    let sumOrders = 0;
    let sumProduct = 0;
    let sumShipping = 0;
    let sumPayment = 0;

    rows.forEach((tr) => {
      const inputs = tr.querySelectorAll("input");
      sumOrders += parseNumber(inputs[2].value);
      sumProduct += parseNumber(inputs[3].value);
      sumShipping += parseNumber(inputs[4].value);
      sumPayment += parseNumber(inputs[3].value) + parseNumber(inputs[4].value);
      updateRowPayment(tr);
    });

    els.subtotalOrders.textContent = formatNumber(sumOrders);
    els.subtotalProduct.textContent = formatWon(sumProduct);
    els.subtotalShipping.textContent = formatWon(sumShipping);
    els.subtotalPayment.textContent = formatWon(sumPayment);
    els.totalOrders.textContent = formatNumber(sumOrders);
    els.totalProduct.textContent = formatWon(sumProduct);
    els.totalShipping.textContent = formatWon(sumShipping);
    els.totalPayment.textContent = formatWon(sumPayment);

    const rate = parseNumber(els.commissionRate.value);
    const salesBase = sumProduct;
    const commission = Math.round(salesBase * (rate / 100));

    els.cardTotalOrders.textContent = formatCount(sumOrders);
    setMoneyCard(els.cardTotalSalesAmount, els.cardTotalSalesWrap, salesBase);
    setMoneyCard(els.cardSellerSettlementAmount, els.cardSellerSettlementWrap, commission);

    updateFinalSettlementCards(sumOrders, salesBase, commission);
    requestAnimationFrame(fitMoneyValues);
  }

  function readAdjustments() {
    return {
      cancel: parseNumber(els.adjCancel?.value),
      exchange: parseNumber(els.adjExchange?.value),
      return: parseNumber(els.adjReturn?.value),
    };
  }

  function applyAdjustments(adj) {
    if (!adj) return;
    if (els.adjCancel) els.adjCancel.value = adj.cancel > 0 ? formatNumber(adj.cancel) : "0";
    if (els.adjExchange) els.adjExchange.value = adj.exchange > 0 ? formatNumber(adj.exchange) : "0";
    if (els.adjReturn) els.adjReturn.value = adj.return > 0 ? formatNumber(adj.return) : "0";
  }

  /** 최종 정산 리포트 모드용 카드 (data-report-mode="final" 시 표시) */
  function updateFinalSettlementCards(totalOrders, totalPayment, estimatedCommission) {
    const adj = readAdjustments();
    const netOrders = Math.max(0, totalOrders - adj.cancel - adj.exchange - adj.return);
    const rate = parseNumber(els.commissionRate?.value);
    const finalAmount = Math.round(totalPayment * (rate / 100));

    if (els.cardFinalTotalOrders) els.cardFinalTotalOrders.textContent = formatCount(totalOrders);
    if (els.cardFinalCancel) els.cardFinalCancel.textContent = formatCount(adj.cancel);
    if (els.cardFinalExchange) els.cardFinalExchange.textContent = formatCount(adj.exchange);
    if (els.cardFinalReturn) els.cardFinalReturn.textContent = formatCount(adj.return);
    if (els.cardFinalSettlementAmount) {
      setMoneyCard(els.cardFinalSettlementAmount, els.cardFinalSettlementWrap, finalAmount);
    }
    void netOrders;
  }

  function setReportMode(mode) {
    if (!els.summarySection) return;
    const m = mode === "final" ? "final" : "ops";
    els.summarySection.dataset.reportMode = m;
    const panelOps = els.summarySection.querySelector(".summary-panel--ops");
    const panelFinal = els.summarySection.querySelector(".summary-panel--final");
    if (panelOps) panelOps.hidden = m === "final";
    if (panelFinal) panelFinal.hidden = m !== "final";
  }

  function syncProductNames() {
    const name = getDefaultProductName();
    els.tbody.querySelectorAll('[data-type="product"]').forEach((input) => {
      if (!input.dataset.userEdited) input.value = name;
    });
  }

  function createNoticeItem(text, isSign) {
    const li = document.createElement("li");
    if (isSign) li.classList.add("notice-list__sign");
    li.innerHTML = `
      <span class="notice-check" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      </span>
      <textarea class="notice-input" rows="1" placeholder="안내 문구 입력"></textarea>
      <button type="button" class="btn-notice-remove no-print" title="삭제" aria-label="안내 삭제">×</button>
    `;
    const ta = li.querySelector(".notice-input");
    ta.value = text;
    autoResizeNotice(ta);
    ta.addEventListener("input", () => autoResizeNotice(ta));
    li.querySelector(".btn-notice-remove")?.addEventListener("click", () => {
      if (els.noticeList.querySelectorAll("li").length <= 1) return;
      li.remove();
    });
    return li;
  }

  function autoResizeNotice(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  function formatToday() {
    const d = new Date();
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }

  function initNotices(notices) {
    if (!els.noticeList) return;
    const list = notices && notices.length ? notices : DEFAULT_NOTICES.map((text, i) => ({
      text,
      isSign: i === DEFAULT_NOTICES.length - 1,
    }));
    els.noticeList.innerHTML = "";
    list.forEach((item) => {
      const text = typeof item === "string" ? item : item.text;
      const isSign = typeof item === "string" ? false : !!item.isSign;
      els.noticeList.appendChild(createNoticeItem(text, isSign));
    });
  }

  function setDailyRows(rows) {
    els.tbody.innerHTML = "";
    const list = rows && rows.length ? rows : [{ date: "", orders: "", product: "", shipping: "" }];
    list.forEach((row) => els.tbody.appendChild(createRow(row)));
  }

  function initRows() {
    setDailyRows(SAMPLE_ROWS);
  }

  function readCommonInfo() {
    return {
      supplier: els.supplierName?.value?.trim() || "",
      manager: els.managerName?.value?.trim() || "",
    };
  }

  function saveCommonInfo(info) {
    const payload = info || readCommonInfo();
    try {
      localStorage.setItem(STORAGE_KEY_COMMON, JSON.stringify(payload));
    } catch (err) {
      console.warn("공통 정보 저장 실패", err);
    }
  }

  function loadCommonInfo() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_COMMON);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && typeof data === "object") return data;
    } catch (err) {
      console.warn("공통 정보 불러오기 실패", err);
    }
    return null;
  }

  function applyCommonInfoToForm(common) {
    if (!common) return;
    if (els.supplierName && common.supplier != null) els.supplierName.value = common.supplier;
    if (els.managerName && common.manager != null) els.managerName.value = common.manager;
  }

  function collectReportData() {
    const dailyRows = [...els.tbody.querySelectorAll(".data-row")].map((tr) => {
      const inputs = tr.querySelectorAll("input");
      return {
        date: inputs[0]?.value || "",
        productName: inputs[1]?.value || "",
        orders: inputs[2]?.value || "",
        product: inputs[3]?.value || "",
        shipping: inputs[4]?.value || "",
      };
    });

    const stats =
      typeof window.ConnectSellStats !== "undefined" && window.ConnectSellStats.getSavePayload
        ? window.ConnectSellStats.getSavePayload()
        : null;

    return {
      version: 2,
      reportMode: els.summarySection?.dataset.reportMode || "ops",
      savedAt: new Date().toISOString(),
      adjustments: readAdjustments(),
      sellerName: els.sellerName?.value || "",
      productName: els.productName?.value || "",
      campaignPeriod: els.campaignPeriod?.value || "",
      writtenDate: els.writtenDate?.value || "",
      supplierName: els.supplierName?.value || "",
      managerName: els.managerName?.value || "",
      commissionRate: els.commissionRate?.value || "",
      settlementDueDate: els.settlementDueDate?.value || "",
      dailyRows,
      stats,
    };
  }

  function saveReportToStorage(showAlert) {
    const data = collectReportData();
    try {
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(data));
      saveCommonInfo({ supplier: data.supplierName, manager: data.managerName });
      if (showAlert) alert("저장되었습니다.");
      return true;
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.");
      return false;
    }
  }

  function loadReportFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (data && typeof data === "object") return data;
    } catch (err) {
      console.warn("저장 데이터 불러오기 실패", err);
    }
    return null;
  }

  function applyReportData(data) {
    if (!data) return;

    if (els.sellerName) els.sellerName.value = data.sellerName ?? "";
    if (els.productName) els.productName.value = data.productName ?? "";
    if (els.campaignPeriod) els.campaignPeriod.value = data.campaignPeriod ?? "";
    if (els.writtenDate) els.writtenDate.value = data.writtenDate ?? "";
    if (els.supplierName) els.supplierName.value = data.supplierName ?? "";
    if (els.managerName) els.managerName.value = data.managerName ?? "";
    if (els.commissionRate) els.commissionRate.value = data.commissionRate ?? DEFAULT_COMMISSION;
    if (els.settlementDueDate) els.settlementDueDate.value = data.settlementDueDate ?? "";

    applyAdjustments(data.adjustments);
    setReportMode(data.reportMode || "ops");

    setDailyRows(data.dailyRows);

    if (typeof window.ConnectSellStats !== "undefined") {
      if (data.stats) {
        window.ConnectSellStats.applySavePayload(data.stats);
      } else {
        window.ConnectSellStats.clearStats();
      }
    }

    recalculate();
    requestAnimationFrame(fitMoneyValues);
  }

  function applyNewReportDefaults(supplier, manager) {
    if (els.sellerName) els.sellerName.value = "";
    if (els.productName) els.productName.value = "";
    if (els.campaignPeriod) els.campaignPeriod.value = "";
    if (els.writtenDate) els.writtenDate.value = formatToday();
    if (els.supplierName) els.supplierName.value = supplier ?? "";
    if (els.managerName) els.managerName.value = manager ?? "";
    if (els.commissionRate) els.commissionRate.value = DEFAULT_COMMISSION;
    if (els.settlementDueDate) els.settlementDueDate.value = "";

    applyAdjustments({ cancel: 0, exchange: 0, return: 0 });
    setReportMode("ops");

    setDailyRows([{ date: "", orders: "", product: "", shipping: "" }]);

    if (typeof window.ConnectSellStats !== "undefined") {
      window.ConnectSellStats.clearStats();
    }

    recalculate();
    requestAnimationFrame(fitMoneyValues);
  }

  function startNewReport() {
    const ok = confirm(
      "새 리포트를 작성하시겠습니까? 공급사와 담당자를 제외한 입력값이 초기화됩니다."
    );
    if (!ok) return;

    const supplier = els.supplierName?.value?.trim() || "";
    const manager = els.managerName?.value?.trim() || "";

    applyNewReportDefaults(supplier, manager);
    saveCommonInfo({ supplier, manager });
    saveReportToStorage(false);
  }

  const PDF_BTN_HTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <polyline points="9 15 12 18 15 15"/>
        </svg>
        PDF 저장`;

  function bindGlobalEvents() {
    els.commissionRate.addEventListener("input", recalculate);
    els.commissionRate.addEventListener("blur", () => {
      const v = parseNumber(els.commissionRate.value);
      els.commissionRate.value = v > 0 ? String(v) : "";
      recalculate();
    });

    els.productName.addEventListener("input", () => {
      syncProductNames();
      recalculate();
    });

    els.tbody.addEventListener("focusin", (e) => {
      const t = e.target;
      if (t instanceof HTMLInputElement && t.dataset.type === "product") {
        t.dataset.userEdited = "1";
      }
    });

    els.btnAddRow.addEventListener("click", () => {
      els.tbody.appendChild(createRow({ productName: getDefaultProductName() }));
      recalculate();
    });

    document.querySelectorAll(".info-input").forEach((input) => {
      input.addEventListener("input", () => {
        if (input.id === "commission-rate") recalculate();
      });
    });

    els.btnSave?.addEventListener("click", () => saveReportToStorage(true));
    els.btnNewReport?.addEventListener("click", startNewReport);
    els.btnPdf.addEventListener("click", exportPdf);

    [els.adjCancel, els.adjExchange, els.adjReturn].forEach((input) => {
      input?.addEventListener("input", recalculate);
      input?.addEventListener("blur", () => {
        const raw = parseNumber(input.value);
        input.value = raw > 0 ? formatNumber(raw) : "0";
        recalculate();
      });
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(fitMoneyValues, 100);
    });
  }

  function buildPdfFilename() {
    const seller = (els.sellerName.value || "셀러").replace(/[@\\/:*?"<>|]/g, "").trim();
    const period = (els.campaignPeriod.value || "공구기간")
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, "")
      .trim();
    return `공동구매_운영리포트_${seller}_${period}.pdf`;
  }

  const PDF_PAGE_W = 794;
  const PDF_PAGE_H = 1123;

  function hasStatsForPdf() {
    return window.ConnectSellStats?.getSavePayload?.() != null;
  }

  function stripNoPrint(root) {
    root.querySelectorAll(".no-print").forEach((el) => el.remove());
  }

  function replaceInputsWithPlainText(root) {
    root.querySelectorAll("input, textarea, select").forEach((input) => {
      const span = document.createElement("span");
      span.className = "pdf-plain-text";
      if (input.tagName === "SELECT") {
        span.textContent = input.options[input.selectedIndex]?.text || input.value;
      } else {
        span.textContent = input.value;
      }
      input.replaceWith(span);
    });
  }

  function prepareNodeForPdfCapture(source) {
    const clone = source.cloneNode(true);
    stripNoPrint(clone);
    replaceInputsWithPlainText(clone);
    return clone;
  }

  function buildPdfCaptureFromScreen() {
    const host = document.createElement("div");
    host.id = "pdf-export-host";
    host.style.width = `${PDF_PAGE_W}px`;
    const pages = [];

    const header = document.querySelector(".report-header");
    const page1Source = document.querySelector(".report-page-1");
    if (header && page1Source) {
      const page1 = document.createElement("div");
      page1.className = "pdf-capture-page pdf-capture-page--1";
      page1.style.width = `${PDF_PAGE_W}px`;
      page1.appendChild(prepareNodeForPdfCapture(header));
      page1.appendChild(prepareNodeForPdfCapture(page1Source));
      host.appendChild(page1);
      pages.push(page1);
    }

    if (hasStatsForPdf()) {
      const statsSource = document.querySelector(".statistics-section");
      if (statsSource) {
        const page2 = document.createElement("div");
        page2.className = "pdf-capture-page pdf-capture-page--2";
        page2.style.width = `${PDF_PAGE_W}px`;
        const statsClone = prepareNodeForPdfCapture(statsSource);
        statsClone.querySelector("#stats-empty")?.remove();
        const statsContent = statsClone.querySelector("#stats-content");
        if (statsContent) statsContent.hidden = false;
        page2.appendChild(statsClone);
        host.appendChild(page2);
        pages.push(page2);
      }
    }

    return { host, pages };
  }

  function measurePdfPageHeight(pageEl) {
    return Math.max(1, Math.ceil(pageEl.getBoundingClientRect().height));
  }

  async function exportPdf() {
    const jsPDFCtor = window.jspdf?.jsPDF;
    const html2canvasFn = window.html2canvas;
    if (!jsPDFCtor || !html2canvasFn) {
      alert("PDF 라이브러리를 불러오지 못했습니다. 인터넷 연결 후 다시 시도해 주세요.");
      return;
    }

    const btn = els.btnPdf;
    btn.disabled = true;
    btn.textContent = "PDF 생성 중…";
    document.body.classList.add("pdf-exporting");

    recalculate();

    const { host, pages } = buildPdfCaptureFromScreen();
    if (!pages.length) {
      alert("PDF로 저장할 내용이 없습니다.");
      btn.disabled = false;
      btn.innerHTML = PDF_BTN_HTML;
      document.body.classList.remove("pdf-exporting");
      return;
    }

    document.body.appendChild(host);

    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const pageHeights = pages.map((p) => measurePdfPageHeight(p));
    const pdf = new jsPDFCtor({
      unit: "px",
      format: [PDF_PAGE_W, pageHeights[0] || PDF_PAGE_H],
      orientation: "portrait",
      hotfixes: ["px_scaling"],
    });

    try {
      for (let i = 0; i < pages.length; i++) {
        const captureH = pageHeights[i] || PDF_PAGE_H;
        if (i > 0) pdf.addPage([PDF_PAGE_W, captureH], "p");
        const canvas = await html2canvasFn(pages[i], {
          scale: 2,
          width: PDF_PAGE_W,
          height: captureH,
          windowWidth: PDF_PAGE_W,
          windowHeight: captureH,
          scrollX: 0,
          scrollY: 0,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        const img = canvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(img, "JPEG", 0, 0, PDF_PAGE_W, captureH);
      }
      pdf.save(buildPdfFilename());
    } catch (err) {
      console.error(err);
      alert("PDF 저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      host.remove();
      document.body.classList.remove("pdf-exporting");
      btn.disabled = false;
      btn.innerHTML = PDF_BTN_HTML;
    }
  }

  function init() {
    if (window.REPORT_PRESET) {
      try {
        localStorage.removeItem(STORAGE_KEY_SAVED);
      } catch (err) {
        console.warn("저장 데이터 초기화 실패", err);
      }
      applyReportData(window.REPORT_PRESET);
    } else {
      const saved = loadReportFromStorage();
      if (saved) {
        applyReportData(saved);
      } else {
        const common = loadCommonInfo();
        if (common) applyCommonInfoToForm(common);
        initRows();
      }
    }

    setReportMode(els.summarySection?.dataset.reportMode || "ops");

    bindGlobalEvents();
    recalculate();
    requestAnimationFrame(fitMoneyValues);

    if (new URLSearchParams(window.location.search).get("autopdf") === "1") {
      setTimeout(() => exportPdf(), 800);
    }
  }

  window.ConnectSellReport = {
    setReportMode,
    readAdjustments,
    saveReportToStorage,
    collectReportData,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
