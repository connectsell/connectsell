/**
 * ConnectSell · 공동구매 통계 분석 (스룩페이 옵션 엑셀)
 */
(function () {
  "use strict";
  const HOUR_SLOTS = [
    { label: "00~03시", start: 0 },
    { label: "03~06시", start: 3 },
    { label: "06~09시", start: 6 },
    { label: "09~12시", start: 9 },
    { label: "12~15시", start: 12 },
    { label: "15~18시", start: 15 },
    { label: "18~21시", start: 18 },
    { label: "21~24시", start: 21 },
  ];
  const els = {
    fileInput: document.getElementById("stats-file-input"),
    fileName: document.getElementById("stats-file-name"),
    empty: document.getElementById("stats-empty"),
    content: document.getElementById("stats-content"),
    compTbody: document.getElementById("stats-comp-tbody"),
    flavorTbody: document.getElementById("stats-flavor-tbody"),
    hourlyBlock: document.getElementById("stats-hourly-block"),
    hourlyBody: document.getElementById("stats-hourly-body"),
    hourlyBars: document.getElementById("stats-hourly-bars"),
    hourlyPeakLabel: document.getElementById("stats-hourly-peak-label"),
    hourlyInsight: document.getElementById("stats-hourly-insight"),
    aovAmount: document.getElementById("stats-aov-amount"),
    bestCompName: document.getElementById("stats-best-comp-name"),
    bestCompQty: document.getElementById("stats-best-comp-qty"),
    bestCompShare: document.getElementById("stats-best-comp-share"),
    bestFlavorName: document.getElementById("stats-best-flavor-name"),
    bestFlavorQty: document.getElementById("stats-best-flavor-qty"),
    bestFlavorShare: document.getElementById("stats-best-flavor-share"),
    insight: document.getElementById("stats-insight"),
    optionsUnavailable: document.getElementById("stats-options-unavailable"),
    compBlock: document.getElementById("stats-comp-block"),
    flavorBlock: document.getElementById("stats-flavor-block"),
    kpiBlock: document.getElementById("stats-kpi-block"),
    insightBlock: document.getElementById("stats-insight-block"),
  };

  const MSG_NO_OPTIONS =
    "구성별 판매비중 및 맛별 분석은 옵션 데이터가 없어 표시할 수 없습니다.";

  /** @type {{ optionStats: object|null, timeStats: object|null, optionFileName: string, timeFileName: string }} */
  const statsStore = {
    optionStats: null,
    timeStats: null,
    optionFileName: "",
    timeFileName: "",
  };

  let lastStats = null;
  function looksLikeDateOrOrderText(s) {
    if (/주문일|입금일|결제일|주문번호|주문일시/i.test(s)) return true;
    if (/\d{4}[-./]\d{1,2}[-./]\d{1,2}/.test(s)) return true;
    if (/^SKA\d+/i.test(s)) return true;
    if (/\d{1,2}:\d{2}/.test(s)) return true;
    return false;
  }

  function parseNumber(val) {
    if (val === "" || val == null) return 0;
    const s = String(val).trim();
    if (!s || looksLikeDateOrOrderText(s)) return 0;

    const wonMatch = s.match(/([\d,]+)\s*원/);
    if (wonMatch) {
      const n = Number(wonMatch[1].replace(/,/g, ""));
      return Number.isFinite(n) && n > 0 && n < 1e8 ? n : 0;
    }

    if (!/^[\d,.\s]+$/.test(s)) return 0;
    const n = Number(s.replace(/,/g, ""));
    if (!Number.isFinite(n) || n <= 0 || n >= 1e8) return 0;
    return Math.round(n);
  }
  function formatNumber(n) {
    return Math.round(n).toLocaleString("ko-KR");
  }
  function formatWon(n) {
    return formatNumber(n) + "원";
  }
  function formatPct(n) {
    const v = Math.round(n * 10) / 10;
    return (Number.isInteger(v) ? String(v) : v.toFixed(1)) + "%";
  }
  function pad2(n) {
    return String(n).padStart(2, "0");
  }
  function normalizeHeader(h) {
    return String(h || "")
      .replace(/\s+/g, "")
      .trim()
      .toLowerCase();
  }
  function findColumnIndex(headers, candidates) {
    const norm = headers.map(normalizeHeader);
    for (const c of candidates) {
      const i = norm.findIndex((h) => h.includes(normalizeHeader(c)) || normalizeHeader(c).includes(h));
      if (i >= 0) return i;
    }
    return -1;
  }
  function hourToSlotIndex(hour) {
    if (!Number.isFinite(hour) || hour < 0 || hour > 23) return -1;
    return Math.min(7, Math.floor(hour / 3));
  }
  function parseComposition(optionName) {
    if (!optionName) return "기타";
    const seg = String(optionName).split("/")[0].trim();
    const patterns = [
      /\d+\+\d+팩(?:\([^)]*\))?/,
      /\d+팩(?:\([^)]*\))?/,
      /\d+세트(?:\([^)]*\))?/,
    ];
    for (const p of patterns) {
      const m = seg.match(p);
      if (m) return m[0];
    }
    const beforePlus = seg.split("+")[0].trim();
    return beforePlus || seg.slice(0, 40);
  }
  function parseFlavors(optionName) {
    const text = String(optionName);
    const flavorZone = text.includes("/") ? text.split("/").slice(1).join("/") : text;
    const items = [];
    const re = /([가-힣A-Za-z]+맛)\s*(\d+)\s*팩?/g;
    let m;
    while ((m = re.exec(flavorZone)) !== null) {
      items.push({ name: m[1], qty: parseInt(m[2], 10) || 1 });
    }
    if (!items.length) {
      const names = flavorZone.match(/[가-힣]{2,}맛/g);
      if (names) names.forEach((n) => items.push({ name: n, qty: 1 }));
    }
    return items;
  }
  function isOptionRow(optionVal) {
    if (!optionVal) return false;
    const s = String(optionVal).trim();
    if (/^SKA\d+/i.test(s)) return false;
    return s.includes("/") || /팩|세트|맛/.test(s);
  }
  function parseDateVal(val) {
    if (!val) return null;
    const s = String(val).trim();
    const m = s.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
    if (m) return `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`;
    const m2 = s.match(/(\d{1,2})[-./](\d{1,2})/);
    if (m2) return `2026-${pad2(m2[1])}-${pad2(m2[2])}`;
    return null;
  }
  function parseHourFromString(s) {
    const ampm = s.match(/(오전|오후)\s*(\d{1,2})\s*시/);
    if (ampm) {
      let h = parseInt(ampm[2], 10);
      if (ampm[1] === "오후" && h < 12) h += 12;
      if (ampm[1] === "오전" && h === 12) h = 0;
      return h >= 0 && h <= 23 ? h : null;
    }
    const m24 = s.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (m24) {
      const h = parseInt(m24[1], 10);
      return h >= 0 && h <= 23 ? h : null;
    }
    const mHangul = s.match(/(\d{1,2})\s*시\s*(\d{1,2})?\s*분?/);
    if (mHangul) {
      const h = parseInt(mHangul[1], 10);
      return h >= 0 && h <= 23 ? h : null;
    }
    return null;
  }

  /** 문자열·셀 본문에서 주문일시 추출 (주문번호/입금일 등 혼합 텍스트 지원) */
  function extractDateTimeFromText(text) {
    const s = String(text || "").replace(/\r\n/g, "\n");
    if (!s.trim()) return { date: null, hour: null };

    const labeled = [
      /주문일\s*(\d{4})[-./](\d{1,2})[-./](\d{1,2})[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?/i,
      /주문일시\s*(\d{4})[-./](\d{1,2})[-./](\d{1,2})[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?/i,
      /(?:결제일|입금일)\s*(\d{4})[-./](\d{1,2})[-./](\d{1,2})[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?/i,
      /(\d{4})[-./](\d{1,2})[-./](\d{1,2})[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?/,
    ];
    for (const re of labeled) {
      const m = s.match(re);
      if (m) {
        const hour = parseInt(m[4], 10);
        return {
          date: `${m[1]}-${pad2(m[2])}-${pad2(m[3])}`,
          hour: hour >= 0 && hour <= 23 ? hour : null,
        };
      }
    }

    const dateOnly = s.match(/주문일\s*(\d{4})[-./](\d{1,2})[-./](\d{1,2})/i);
    if (dateOnly) {
      return {
        date: `${dateOnly[1]}-${pad2(dateOnly[2])}-${pad2(dateOnly[3])}`,
        hour: parseHourFromString(s),
      };
    }

    const hour = parseHourFromString(s);
    const date = parseDateVal(s);
    if (hour != null) return { date, hour };
    return { date, hour: null };
  }

  function parseDateTimeVal(val) {
    if (val == null || val === "") return { date: null, hour: null };

    if (val instanceof Date && !Number.isNaN(val.getTime())) {
      return {
        date: `${val.getFullYear()}-${pad2(val.getMonth() + 1)}-${pad2(val.getDate())}`,
        hour: val.getHours(),
      };
    }

    if (typeof val === "number" && Number.isFinite(val) && val > 1) {
      const whole = Math.floor(val);
      const frac = val - whole;
      const ms = (whole - 25569) * 86400 * 1000;
      const d = new Date(ms);
      if (!Number.isNaN(d.getTime())) {
        const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        if (frac > 0.00001) {
          let hour = Math.floor(frac * 24 + 1e-9);
          if (hour >= 24) hour = 0;
          return { date, hour };
        }
        return { date, hour: null };
      }
    }

    const embedded = extractDateTimeFromText(val);
    if (embedded.hour != null || embedded.date) return embedded;

    const s = String(val).trim();
    const hour = parseHourFromString(s);
    const date = parseDateVal(s);
    if (hour != null) return { date, hour };
    return { date, hour: null };
  }

  function rowToText(row) {
    return (row || [])
      .map((c) => String(c ?? "").trim())
      .filter(Boolean)
      .join("\n");
  }

  function isLikelyHeaderRow(line) {
    const cells = (line || []).map((c) => String(c ?? "").trim()).filter(Boolean);
    if (!cells.length) return false;
    if (cells.some((c) => /주문일\s*\d{4}[-./]\d{1,2}/i.test(c) || c.length > 40)) return false;
    if (cells.length === 1) return false;

    const headerKeys = [
      "옵션명",
      "주문일시",
      "주문일",
      "결제금액",
      "주문번호",
      "상품판매수",
      "주문건수",
      "전체주문건수",
    ];
    let hits = 0;
    cells.forEach((c) => {
      const h = normalizeHeader(c);
      if (headerKeys.some((k) => h === normalizeHeader(k))) hits++;
    });
    return hits >= 2 || (hits >= 1 && cells.every((c) => c.length <= 24));
  }

  function findHeaderRow(rows) {
    for (let i = 0; i < Math.min(rows.length, 40); i++) {
      const line = (rows[i] || []).map((c) => String(c ?? ""));
      if (isLikelyHeaderRow(line)) return i;
    }
    return -1;
  }

  function detectColumns(headers) {
    return {
      option: findColumnIndex(headers, ["옵션명", "상품옵션", "옵션"]),
      payment: findColumnIndex(headers, ["결제금액", "결제합계", "실결제", "매출액", "금액"]),
      sales: findColumnIndex(headers, ["상품판매수", "상품판매", "판매수", "수량"]),
      orders: findColumnIndex(headers, ["전체주문건수", "전체주문", "주문건수", "주문수"]),
      datetime: findColumnIndex(headers, [
        "주문일시",
        "주문일",
        "결제일시",
        "결제일",
        "입금일",
        "주문시간",
        "최근주문일",
        "주문날짜",
        "날짜",
      ]),
      orderNo: findColumnIndex(headers, ["주문번호", "주문no", "orderno"]),
    };
  }

  function findOptionInRow(row) {
    for (const cell of row || []) {
      if (isOptionRow(cell)) return String(cell).trim();
    }
    return null;
  }

  function extractPaymentFromRow(row, colPayment) {
    if (colPayment >= 0) {
      const v = parseNumber(row[colPayment]);
      if (v > 0) return v;
    }
    for (const cell of row || []) {
      const s = String(cell ?? "");
      if (/결제금액|결제합계|실결제|입금액|총결제/.test(s)) {
        const m = s.match(/([\d,]+)\s*원?/);
        if (m) {
          const v = parseNumber(m[1] + "원");
          if (v > 0) return v;
        }
      }
    }
    return 0;
  }

  function resolveDateTime(row, col, rowText) {
    if (col.datetime >= 0 && row[col.datetime] != null && row[col.datetime] !== "") {
      const dt = parseDateTimeVal(row[col.datetime]);
      if (dt.hour != null) return dt;
    }
    for (const cell of row || []) {
      const fromCell = extractDateTimeFromText(cell);
      if (fromCell.hour != null) return fromCell;
    }
    return extractDateTimeFromText(rowText);
  }

  function isSkippableRow(row) {
    const t = rowToText(row);
    if (!t) return true;
    if (/^SKA\d+/i.test(t.split("\n")[0])) return true;
    if (/^합계|^소계|^total/i.test(t)) return true;
    return false;
  }
  function buildEmptyHourlySlots() {
    return HOUR_SLOTS.map((slot, i) => ({
      id: i,
      label: slot.label,
      orders: 0,
      payment: 0,
      share: 0,
      isPeak: false,
    }));
  }
  function parseSrookpayRows(rows) {
    const headerIdx = findHeaderRow(rows);
    let col = {
      option: -1,
      payment: -1,
      sales: -1,
      orders: -1,
      datetime: -1,
      orderNo: -1,
    };
    let dataStart = 0;

    if (headerIdx >= 0) {
      const headers = (rows[headerIdx] || []).map((c) => String(c ?? ""));
      col = detectColumns(headers);
      dataStart = headerIdx + 1;
    }

    const records = [];

    for (let i = dataStart; i < rows.length; i++) {
      const row = rows[i] || [];
      if (isSkippableRow(row)) continue;

      const rowText = rowToText(row);
      const dt = resolveDateTime(row, col, rowText);

      let option = null;
      if (col.option >= 0 && row[col.option]) {
        option = String(row[col.option]).trim();
      }
      if (!option) option = findOptionInRow(row);

      const hasOption = !!(option && isOptionRow(option));
      const hasHour = dt.hour != null;

      if (!hasOption && !hasHour) continue;

      const sales = col.sales >= 0 ? parseNumber(row[col.sales]) : 0;
      const ordersCol = col.orders >= 0 ? parseNumber(row[col.orders]) : 0;
      const payment = extractPaymentFromRow(row, col.payment);

      let orders = ordersCol;
      if (orders <= 0) {
        if (hasHour || hasOption) orders = 1;
      }

      const qty = sales > 0 ? sales : orders;
      if (!hasHour && !hasOption) continue;
      if (!hasHour && qty <= 0 && payment <= 0) continue;

      records.push({
        hasOption,
        option: hasOption ? option : "",
        sales: hasOption ? qty : 0,
        orders,
        payment,
        date: dt.date,
        hour: dt.hour,
        composition: hasOption ? parseComposition(option) : null,
        flavors: hasOption ? parseFlavors(option) : [],
      });
    }

    if (!records.length) {
      throw new Error("분석 가능한 주문·시간 데이터가 없습니다.");
    }

    return records;
  }
  function buildOptionStats(records) {
    const optionRows = records.filter((r) => r.hasOption);
    const compMap = new Map();
    const flavorMap = new Map();
    let totalPayment = 0;
    let totalOrders = 0;

    optionRows.forEach((r) => {
      totalPayment += r.payment;
      totalOrders += r.orders;

      if (!r.composition) return;
      const comp = compMap.get(r.composition) || { name: r.composition, qty: 0, payment: 0 };
      comp.qty += r.sales;
      comp.payment += r.payment;
      compMap.set(r.composition, comp);

      const flavors = r.flavors.length ? r.flavors : [{ name: "미분류", qty: 1 }];
      const flavorQtySum = flavors.reduce((s, f) => s + f.qty, 0) || 1;
      flavors.forEach((f) => {
        const units = Math.max(1, Math.round(r.sales * (f.qty / flavorQtySum))) || f.qty;
        const prev = flavorMap.get(f.name) || { name: f.name, qty: 0 };
        prev.qty += units;
        flavorMap.set(f.name, prev);
      });
    });

    const compositions = [...compMap.values()].sort((a, b) => b.qty - a.qty);
    const flavors = [...flavorMap.values()].sort((a, b) => b.qty - a.qty);
    const compTotalQty = compositions.reduce((s, c) => s + c.qty, 0) || 1;
    const flavorTotalQty = flavors.reduce((s, f) => s + f.qty, 0) || 1;
    compositions.forEach((c) => {
      c.share = (c.qty / compTotalQty) * 100;
    });
    flavors.forEach((f) => {
      f.share = (f.qty / flavorTotalQty) * 100;
    });

    return {
      compositions,
      flavors,
      totalPayment,
      totalOrders,
      aov: totalOrders > 0 ? Math.round(totalPayment / totalOrders) : 0,
      bestComp: compositions[0] || null,
      bestFlavor: flavors[0] || null,
      hasOptions: optionRows.length > 0 && compositions.length > 0,
    };
  }

  function buildTimeStats(records) {
    const hourly = buildEmptyHourlySlots();
    const hourRows = records.filter((r) => r.hour != null);

    hourRows.forEach((r) => {
      const idx = hourToSlotIndex(r.hour);
      if (idx >= 0) {
        hourly[idx].orders += r.orders;
      }
    });

    const hourlyOrderTotal = hourly.reduce((s, h) => s + h.orders, 0);
    hourly.forEach((h) => {
      h.share = hourlyOrderTotal > 0 ? (h.orders / hourlyOrderTotal) * 100 : 0;
    });

    let peakIdx = -1;
    let peakOrders = 0;
    hourly.forEach((h, i) => {
      if (h.orders > peakOrders) {
        peakOrders = h.orders;
        peakIdx = i;
      }
    });
    hourly.forEach((h, i) => {
      h.isPeak = i === peakIdx && peakOrders > 0;
    });

    return {
      hourly,
      hasHourly: hourlyOrderTotal > 0,
      hourlyPeak: peakIdx >= 0 ? hourly[peakIdx] : null,
    };
  }

  /** @param {ReturnType<parseSrookpayRows>} records @param {string} fileName */
  function detectUploadType(records, fileName) {
    const fn = String(fileName || "").toLowerCase();
    if (/주문일|주문\s*일|orderdate|orders?_?date|총\s*주문|order\s*time/i.test(fn)) return "time";
    if (/옵션|option/i.test(fn)) return "option";

    const optionRows = records.filter((r) => r.hasOption);
    const hourRows = records.filter((r) => r.hour != null);

    if (optionRows.length > 0 && hourRows.length === 0) return "option";
    if (hourRows.length > 0 && optionRows.length === 0) return "time";
    if (hourRows.length > optionRows.length) return "time";
    if (optionRows.length > 0) return "option";
    if (hourRows.length > 0) return "time";
    return "unknown";
  }

  function mergeStatsForRender() {
    const opt = statsStore.optionStats;
    const time = statsStore.timeStats;
    return {
      compositions: opt?.compositions || [],
      flavors: opt?.flavors || [],
      aov: opt?.aov || 0,
      bestComp: opt?.bestComp || null,
      bestFlavor: opt?.bestFlavor || null,
      hasOptions: !!(opt && (opt.compositions?.length || opt.flavors?.length)),
      hourly: time?.hourly || buildEmptyHourlySlots(),
      hasHourly: !!(time && time.hasHourly),
      hourlyPeak: time?.hourlyPeak || null,
      customInsight: opt?.customInsight || time?.customInsight || "",
    };
  }

  function aggregateStats(records) {
    return {
      ...buildOptionStats(records),
      ...buildTimeStats(records),
    };
  }
  function recommendForSlot(label) {
    if (/21~24|18~21/.test(label)) {
      return "다음 공구 진행 시 저녁 시간대 스토리 및 마감 안내 노출을 추천드립니다.";
    }
    if (/12~15|15~18|09~12/.test(label)) {
      return "다음 공구 진행 시 낮·오후 시간대 프로모션 및 재고 안내 노출을 추천드립니다.";
    }
    if (/00~03|03~06|06~09/.test(label)) {
      return "다음 공구 진행 시 오전·새벽 시간대 사전 예고 및 오픈 알림을 추천드립니다.";
    }
    return "다음 공구 진행 시 주문이 많은 시간대에 안내 노출을 추천드립니다.";
  }
  function renderInsight(stats) {
    if (!els.insight) return;
    if (stats.customInsight) {
      els.insight.textContent = stats.customInsight;
      els.insight.hidden = false;
      return;
    }
    if (stats.bestComp && stats.bestFlavor) {
      els.insight.textContent = `「${stats.bestComp.name}」 구성(비중 ${formatPct(stats.bestComp.share)})과 「${stats.bestFlavor.name}」 맛(비중 ${formatPct(stats.bestFlavor.share)})이 가장 인기였습니다. 다음 공구에서는 해당 옵션을 전면에 내세우는 것을 권장합니다.`;
      els.insight.hidden = false;
    } else {
      els.insight.textContent = "";
      els.insight.hidden = true;
    }
  }
  function renderBadge(isBest) {
    return isBest ? '<span class="stats-badge">BEST</span>' : "";
  }

  function renderTable(tbody, rows, cols) {
    if (!tbody) return;
    tbody.innerHTML = rows
      .map(
        (r) => `
      <tr>
        <td>${r.name}${renderBadge(r.isBest)}</td>
        ${cols.map((c) => `<td class="cell-num">${c(r)}</td>`).join("")}
      </tr>`
      )
      .join("");
  }

  function renderHourlyBars(slots) {
    if (!els.hourlyBars) return;
    const maxShare = Math.max(...slots.map((s) => s.share), 1);
    const peak = slots.find((s) => s.isPeak && s.orders > 0);

    if (els.hourlyPeakLabel) {
      if (peak) {
        els.hourlyPeakLabel.hidden = false;
        els.hourlyPeakLabel.textContent = `🔥 주문 집중 시간: ${peak.label}`;
      } else {
        els.hourlyPeakLabel.hidden = true;
        els.hourlyPeakLabel.textContent = "";
      }
    }

    els.hourlyBars.innerHTML = slots
      .map((s) => {
        const pct = s.orders > 0 ? Math.max(6, Math.round((s.share / maxShare) * 100)) : 0;
        return `
        <div class="hourly-bar-row${s.isPeak ? " is-peak" : ""}">
          <span class="hourly-bar-label">${s.label}</span>
          <div class="hourly-bar-track"><div class="hourly-bar-fill" style="width:${pct}%"></div></div>
          <span class="hourly-bar-meta">${formatNumber(s.orders)}건 · ${formatPct(s.share)}</span>
        </div>`;
      })
      .join("");
  }
  function renderHourlyInsight(stats) {
    const el = els.hourlyInsight;
    if (!el) return;
    if (!stats.hasHourly || !stats.hourlyPeak) {
      el.hidden = true;
      return;
    }
    const peak = stats.hourlyPeak;
    el.classList.remove("stats-hourly-insight--empty");
    el.hidden = false;
    el.innerHTML = [
      `전체 주문의 <strong>${formatPct(peak.share)}</strong>가 <strong>${peak.label}</strong>에 발생했습니다.`,
      recommendForSlot(peak.label),
    ].join("<br>");
  }
  function renderHourly(stats) {
    const block = els.hourlyBlock;
    const body = els.hourlyBody;

    if (!stats.hasHourly) {
      if (block) block.hidden = true;
      if (body) body.hidden = true;
      if (els.hourlyBars) els.hourlyBars.innerHTML = "";
      if (els.hourlyPeakLabel) els.hourlyPeakLabel.hidden = true;
      if (els.hourlyInsight) els.hourlyInsight.hidden = true;
      return;
    }

    if (block) block.hidden = false;
    if (block) block.classList.remove("stats-block--no-hourly");
    if (body) body.hidden = false;
    renderHourlyBars(stats.hourly);
    renderHourlyInsight(stats);
  }
  function sanitizeOptionStats(stats) {
    if (!stats || typeof stats !== "object") return null;
    const { finance, daily, hasDaily, hourly, hasHourly, hourlyPeak, ...rest } = stats;
    return {
      compositions: rest.compositions || [],
      flavors: rest.flavors || [],
      aov: rest.aov || 0,
      bestComp: rest.bestComp || null,
      bestFlavor: rest.bestFlavor || null,
      hasOptions: !!(rest.compositions && rest.compositions.length),
      totalPayment: rest.totalPayment || 0,
      totalOrders: rest.totalOrders || 0,
    };
  }

  function sanitizeTimeStats(stats) {
    if (!stats || typeof stats !== "object") return null;
    return {
      hourly: stats.hourly && Array.isArray(stats.hourly) ? stats.hourly : buildEmptyHourlySlots(),
      hasHourly: !!stats.hasHourly,
      hourlyPeak: stats.hourlyPeak || null,
    };
  }

  function sanitizeStats(stats) {
    return mergeStatsForRender();
  }

  function hasAnyStats() {
    return !!(statsStore.optionStats || statsStore.timeStats);
  }

  function updateFileNameDisplay() {
    const parts = [];
    if (statsStore.optionFileName) parts.push(`옵션: ${statsStore.optionFileName}`);
    if (statsStore.timeFileName) parts.push(`주문일: ${statsStore.timeFileName}`);
    els.fileName.textContent = parts.length ? parts.join(" · ") : "선택된 파일 없음";
  }

  function applyUpload(records, fileName, uploadType) {
    const optionRows = records.filter((r) => r.hasOption);
    const hourRows = records.filter((r) => r.hour != null);

    if (uploadType === "option" || uploadType === "both") {
      if (!optionRows.length) {
        throw new Error("옵션 데이터를 찾을 수 없습니다. 옵션명이 포함된 엑셀인지 확인해 주세요.");
      }
      statsStore.optionStats = buildOptionStats(records);
      statsStore.optionFileName = fileName;
    }

    if (uploadType === "time" || uploadType === "both") {
      if (!hourRows.length) {
        throw new Error("주문 시간 데이터를 찾을 수 없습니다. 주문일·주문일시가 포함된 엑셀인지 확인해 주세요.");
      }
      statsStore.timeStats = buildTimeStats(records);
      statsStore.timeFileName = fileName;
    }

    if (uploadType === "unknown") {
      throw new Error("분석 가능한 옵션 또는 주문 시간 데이터가 없습니다.");
    }
  }
  function updateSectionVisibility(stats) {
    const hasComp = !!(stats.compositions && stats.compositions.length);
    const hasFlavor = !!(stats.flavors && stats.flavors.length);
    const hasOptionStats = hasComp || hasFlavor;

    if (els.kpiBlock) els.kpiBlock.hidden = false;
    if (els.compBlock) els.compBlock.hidden = !hasComp;
    if (els.flavorBlock) els.flavorBlock.hidden = !hasFlavor;
    if (els.insightBlock) els.insightBlock.hidden = !hasOptionStats;
    if (els.optionsUnavailable) {
      els.optionsUnavailable.hidden = hasOptionStats;
      if (!hasOptionStats) els.optionsUnavailable.textContent = MSG_NO_OPTIONS;
    }
  }

  function renderOptionStats(stats) {
    const hasComp = !!(stats.compositions && stats.compositions.length);
    const hasFlavor = !!(stats.flavors && stats.flavors.length);
    const hasOptionStats = hasComp || hasFlavor;

    els.aovAmount.textContent =
      hasOptionStats && stats.aov > 0 ? formatWon(stats.aov) : hasOptionStats ? "—" : "옵션 데이터 없음";

    if (stats.bestComp && hasComp) {
      els.bestCompName.textContent = stats.bestComp.name;
      els.bestCompQty.textContent = formatNumber(stats.bestComp.qty) + "개";
      els.bestCompShare.textContent = formatPct(stats.bestComp.share);
    } else {
      els.bestCompName.textContent = hasOptionStats ? "—" : "옵션 데이터 없음";
      els.bestCompQty.textContent = "—";
      els.bestCompShare.textContent = "—";
    }

    if (stats.bestFlavor && hasFlavor) {
      els.bestFlavorName.textContent = stats.bestFlavor.name;
      els.bestFlavorQty.textContent = formatNumber(stats.bestFlavor.qty) + "개";
      els.bestFlavorShare.textContent = formatPct(stats.bestFlavor.share);
    } else {
      els.bestFlavorName.textContent = hasOptionStats ? "—" : "옵션 데이터 없음";
      els.bestFlavorQty.textContent = "—";
      els.bestFlavorShare.textContent = "—";
    }

    if (hasComp) {
      renderTable(
        els.compTbody,
        stats.compositions.map((c, i) => ({ ...c, name: c.name, isBest: i === 0 })),
        [(c) => formatNumber(c.qty), (c) => formatWon(c.payment), (c) => formatPct(c.share)]
      );
    } else if (els.compTbody) {
      els.compTbody.innerHTML = "";
    }

    if (hasFlavor) {
      renderTable(
        els.flavorTbody,
        stats.flavors.map((f, i) => ({ ...f, name: f.name, isBest: i === 0 })),
        [(f) => formatNumber(f.qty), (f) => formatPct(f.share)]
      );
    } else if (els.flavorTbody) {
      els.flavorTbody.innerHTML = "";
    }

    if (hasOptionStats) {
      renderInsight(stats);
    } else if (els.insight) {
      els.insight.textContent = "";
      els.insight.hidden = true;
    }
  }

  function renderStats(stats) {
    lastStats = stats || mergeStatsForRender();
    if (!hasAnyStats()) {
      showEmpty();
      return;
    }
    els.empty.hidden = true;
    els.content.hidden = false;

    updateSectionVisibility(lastStats);
    renderOptionStats(lastStats);
    renderHourly(lastStats);
  }

  function renderFromStore() {
    updateFileNameDisplay();
    renderStats(mergeStatsForRender());
    window.dispatchEvent(new CustomEvent("stats-updated", { detail: lastStats }));
  }
  const DEFAULT_EMPTY_MSG =
    "상단에서 스룩페이 옵션 엑셀(.xlsx)을 업로드하면 통계가 자동으로 표시됩니다.";

  function resetEmptyMessage() {
    const textEl = els.empty?.querySelector(".stats-empty__text");
    if (textEl) textEl.textContent = DEFAULT_EMPTY_MSG;
  }

  function showEmpty(msg) {
    if (!els.empty) return;
    els.empty.hidden = false;
    if (els.content) els.content.hidden = true;
    const textEl = els.empty.querySelector(".stats-empty__text");
    if (textEl) textEl.textContent = msg || DEFAULT_EMPTY_MSG;
  }

  function parseWorkbook(wb) {
    const allRecords = [];
    let lastErr = null;

    for (const name of wb.SheetNames) {
      const sheet = wb.Sheets[name];
      if (!sheet) continue;
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
      if (!rows.length) continue;
      try {
        const records = parseSrookpayRows(rows);
        allRecords.push(...records);
      } catch (e) {
        lastErr = e;
      }
    }

    if (allRecords.length) return allRecords;
    if (lastErr) throw lastErr;
    throw new Error("분석 가능한 주문·시간 데이터가 없습니다.");
  }

  function handleFile(file) {
    if (!file) return;
    if (typeof XLSX === "undefined") {
      alert("엑셀 라이브러리를 불러오지 못했습니다. 인터넷 연결 후 다시 시도해 주세요.");
      return;
    }

    resetEmptyMessage();

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const records = parseWorkbook(wb);
        const uploadType = detectUploadType(records, file.name);
        applyUpload(records, file.name, uploadType);
        renderFromStore();
      } catch (err) {
        console.error(err);
        const msg = err.message || "엑셀 분석 중 오류가 발생했습니다.";
        if (hasAnyStats()) {
          renderFromStore();
          alert(msg);
        } else {
          showEmpty(msg);
        }
      }
    };
    reader.onerror = () => {
      showEmpty("파일을 읽을 수 없습니다. 다시 선택해 주세요.");
    };
    reader.readAsArrayBuffer(file);
  }
  function bindEvents() {
    if (!els.fileInput) return;
    els.fileInput.addEventListener("change", (e) => handleFile(e.target.files?.[0]));
    const drop = document.getElementById("stats-drop-zone");
    if (drop) {
      drop.addEventListener("dragover", (e) => {
        e.preventDefault();
        drop.classList.add("is-dragover");
      });
      drop.addEventListener("dragleave", () => drop.classList.remove("is-dragover"));
      drop.addEventListener("drop", (e) => {
        e.preventDefault();
        drop.classList.remove("is-dragover");
        handleFile(e.dataTransfer?.files?.[0]);
      });
    }
  }
  function getSavePayload() {
    if (!hasAnyStats()) return null;
    return {
      version: 2,
      fileName: els.fileName?.textContent?.trim() || "",
      optionFileName: statsStore.optionFileName,
      timeFileName: statsStore.timeFileName,
      optionStats: statsStore.optionStats,
      timeStats: statsStore.timeStats,
      stats: mergeStatsForRender(),
    };
  }

  function applySavePayload(payload) {
    if (!payload) {
      clearStats();
      return;
    }

    if (payload.optionStats) {
      statsStore.optionStats = sanitizeOptionStats(payload.optionStats);
      statsStore.optionFileName = payload.optionFileName || "";
    } else if (payload.stats && (payload.stats.compositions?.length || payload.stats.bestComp)) {
      statsStore.optionStats = sanitizeOptionStats(payload.stats);
    }

    if (payload.timeStats) {
      statsStore.timeStats = sanitizeTimeStats(payload.timeStats);
      statsStore.timeFileName = payload.timeFileName || "";
    } else if (payload.stats && payload.stats.hasHourly) {
      statsStore.timeStats = sanitizeTimeStats(payload.stats);
    }

    if (!payload.optionStats && !payload.timeStats && payload.stats) {
      const type = detectUploadTypeFromMerged(payload.stats);
      if (type === "option" || type === "both") {
        statsStore.optionStats = sanitizeOptionStats(payload.stats);
      }
      if (type === "time" || type === "both") {
        statsStore.timeStats = sanitizeTimeStats(payload.stats);
      }
      statsStore.optionFileName = payload.optionFileName || payload.fileName || "";
      statsStore.timeFileName = payload.timeFileName || "";
    }

    if (!hasAnyStats()) {
      clearStats();
      return;
    }

    renderFromStore();
  }

  function detectUploadTypeFromMerged(stats) {
    const hasOpt = !!(stats.compositions && stats.compositions.length);
    const hasTime = !!stats.hasHourly;
    if (hasOpt && hasTime) return "both";
    if (hasOpt) return "option";
    if (hasTime) return "time";
    return "unknown";
  }

  function clearStats() {
    statsStore.optionStats = null;
    statsStore.timeStats = null;
    statsStore.optionFileName = "";
    statsStore.timeFileName = "";
    lastStats = null;
    if (els.fileInput) els.fileInput.value = "";
    if (els.fileName) els.fileName.textContent = "선택된 파일 없음";
    resetEmptyMessage();
    showEmpty();
  }
  function init() {
    resetEmptyMessage();
    bindEvents();
  }
  window.ConnectSellStats = {
    getLastStats: () => lastStats || mergeStatsForRender(),
    getSavePayload,
    applySavePayload,
    clearStats,
    parseSrookpayRows,
    aggregateStats,
    getStatsStore: () => ({ ...statsStore }),
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
