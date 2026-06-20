/**
 * 소하담바카 × 가꾸기 다이어트 단백질 쉐이크 · 공구 운영리포트 프리셋
 * 기준: OPTION_SKA97644149_20260621_013043.xlsx · 상품 주문금액 합계 (배송비 제외)
 */
(function () {
  "use strict";

  const CUSTOM_INSIGHT =
    "총 10건의 주문 중 5팩, 10+2 구성의 구매 비중이 높게 나타났습니다. " +
    "소량 체험 구성보다는 혜택이 명확한 중·대용량 구성이 반응을 이끌었으며, " +
    "다음 공구에서는 5팩 이상 무료배송 및 증정 혜택을 전면에 노출하는 전략을 권장합니다.";

  const optionStats = {
    compositions: [
      { name: "10+2팩(60포)", qty: 3, payment: 480000, share: 30 },
      { name: "5팩(25포)", qty: 3, payment: 250500, share: 30 },
      { name: "2팩(10포)", qty: 2, payment: 69000, share: 20 },
      { name: "7+1팩(40포)", qty: 2, payment: 228000, share: 20 },
    ],
    flavors: [
      { name: "곡물맛", qty: 7, share: 23.3 },
      { name: "초코맛", qty: 7, share: 23.3 },
      { name: "쿠키맛", qty: 6, share: 20 },
      { name: "흑임자맛", qty: 5, share: 16.7 },
      { name: "옥수수맛", qty: 5, share: 16.7 },
    ],
    totalPayment: 1027500,
    totalOrders: 10,
    aov: 102750,
    bestComp: { name: "10+2팩(60포)", qty: 3, payment: 480000, share: 30 },
    bestFlavor: { name: "곡물맛", qty: 7, share: 23.3 },
    hasOptions: true,
    customInsight: CUSTOM_INSIGHT,
  };

  const hourly = [
    { id: 0, label: "00~03시", orders: 0, payment: 0, share: 0, isPeak: false },
    { id: 1, label: "03~06시", orders: 0, payment: 0, share: 0, isPeak: false },
    { id: 2, label: "06~09시", orders: 0, payment: 0, share: 0, isPeak: false },
    { id: 3, label: "09~12시", orders: 0, payment: 0, share: 0, isPeak: false },
    { id: 4, label: "12~15시", orders: 10, payment: 0, share: 100, isPeak: true },
    { id: 5, label: "15~18시", orders: 0, payment: 0, share: 0, isPeak: false },
    { id: 6, label: "18~21시", orders: 0, payment: 0, share: 0, isPeak: false },
    { id: 7, label: "21~24시", orders: 0, payment: 0, share: 0, isPeak: false },
  ];

  window.REPORT_PRESET = {
    version: 2,
    reportMode: "ops",
    sellerName: "@sohadam.baka",
    productName: "[가꾸기] 다이어트 단백질 쉐이크",
    campaignPeriod: "2026.06.13",
    writtenDate: "2026.06.21",
    supplierName: "ConnectSell",
    managerName: "허연선",
    commissionRate: "30",
    settlementDueDate: "2026.07.05",
    adjustments: { cancel: 0, exchange: 0, return: 0 },
    dailyRows: [
      {
        date: "06/13",
        productName: "[가꾸기] 다이어트 단백질 쉐이크",
        orders: "10",
        product: "1,027,500",
        shipping: "24,000",
      },
    ],
    stats: {
      version: 2,
      optionFileName: "OPTION_SKA97644149_20260621_013043.xlsx",
      optionStats,
      timeStats: {
        hourly,
        hasHourly: true,
        hourlyPeak: hourly[4],
      },
      stats: {
        ...optionStats,
        hourly,
        hasHourly: true,
        hourlyPeak: hourly[4],
        customInsight: CUSTOM_INSIGHT,
      },
    },
  };
})();
