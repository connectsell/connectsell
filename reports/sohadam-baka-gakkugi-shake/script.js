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

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pdfVal(s) {
    const t = String(s ?? "").trim();
    return t ? escapeHtml(t) : "—";
  }

  function formatPctPdf(n) {
    const v = Math.round(Number(n) * 10) / 10;
    const s = Number.isInteger(v) ? String(v) : v.toFixed(1);
    return s + "%";
  }

  function hasStatsForPdf() {
    return window.ConnectSellStats?.getSavePayload?.() != null;
  }

  function collectDailyRowsForPdf() {
    return [...els.tbody.querySelectorAll(".data-row")].map((tr) => {
      const inputs = tr.querySelectorAll("input");
      const product = parseNumber(inputs[3].value);
      const shipping = parseNumber(inputs[4].value);
      const payment = product + shipping;
      return {
        date: inputs[0].value.trim(),
        productName: inputs[1].value.trim() || getDefaultProductName(),
        orders: parseNumber(inputs[2].value),
        product,
        shipping,
        payment,
      };
    });
  }

  function buildPdfPage1Html() {
    const rows = collectDailyRowsForPdf();
    const rate = els.commissionRate.value.trim();
    const rateLabel = rate ? `${pdfVal(rate)}%` : "—";

    const tableBody = rows
      .map(
        (r) => `
      <tr>
        <td>${pdfVal(r.date)}</td>
        <td>${pdfVal(r.productName)}</td>
        <td class="num">${r.orders > 0 ? formatNumber(r.orders) : "—"}</td>
        <td class="num">${r.product > 0 ? formatNumber(r.product) : "—"}</td>
        <td class="num">${r.shipping > 0 ? formatNumber(r.shipping) : "—"}</td>
        <td class="num">${r.payment > 0 ? formatNumber(r.payment) : "—"}</td>
      </tr>`
      )
      .join("");

    const cancelN = parseNumber(els.adjCancel?.value);
    const exchangeN = parseNumber(els.adjExchange?.value);
    const returnN = parseNumber(els.adjReturn?.value);

    return `
    <section class="pdf-page page-1">
      <header class="pdf-header">
        <p class="pdf-header__eyebrow">CONNECTSELL · 공동구매 운영 리포트</p>
        <h1 class="pdf-header__title">공동구매 운영 리포트</h1>
      </header>

      <div class="pdf-page__fill">
      <div class="pdf-sec pdf-sec--basic">
        <h2 class="pdf-sec__title">기본 정보</h2>
        <div class="pdf-info-grid">
          <div class="pdf-info-field"><span class="pdf-info-field__label">셀러명</span><span class="pdf-info-field__value">${pdfVal(els.sellerName.value)}</span></div>
          <div class="pdf-info-field"><span class="pdf-info-field__label">상품명</span><span class="pdf-info-field__value">${pdfVal(els.productName.value)}</span></div>
          <div class="pdf-info-field"><span class="pdf-info-field__label">공구 기간</span><span class="pdf-info-field__value">${pdfVal(els.campaignPeriod.value)}</span></div>
          <div class="pdf-info-field"><span class="pdf-info-field__label">작성일</span><span class="pdf-info-field__value">${pdfVal(els.writtenDate.value)}</span></div>
          <div class="pdf-info-field"><span class="pdf-info-field__label">공급사</span><span class="pdf-info-field__value">${pdfVal(els.supplierName.value)}</span></div>
          <div class="pdf-info-field"><span class="pdf-info-field__label">담당자</span><span class="pdf-info-field__value">${pdfVal(els.managerName.value)}</span></div>
          <div class="pdf-info-field pdf-info-field--hl"><span class="pdf-info-field__label">셀러 수수료율</span><span class="pdf-info-field__value">${rateLabel}</span></div>
          <div class="pdf-info-field"><span class="pdf-info-field__label">정산 예정일</span><span class="pdf-info-field__value">${pdfVal(els.settlementDueDate?.value)}</span></div>
        </div>
      </div>

      <div class="pdf-sec pdf-sec--orders">
        <h2 class="pdf-sec__title">일자별 주문내역</h2>
        <table class="pdf-table pdf-table--orders">
          <thead>
            <tr>
              <th style="width:12%">일자</th>
              <th style="width:28%">상품명</th>
              <th class="num" style="width:12%">주문건수</th>
              <th class="num" style="width:16%">상품금액</th>
              <th class="num" style="width:14%">배송비</th>
              <th class="num" style="width:18%">결제금액</th>
            </tr>
          </thead>
          <tbody>${tableBody}</tbody>
          <tfoot>
            <tr class="row-sub">
              <td colspan="2">소계</td>
              <td class="num">${els.subtotalOrders.textContent}</td>
              <td class="num">${els.subtotalProduct.textContent.replace(/원$/, "")}</td>
              <td class="num">${els.subtotalShipping.textContent.replace(/원$/, "")}</td>
              <td class="num">${els.subtotalPayment.textContent.replace(/원$/, "")}</td>
            </tr>
            <tr class="row-total">
              <td colspan="2">합계</td>
              <td class="num">${els.totalOrders.textContent}</td>
              <td class="num">${els.totalProduct.textContent.replace(/원$/, "")}</td>
              <td class="num">${els.totalShipping.textContent.replace(/원$/, "")}</td>
              <td class="num">${els.totalPayment.textContent.replace(/원$/, "")}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="pdf-sec pdf-sec--summary">
        <h2 class="pdf-sec__title">주문 상태 및 정산 요약</h2>
        <p class="pdf-sec__sub">본사 링크 공구 진행 시, 공구 기간 동안의 주문·취소·교환·반품 현황과 예상 정산 금액을 함께 확인할 수 있습니다.</p>
        <p class="pdf-summary-row-title">주문 상태 요약</p>
        <div class="pdf-summary-grid pdf-summary-grid--4">
          <div class="pdf-summary-card"><p class="pdf-summary-card__label">총 주문건수</p><p class="pdf-summary-card__value">${escapeHtml(els.cardTotalOrders.textContent)}</p></div>
          <div class="pdf-summary-card"><p class="pdf-summary-card__label">취소건수</p><p class="pdf-summary-card__value">${formatNumber(cancelN)}건</p></div>
          <div class="pdf-summary-card"><p class="pdf-summary-card__label">교환건수</p><p class="pdf-summary-card__value">${formatNumber(exchangeN)}건</p></div>
          <div class="pdf-summary-card"><p class="pdf-summary-card__label">반품건수</p><p class="pdf-summary-card__value">${formatNumber(returnN)}건</p></div>
        </div>
        <p class="pdf-summary-row-title">정산 요약</p>
        <div class="pdf-summary-grid pdf-summary-grid--2">
          <div class="pdf-summary-card"><p class="pdf-summary-card__label">총 매출액</p><p class="pdf-summary-card__value">${escapeHtml(els.cardTotalSalesAmount.textContent)}원</p></div>
          <div class="pdf-summary-card pdf-summary-card--primary"><p class="pdf-summary-card__label">예상 셀러 정산금액</p><p class="pdf-summary-card__value">${escapeHtml(els.cardSellerSettlementAmount.textContent)}원</p></div>
        </div>
        <p class="pdf-disclaimer">※ 정산금액은 취소/교환/반품 및 환불건에 따라 최종 금액이 변동될 수 있습니다.</p>
      </div>
      </div>
    </section>`;
  }

  function buildPdfPage2Html(stats) {
    const hasComp = !!(stats.compositions && stats.compositions.length);
    const hasFlavor = !!(stats.flavors && stats.flavors.length);
    const hasOptionStats = hasComp || hasFlavor;
    const aovText = stats.aov > 0 ? formatWon(stats.aov) : "—";

    let kpiBestComp = "—";
    let kpiBestCompMeta = "—";
    if (stats.bestComp && hasComp) {
      kpiBestComp = escapeHtml(stats.bestComp.name);
      kpiBestCompMeta = `${formatNumber(stats.bestComp.qty)}개 · ${formatPctPdf(stats.bestComp.share)}`;
    } else if (!hasOptionStats) {
      kpiBestCompMeta = "옵션 데이터 없음";
    }

    let kpiBestFlavor = "—";
    let kpiBestFlavorMeta = "—";
    if (stats.bestFlavor && hasFlavor) {
      kpiBestFlavor = escapeHtml(stats.bestFlavor.name);
      kpiBestFlavorMeta = `${formatNumber(stats.bestFlavor.qty)}개 · ${formatPctPdf(stats.bestFlavor.share)}`;
    } else if (!hasOptionStats) {
      kpiBestFlavorMeta = "옵션 데이터 없음";
    }

    const insightText = buildPdfInsightText(stats);
    const insightBlock = insightText
      ? `<div class="pdf-sec pdf-sec--insight"><h3 class="pdf-sec__title">운영 인사이트</h3><p class="pdf-insight-box">${escapeHtml(insightText)}</p></div>`
      : "";

    const compRows = hasComp
      ? stats.compositions
          .slice(0, 8)
          .map(
            (c, i) => `
        <tr>
          <td>${escapeHtml(c.name)}${i === 0 ? '<span class="pdf-badge">BEST</span>' : ""}</td>
          <td class="num">${formatNumber(c.qty)}</td>
          <td class="num">${formatNumber(c.payment)}</td>
          <td class="num">${formatPctPdf(c.share)}</td>
        </tr>`
          )
          .join("")
      : "";

    const flavorRows = hasFlavor
      ? stats.flavors
          .slice(0, 8)
          .map(
            (f, i) => `
        <tr>
          <td>${escapeHtml(f.name)}${i === 0 ? '<span class="pdf-badge">BEST</span>' : ""}</td>
          <td class="num">${formatNumber(f.qty)}</td>
          <td class="num">${formatPctPdf(f.share)}</td>
        </tr>`
          )
          .join("")
      : "";

    const compBlockInner = hasComp
      ? `<div class="pdf-sec pdf-sec--half"><h3 class="pdf-sec__title">구성별 판매비중</h3>
        <table class="pdf-table pdf-mini-table"><thead><tr><th>구성명</th><th class="num">판매수량</th><th class="num">매출액</th><th class="num">판매비중</th></tr></thead><tbody>${compRows}</tbody></table></div>`
      : "";

    const flavorBlockInner = hasFlavor
      ? `<div class="pdf-sec pdf-sec--half"><h3 class="pdf-sec__title">맛별 인기순위</h3>
        <table class="pdf-table pdf-mini-table"><thead><tr><th>맛</th><th class="num">판매수량</th><th class="num">판매비중</th></tr></thead><tbody>${flavorRows}</tbody></table></div>`
      : "";

    const tablesBlock =
      compBlockInner || flavorBlockInner
        ? `<div class="pdf-tables-duo">${compBlockInner}${flavorBlockInner}</div>`
        : "";

    let campaignBlock = "";
    if (stats.hasCampaignDaily && stats.campaignDaily?.length) {
      const cards = stats.campaignDaily
        .map(
          (d) => `
        <article class="pdf-campaign-card${d.isPeak ? " is-peak" : ""}">
          <p class="pdf-campaign-card__date">${escapeHtml(d.date)}</p>
          <p class="pdf-campaign-card__line">주문 ${formatNumber(d.orders)}건</p>
          <p class="pdf-campaign-card__line">매출 ${formatNumber(d.payment)}원</p>
          <p class="pdf-campaign-card__line">${formatPctPdf(d.share)}</p>
        </article>`
        )
        .join("");
      campaignBlock = `<div class="pdf-sec pdf-sec--campaign">
        <h3 class="pdf-sec__title">공구 기간별 주문 추이</h3>
        <div class="pdf-campaign-grid">${cards}</div>
      </div>`;
    }

    let bestDayBlock = "";
    if (stats.hasCampaignDaily && stats.bestDay) {
      const best = stats.bestDay;
      bestDayBlock = `<div class="pdf-sec pdf-sec--best-day">
        <h3 class="pdf-sec__title">최고 성과일</h3>
        <div class="pdf-best-day pdf-best-day--hero">
          <span class="pdf-kpi__badge">BEST DAY</span>
          <div class="pdf-best-day__grid">
            <div class="pdf-best-day__metric">
              <p class="pdf-best-day__label">날짜</p>
              <p class="pdf-best-day__value pdf-best-day__value--date">${escapeHtml(best.date)}</p>
            </div>
            <div class="pdf-best-day__metric">
              <p class="pdf-best-day__label">주문건수</p>
              <p class="pdf-best-day__value">${formatNumber(best.orders)}건</p>
            </div>
            <div class="pdf-best-day__metric">
              <p class="pdf-best-day__label">매출액</p>
              <p class="pdf-best-day__value">${formatNumber(best.payment)}원</p>
            </div>
            <div class="pdf-best-day__metric">
              <p class="pdf-best-day__label">전체 매출 비중</p>
              <p class="pdf-best-day__value">${formatPctPdf(best.share)}</p>
            </div>
          </div>
        </div>
      </div>`;
    }

    let hourlyBlock = "";
    if (stats.hasHourly && stats.hourly && stats.hourly.length) {
      const slots = stats.hourly;
      const maxShare = Math.max(...slots.map((s) => s.share), 1);
      const peak = slots.find((s) => s.isPeak && s.orders > 0);
      const peakLabel = peak ? `<p class="pdf-peak-label">🔥 주문 집중 시간: ${escapeHtml(peak.label)}</p>` : "";
      const bars = slots
        .map((s) => {
          const pct = s.orders > 0 ? Math.max(6, Math.round((s.share / maxShare) * 100)) : 0;
          return `
          <div class="pdf-hourly-row${s.isPeak ? " is-peak" : ""}">
            <span class="pdf-hourly-label">${escapeHtml(s.label)}</span>
            <div class="pdf-hourly-track"><div class="pdf-hourly-fill" style="width:${pct}%"></div></div>
            <span class="pdf-hourly-meta">${formatNumber(s.orders)}건 · ${formatPctPdf(s.share)}</span>
          </div>`;
        })
        .join("");

      hourlyBlock = `<div class="pdf-sec pdf-sec--hourly pdf-sec--hourly-sub">
        <h3 class="pdf-sec__title">시간대별 주문 분포</h3>
        ${peakLabel}
        <div class="pdf-hourly-bars pdf-hourly-bars--compact">${bars}</div>
      </div>`;
    }

    const optionsNote =
      !hasOptionStats && stats.hasHourly
        ? `<p class="pdf-sec__sub">구성별 판매비중 및 맛별 분석은 옵션 데이터가 없어 표시할 수 없습니다.</p>`
        : "";

    return `
    <section class="pdf-page page-2">
      <header class="pdf-header">
        <p class="pdf-header__eyebrow">CONNECTSELL · 공동구매 운영 리포트</p>
        <h1 class="pdf-header__title">공동구매 운영 결과</h1>
      </header>
      <div class="pdf-page-2__main">
      <div class="pdf-stats-body">
        <p class="pdf-sec__sub">공구 기간 주문·매출 요약 및 핵심 운영 인사이트</p>
        ${optionsNote}
        <div class="pdf-kpi-row pdf-kpi-row--main">
          <div class="pdf-kpi pdf-kpi--aov">
            <p class="pdf-kpi__label">객단가</p>
            <p class="pdf-kpi__value">${escapeHtml(aovText)}</p>
          </div>
          <div class="pdf-kpi">
            <span class="pdf-kpi__badge">BEST 구성</span>
            <p class="pdf-kpi__name">${kpiBestComp}</p>
            <p class="pdf-kpi__meta">${kpiBestCompMeta}</p>
          </div>
          <div class="pdf-kpi">
            <span class="pdf-kpi__badge">BEST 맛</span>
            <p class="pdf-kpi__name">${kpiBestFlavor}</p>
            <p class="pdf-kpi__meta">${kpiBestFlavorMeta}</p>
          </div>
        </div>
        ${insightBlock}
        ${campaignBlock}
        ${bestDayBlock}
        ${tablesBlock}
        ${hourlyBlock}
      </div>
      </div>
      <footer class="pdf-footer pdf-footer--page2">
        <p class="pdf-footer__brand">ConnectSell</p>
        <p class="pdf-footer__url">connectsell.co.kr</p>
      </footer>
    </section>`;
  }

  function buildPdfInsightText(stats) {
    if (stats.customInsight) return stats.customInsight;
    if (stats.bestComp && stats.bestFlavor) {
      return `「${stats.bestComp.name}」 구성(비중 ${formatPctPdf(stats.bestComp.share)})과 「${stats.bestFlavor.name}」 맛(비중 ${formatPctPdf(stats.bestFlavor.share)})이 가장 인기였습니다. 다음 공구에서는 해당 옵션을 전면에 내세우는 것을 권장합니다.`;
    }
    return "";
  }

  function buildPdfExportDocument() {
    const container = document.createElement("div");
    container.className = "report-container";

    const root = document.createElement("div");
    root.id = "pdf-export";
    let html = buildPdfPage1Html();
    if (hasStatsForPdf()) {
      const stats = window.ConnectSellStats.getLastStats();
      html += buildPdfPage2Html(stats);
    }
    root.innerHTML = html;
    container.appendChild(root);
    return container;
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

    const host = document.createElement("div");
    host.id = "pdf-export-host";
    host.appendChild(buildPdfExportDocument());
    document.body.appendChild(host);

    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const pages = host.querySelectorAll(".pdf-page");
    const pdf = new jsPDFCtor({
      unit: "px",
      format: [PDF_PAGE_W, PDF_PAGE_H],
      orientation: "portrait",
      hotfixes: ["px_scaling"],
    });

    try {
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage([PDF_PAGE_W, PDF_PAGE_H], "p");
        const canvas = await html2canvasFn(pages[i], {
          scale: 2,
          width: PDF_PAGE_W,
          height: PDF_PAGE_H,
          windowWidth: PDF_PAGE_W,
          windowHeight: PDF_PAGE_H,
          scrollX: 0,
          scrollY: 0,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });
        const img = canvas.toDataURL("image/jpeg", 0.92);
        pdf.addImage(img, "JPEG", 0, 0, PDF_PAGE_W, PDF_PAGE_H);
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
