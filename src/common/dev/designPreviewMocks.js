/*
 * [디자인 캡처 전용] Design Preview 모드에서 axios 요청을 가로채 돌려줄 목 응답.
 *
 * designPreview.js의 installDesignPreviewAdapter()가 Preview 모드일 때만 dynamic import
 * 하므로 프로덕션 번들에는 포함되지 않는다. 응답 형태는 각 화면이 이미 읽고 있는 실제
 * API 계약을 그대로 따른다(래핑 여부까지 기존 호출부 기준).
 *
 *   인증      POST /auth/kakao/callback, GET /auth/me, POST /auth/logout   (래핑 없음)
 *   추천      POST /user-conditions, POST /user-conditions/:id/recompute,
 *             GET /user-conditions/:id/recommendations, /user-conditions/saved, PUT|DELETE .../save
 *   동네      GET /admin-dongs, /admin-dongs/batch, /admin-dongs/:id/places, /admin-dongs/review-stats
 *   관심 동네 GET|POST /favorite-dongs, DELETE /favorite-dongs/:id
 *   리뷰      GET /reviews?adminDongId, GET /reviews/me, POST /reviews, PUT|DELETE /reviews/:id,
 *             POST /reviews/:id/reports                                    (래핑 없음)
 *
 * 관심 동네·작성한 리뷰·추가로 조회한 동은 브라우저 localStorage(DESIGN_PREVIEW_STORAGE_KEY)에
 * 저장해 새로고침 후에도 유지한다. 초기화하려면 개발자 도구에서 그 키를 지우면 된다.
 * 목에 없는 요청(GET 포함)은 실제 서버로 보내지 않고 오류로 차단한다.
 */
import { DESIGN_PREVIEW_CONDITION_ID, DESIGN_PREVIEW_TOKEN } from "./designPreview";
import { DONG_DATA, INITIAL_REVIEWS } from "../utils/mockData";
import { CATEGORY_LABEL_TO_CODE } from "../../review/constants";

const DESIGN_PREVIEW_STORAGE_KEY = "anchak-design-preview";

// 로딩 연출(SearchLoading: 4단계 x 700ms)보다 짧게 둬서 연출이 끝나면 바로 결과로 넘어간다.
const RECOMMEND_DELAY_MS = 1200;
const DEFAULT_DELAY_MS = 150;

// ---------- 추천 목록 (RecommendedDongResponse[]) ----------
const RECOMMENDATIONS = [
  {
    adminDongId: 990101, guName: "마포구", dongName: "서교동", lat: 37.5552, lng: 126.919,
    totalScore: 92.4, dataCoverageRate: 96.0, rank: 1,
    commuteTime: 38, transferCount: 1,
    route: "2호선 홍대입구 → 을지로입구, 1호선 시청 → 종각",
    transportType: "SUBWAY", lineNum: "2호선", vehicleType: null,
    walkMin: 9, transitMin: 24,
    recommendationReason: "예산 안 오피스텔 매물이 많아요, 2호선 역세권이에요, 카페·음식점이 풍부해요",
    caution: "주말 유동인구가 많아 소음이 있을 수 있어요",
  },
  {
    adminDongId: 990102, guName: "마포구", dongName: "망원1동", lat: 37.556, lng: 126.905,
    totalScore: 88.1, dataCoverageRate: 93.5, rank: 2,
    commuteTime: 44, transferCount: 1,
    route: "6호선 망원 → 합정, 2호선 합정 → 시청",
    transportType: "SUBWAY", lineNum: "6호선", vehicleType: null,
    walkMin: 11, transitMin: 26,
    recommendationReason: "한강공원이 가까워요, 월세 시세가 평균보다 낮아요, 전통시장이 있어요",
    caution: "출퇴근 시간 6호선 혼잡도가 높아요",
  },
  {
    adminDongId: 990103, guName: "서대문구", dongName: "연희동", lat: 37.568, lng: 126.931,
    totalScore: 84.7, dataCoverageRate: 90.2, rank: 3,
    commuteTime: 41, transferCount: 0,
    route: "간선 7737 연희동 → 광화문",
    transportType: "BUS", lineNum: "7737", vehicleType: "간선",
    walkMin: 7, transitMin: 29,
    recommendationReason: "조용한 주거지예요, 범죄율이 낮아요, 환승 없이 출근할 수 있어요",
    caution: "지하철역까지 거리가 있어요",
  },
  {
    adminDongId: 990104, guName: "광진구", dongName: "화양동", lat: 37.5465, lng: 127.071,
    totalScore: 81.3, dataCoverageRate: 88.9, rank: 4,
    commuteTime: 47, transferCount: 1,
    route: "간선 302 화양사거리 → 건대입구역, 2호선 건대입구 → 시청",
    transportType: "BUS_AND_SUBWAY", lineNum: "2호선", vehicleType: "간선",
    walkMin: 8, transitMin: 31,
    recommendationReason: "원룸·오피스텔 공급이 많아요, 헬스장이 많아요, 생활 인프라가 좋아요",
    caution: "대학가라 저녁 시간대 유동인구가 많아요",
  },
  {
    adminDongId: 990105, guName: "동작구", dongName: "상도1동", lat: 37.498, lng: 126.953,
    totalScore: 77.8, dataCoverageRate: 85.4, rank: 5,
    commuteTime: 52, transferCount: 2,
    route: "7호선 상도 → 대림, 2호선 대림 → 신도림, 1호선 신도림 → 시청",
    transportType: "SUBWAY", lineNum: "7호선", vehicleType: null,
    walkMin: 10, transitMin: 33,
    recommendationReason: "전세 시세가 안정적이에요, 공원이 가까워요",
    caution: "언덕이 많아요, 환승이 두 번 필요해요",
  },
];

// ---------- 상세 지표 (admin-dongs/batch 항목) ----------
function houseTypes(scale, isJeonse) {
  return [
    { houseType: "오피스텔", transactionCount: Math.round(42 * scale), avgArea: 24.6, avgDeposit: isJeonse ? Math.round(21000 * scale) : 1000, avgRent: isJeonse ? null : Math.round(72 * scale) },
    { houseType: "빌라·다세대", transactionCount: Math.round(31 * scale), avgArea: 33.2, avgDeposit: isJeonse ? Math.round(18500 * scale) : 1500, avgRent: isJeonse ? null : Math.round(65 * scale) },
    { houseType: "원룸", transactionCount: Math.round(18 * scale), avgArea: 19.8, avgDeposit: isJeonse ? Math.round(14000 * scale) : 500, avgRent: isJeonse ? null : Math.round(55 * scale) },
  ];
}

function detail(base, { scale, safetyScore, crimeRate, nearestSubwayStation, counts }) {
  return {
    adminDongId: base.adminDongId,
    guName: base.guName,
    dongName: base.dongName,
    lat: base.lat,
    lng: base.lng,
    // 주거 시세
    deposit: Math.round(1000 * scale),
    monthly: Math.round(68 * scale),
    jeonseDeposit: Math.round(19500 * scale),
    rentDist: [
      { label: "50만 이하", count: Math.round(14 * scale) },
      { label: "50~70만", count: Math.round(38 * scale) },
      { label: "70~90만", count: Math.round(27 * scale) },
      { label: "90만 이상", count: Math.round(12 * scale) },
    ],
    jeonseDist: [
      { label: "1억 이하", count: 6 },
      { label: "1~2억", count: Math.round(22 * scale) },
      { label: "2~3억", count: Math.round(17 * scale) },
      { label: "3억 이상", count: 5 },
    ],
    monthlyHouseTypes: houseTypes(scale, false),
    jeonseHouseTypes: houseTypes(scale, true),
    // 치안
    safetyScore,
    safetyScoreMax: 100,
    crimeRate,
    cctv: counts.cctv,
    safetyBellCount: counts.safetyBell,
    police: `${base.guName} ${base.dongName} 치안센터 (도보 ${counts.policeWalk}분)`,
    // 생활 인프라
    gyms: counts.gyms,
    convenience: counts.convenience,
    hospitals: counts.hospitals,
    pharmacies: counts.pharmacies,
    parks: counts.parks,
    banks: counts.banks,
    cafes: counts.cafes,
    restaurants: counts.restaurants,
    department: counts.department,
    mart: counts.mart,
    // 교통
    subwayStationCount: counts.subway,
    busStopCount: counts.bus,
    nearestSubwayStation,
  };
}

const DETAILS = [
  detail(RECOMMENDATIONS[0], { scale: 1.1, safetyScore: 78.5, crimeRate: 84.2, nearestSubwayStation: "홍대입구역 (2호선)", counts: { cctv: 412, safetyBell: 96, policeWalk: 6, gyms: 38, convenience: 74, hospitals: 41, pharmacies: 22, parks: 3, banks: 12, cafes: 186, restaurants: 412, department: 1, mart: 2, subway: 3, bus: 28 } }),
  detail(RECOMMENDATIONS[1], { scale: 0.92, safetyScore: 82.1, crimeRate: 71.6, nearestSubwayStation: "망원역 (6호선)", counts: { cctv: 288, safetyBell: 71, policeWalk: 8, gyms: 21, convenience: 46, hospitals: 25, pharmacies: 14, parks: 4, banks: 6, cafes: 98, restaurants: 203, department: 0, mart: 1, subway: 1, bus: 19 } }),
  detail(RECOMMENDATIONS[2], { scale: 1.05, safetyScore: 88.9, crimeRate: 58.3, nearestSubwayStation: "신촌역 (2호선)", counts: { cctv: 254, safetyBell: 63, policeWalk: 10, gyms: 12, convenience: 31, hospitals: 18, pharmacies: 9, parks: 5, banks: 4, cafes: 64, restaurants: 121, department: 0, mart: 1, subway: 0, bus: 24 } }),
  detail(RECOMMENDATIONS[3], { scale: 0.88, safetyScore: 74.2, crimeRate: 92.7, nearestSubwayStation: "건대입구역 (2·7호선)", counts: { cctv: 376, safetyBell: 88, policeWalk: 5, gyms: 33, convenience: 69, hospitals: 37, pharmacies: 19, parks: 2, banks: 9, cafes: 142, restaurants: 356, department: 1, mart: 1, subway: 2, bus: 31 } }),
  detail(RECOMMENDATIONS[4], { scale: 0.85, safetyScore: 80.6, crimeRate: 66.4, nearestSubwayStation: "상도역 (7호선)", counts: { cctv: 231, safetyBell: 58, policeWalk: 9, gyms: 14, convenience: 38, hospitals: 22, pharmacies: 11, parks: 6, banks: 5, cafes: 57, restaurants: 134, department: 0, mart: 1, subway: 1, bus: 22 } }),
];
const DETAILS_BY_ID = Object.fromEntries(DETAILS.map((d) => [d.adminDongId, d]));
const MOCK_DONG_IDS = new Set(RECOMMENDATIONS.map((r) => r.adminDongId));

// ---------- 지도 마커용 장소 (admin-dongs/:id/places) ----------
const PLACE_CATEGORIES = [
  ["CONVENIENCE_STORE", "편의점"], ["CAFE", "카페"], ["RESTAURANT", "식당"], ["HOSPITAL", "의원"],
  ["PHARMACY", "약국"], ["GYM", "피트니스"], ["BANK", "은행"], ["PARK", "근린공원"],
  ["MART", "마트"], ["DEPARTMENT_STORE", "백화점"], ["CCTV", "CCTV"], ["STREET_LIGHT", "가로등"],
  ["POLICE", "치안센터"], ["SAFETY_BELL", "안심벨"], ["SUBWAY_STATION", "역"], ["BUS_STOP", "정류장"],
];

function buildPlaces(adminDongId) {
  const base = DETAILS_BY_ID[adminDongId];
  const places = [];
  let placeId = adminDongId * 1000;
  PLACE_CATEGORIES.forEach(([category, label], ci) => {
    const count = ["DEPARTMENT_STORE", "POLICE", "SUBWAY_STATION", "MART"].includes(category) ? 1 : 6;
    for (let i = 0; i < count; i += 1) {
      // 동 중심 기준 반경 ~600m 안에 결정적으로(매번 같은 위치) 흩뿌린다.
      const angle = (ci * 37 + i * 61) * (Math.PI / 180);
      const dist = 0.0015 + ((ci + i * 3) % 7) * 0.0007;
      places.push({
        placeId: placeId++,
        category,
        name: `${base.dongName} ${label} ${i + 1}`,
        lat: base.lat + Math.sin(angle) * dist,
        lng: base.lng + Math.cos(angle) * dist * 1.25,
      });
    }
  });
  return places;
}

// ---------- 저장된 조건 목록 (GET /user-conditions/saved) ----------
const SAVED_CONDITIONS = [
  {
    conditionId: DESIGN_PREVIEW_CONDITION_ID, title: "회사 근처 오피스텔", rentalType: "MONTHLY",
    destAddress: "서울 중구 세종대로 110", commuteType: "PUBLIC_TRANSIT", maxCommuteTime: 60,
    maxTransferCount: 2, minArea: 20, maxDeposit: 3000, maxRent: 70, latest: true, createdAt: "2026-10-20T14:12:00",
  },
  {
    conditionId: DESIGN_PREVIEW_CONDITION_ID + 1, title: "전세로 조용한 동네", rentalType: "JEONSE",
    destAddress: "서울 강남구 테헤란로 152", commuteType: "PUBLIC_TRANSIT", maxCommuteTime: 50,
    maxTransferCount: 1, minArea: 30, maxDeposit: 25000, maxRent: 0, latest: false, createdAt: "2026-10-02T09:30:00",
  },
];


// ---------- Mock 사용자 (GET /auth/me) ----------
const PREVIEW_USER = {
  userId: 990001,
  nickname: "안착디자인",
  email: "preview@anchak.dev",
  profileImage: null,
  provider: "KAKAO",
};

// ---------- localStorage에 유지하는 Preview 상태 ----------
function hashOf(text) {
  return [...String(text)].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 100000, 7);
}

function toReviewResponse(source, { reviewId, adminDongId, guName, dongName, writerId, writerNickname }) {
  const date = String(source.date || "2026.09.01").replaceAll(".", "-");
  return {
    reviewId,
    adminDongId,
    adminDongName: dongName,
    guName,
    overallRating: source.overallRating,
    content: source.content,
    anonymous: false,
    status: "ACTIVE",
    writerId,
    writerNickname: writerNickname ?? source.author,
    categoryScores: Object.fromEntries(
      Object.entries(source.ratings || {}).map(([label, score]) => [CATEGORY_LABEL_TO_CODE[label] ?? label, score]),
    ),
    createdAt: `${date}T09:00:00`,
    updatedAt: `${date}T09:00:00`,
  };
}

function initialState() {
  const [first, second] = RECOMMENDATIONS;
  return {
    // 관심 동네 목록 화면이 처음부터 비어 있지 않도록 두 곳을 저장해 둔다.
    favorites: [
      { adminDongId: first.adminDongId, createdAt: "2026-10-21T10:00:00" },
      { adminDongId: RECOMMENDATIONS[2].adminDongId, createdAt: "2026-10-18T10:00:00" },
    ],
    // 마이페이지 "내가 쓴 리뷰" 예시 - 기존 INITIAL_REVIEWS 문구를 재사용한다.
    myReviews: [
      toReviewResponse(INITIAL_REVIEWS[0], { reviewId: 99000101, ...dongRef(second), writerId: PREVIEW_USER.userId, writerNickname: PREVIEW_USER.nickname }),
      toReviewResponse(INITIAL_REVIEWS[1], { reviewId: 99000102, ...dongRef(first), writerId: PREVIEW_USER.userId, writerNickname: PREVIEW_USER.nickname }),
    ],
    // 동네 둘러보기에서 조회한(추천 Mock 5곳이 아닌) 동의 id -> { guName, dongName }
    extraDongs: {},
    deletedConditionIds: [],
  };
}

function dongRef(rec) {
  return { adminDongId: rec.adminDongId, guName: rec.guName, dongName: rec.dongName };
}

let memoryState = null;
function readState() {
  if (memoryState) return memoryState;
  try {
    const raw = localStorage.getItem(DESIGN_PREVIEW_STORAGE_KEY);
    memoryState = raw ? { ...initialState(), ...JSON.parse(raw) } : initialState();
  } catch {
    memoryState = initialState();
  }
  return memoryState;
}
function writeState() {
  try {
    localStorage.setItem(DESIGN_PREVIEW_STORAGE_KEY, JSON.stringify(memoryState));
  } catch {
    // localStorage를 못 쓰는 환경이면 메모리에만 유지한다.
  }
}

// ---------- 동 조회 (추천 Mock 5곳 + 둘러보기에서 조회한 동) ----------
function findDong(adminDongId) {
  const id = Number(adminDongId);
  const rec = RECOMMENDATIONS.find((r) => r.adminDongId === id);
  if (rec) return dongRef(rec);
  const extra = readState().extraDongs[id];
  return extra ? { adminDongId: id, ...extra } : null;
}

function normalizeDongName(name) {
  return String(name).replace(/[,·ㆍ.]/g, "");
}

function lookupAdminDong(guName, dongNameQuery) {
  const key = normalizeDongName(dongNameQuery);
  const rec = RECOMMENDATIONS.find((r) => r.guName === guName && normalizeDongName(r.dongName) === key);
  if (rec) return dongRef(rec);

  const state = readState();
  const found = Object.entries(state.extraDongs).find(
    ([, d]) => d.guName === guName && normalizeDongName(d.dongName) === key,
  );
  if (found) return { adminDongId: Number(found[0]), ...found[1] };

  const adminDongId = 992001 + Object.keys(state.extraDongs).length;
  state.extraDongs[adminDongId] = { guName, dongName: dongNameQuery };
  writeState();
  return { adminDongId, guName, dongName: dongNameQuery };
}

// 추천 Mock 5곳은 고정 상세, 그 외 동은 기존 DONG_DATA 구 평균에 동 이름 해시로 변화를 줘서 만든다.
function detailFor(adminDongId) {
  if (DETAILS_BY_ID[adminDongId]) return DETAILS_BY_ID[adminDongId];
  const dong = findDong(adminDongId);
  if (!dong) return null;
  const gu = DONG_DATA[dong.guName] ?? { avgRent: 60, safetyScore: 75 };
  const h = hashOf(dong.dongName) % 20;
  return detail(
    { ...dong, lat: null, lng: null },
    {
      scale: gu.avgRent / 62,
      safetyScore: Math.min(98, gu.safetyScore + (h % 10) - 5),
      crimeRate: 55 + h * 2,
      nearestSubwayStation: null,
      counts: {
        cctv: 180 + h * 12, safetyBell: 40 + h * 3, policeWalk: 5 + (h % 6), gyms: 8 + h, convenience: 25 + h * 2,
        hospitals: 12 + h, pharmacies: 6 + (h % 9), parks: 1 + (h % 5), banks: 3 + (h % 6), cafes: 40 + h * 5,
        restaurants: 90 + h * 9, department: h % 2, mart: 1 + (h % 2), subway: h % 3, bus: 14 + h,
      },
    },
  );
}

// 다른 사람이 쓴 예시 리뷰(기존 INITIAL_REVIEWS 재사용) + Preview에서 직접 작성한 리뷰
function reviewsFor(adminDongId) {
  const dong = findDong(adminDongId);
  if (!dong) return null;
  const mine = readState().myReviews.filter((r) => r.adminDongId === dong.adminDongId);
  const offset = hashOf(dong.dongName) % INITIAL_REVIEWS.length;
  const samples = [0, 1, 2].map((i) => {
    const source = INITIAL_REVIEWS[(offset + i) % INITIAL_REVIEWS.length];
    return toReviewResponse(source, { reviewId: dong.adminDongId * 10 + i, ...dong, writerId: 900 + i });
  });
  return [...mine, ...samples];
}

function reviewStatsFor(guName) {
  return (DONG_DATA[guName]?.dong ?? []).map((name) => {
    const h = hashOf(name);
    return { dongName: name, reviewCount: 2 + (h % 9), avgRating: Number((3.4 + (h % 15) / 10).toFixed(1)) };
  });
}

// ---------- 라우팅 ----------
const ok = (data) => ({ success: true, data, error: null });
const recommendResponse = () =>
  ok({ conditionId: DESIGN_PREVIEW_CONDITION_ID, recommendations: RECOMMENDATIONS, filterFunnel: null });
const fail = (status, message) => ({ error: { status, data: { success: false, data: null, error: { message } } } });

function parseIds(config) {
  const raw = config.params?.ids ?? "";
  return String(raw).split(",").map(Number).filter(Number.isFinite);
}

function parseBody(config) {
  if (!config.data) return {};
  if (typeof config.data !== "string") return config.data;
  try {
    return JSON.parse(config.data);
  } catch {
    return {};
  }
}

function nowIso() {
  return new Date().toISOString().slice(0, 19);
}

/**
 * 요청 하나에 대한 목 응답을 찾는다.
 * - { data, status?, delay? }: 목 응답
 * - { error: { status, data } }: 목 오류 응답
 * - null: 목 대상이 아님 -> 호출부(installDesignPreviewAdapter)가 실제 서버로 보내지 않고 차단한다.
 */
export function resolveDesignPreviewMock(config) {
  const method = (config.method || "get").toLowerCase();
  const url = (config.url || "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/api(?=\/)/, "").split("?")[0];
  const state = readState();
  let m;

  // ---- 인증: 카카오 서버/백엔드 대신 Mock 사용자로 로그인 ----
  if (method === "post" && url === "/auth/kakao/callback") {
    return { data: { user: PREVIEW_USER, accessToken: DESIGN_PREVIEW_TOKEN, tokenType: "Bearer" } };
  }
  if (method === "get" && url === "/auth/me") {
    return localStorage.getItem("accessToken") ? { data: { user: PREVIEW_USER } } : fail(401, "로그인이 필요합니다.");
  }
  if (method === "post" && url === "/auth/logout") return { data: ok(null) };

  // ---- 추천 계산(실제로는 OpenAI 추천 이유 생성 포함) - 항상 목으로 대체해 AI 요청을 막는다 ----
  if (method === "post" && url === "/user-conditions") return { data: recommendResponse(), delay: RECOMMEND_DELAY_MS };
  if (method === "post" && /^\/user-conditions\/\d+\/recompute$/.test(url)) return { data: recommendResponse(), delay: RECOMMEND_DELAY_MS };

  if (method === "get" && url === "/user-conditions/saved") {
    return { data: ok(SAVED_CONDITIONS.filter((c) => !state.deletedConditionIds.includes(c.conditionId))) };
  }
  if (method === "get" && (m = url.match(/^\/user-conditions\/(\d+)\/recommendations$/))) {
    return { data: ok(RECOMMENDATIONS), delay: 400 };
  }
  if ((m = url.match(/^\/user-conditions\/(\d+)\/save$/))) {
    const id = Number(m[1]);
    if (method === "delete") {
      if (!state.deletedConditionIds.includes(id)) state.deletedConditionIds.push(id);
    } else if (method === "put") {
      state.deletedConditionIds = state.deletedConditionIds.filter((x) => x !== id);
    }
    writeState();
    return { data: ok(null) };
  }

  // ---- 동네 정보 ----
  if (method === "get" && url === "/admin-dongs") {
    const { guName, dongName: name } = config.params ?? {};
    if (!guName || !name) return fail(400, "구/동 이름이 필요합니다.");
    // 실제 GET /admin-dongs 응답 필드: { adminDongId, guName, name } (ExploreView.vue 기준)
    const dong = lookupAdminDong(guName, name);
    return { data: { adminDongId: dong.adminDongId, guName: dong.guName, name: dong.dongName } };
  }
  if (method === "get" && url === "/admin-dongs/batch") {
    const details = parseIds(config).map(detailFor);
    if (details.length > 0 && details.every(Boolean)) return { data: ok(details), delay: 500 };
    return null;
  }
  if (method === "get" && url === "/admin-dongs/review-stats") {
    return { data: ok(reviewStatsFor(config.params?.guName)) };
  }
  if (method === "get" && (m = url.match(/^\/admin-dongs\/(\d+)\/places$/))) {
    const id = Number(m[1]);
    if (MOCK_DONG_IDS.has(id)) return { data: ok(buildPlaces(id)) };
    if (findDong(id)) return { data: ok([]) };
    return null;
  }

  // ---- 관심 동네: localStorage로 저장 여부 관리 ----
  if (url === "/favorite-dongs" && method === "get") {
    const sorted = [...state.favorites].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { data: ok(sorted) };
  }
  if (url === "/favorite-dongs" && method === "post") {
    const adminDongId = Number(parseBody(config).adminDongId);
    if (!state.favorites.some((f) => f.adminDongId === adminDongId)) {
      state.favorites.push({ adminDongId, createdAt: nowIso() });
      writeState();
    }
    return { data: ok(null) };
  }
  if (method === "delete" && (m = url.match(/^\/favorite-dongs\/(\d+)$/))) {
    state.favorites = state.favorites.filter((f) => f.adminDongId !== Number(m[1]));
    writeState();
    return { data: ok(null) };
  }

  // ---- 리뷰: 작성/수정/삭제는 localStorage에만 반영 ----
  if (method === "get" && url === "/reviews/me") return { data: state.myReviews };
  if (method === "get" && url === "/reviews") {
    const reviews = reviewsFor(config.params?.adminDongId);
    return reviews ? { data: reviews } : null;
  }
  if (method === "post" && url === "/reviews") {
    const body = parseBody(config);
    const dong = findDong(body.adminDongId) ?? { adminDongId: Number(body.adminDongId), guName: "", dongName: "" };
    const review = {
      reviewId: Date.now() % 1000000000,
      adminDongId: dong.adminDongId,
      adminDongName: dong.dongName,
      guName: dong.guName,
      overallRating: body.overallRating,
      content: body.content,
      anonymous: Boolean(body.anonymous),
      status: "ACTIVE",
      writerId: PREVIEW_USER.userId,
      writerNickname: PREVIEW_USER.nickname,
      categoryScores: body.categoryScores ?? {},
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.myReviews.unshift(review);
    writeState();
    return { data: review, status: 201, delay: 400 };
  }
  if (method === "post" && /^\/reviews\/\d+\/reports$/.test(url)) return { data: ok(null) };
  if ((m = url.match(/^\/reviews\/(\d+)$/))) {
    const id = Number(m[1]);
    const idx = state.myReviews.findIndex((r) => r.reviewId === id);
    if (method === "get") return idx >= 0 ? { data: state.myReviews[idx] } : fail(404, "리뷰를 찾을 수 없습니다.");
    if (idx < 0) return fail(404, "리뷰를 찾을 수 없습니다.");
    if (method === "put") {
      const body = parseBody(config);
      state.myReviews[idx] = { ...state.myReviews[idx], ...body, updatedAt: nowIso() };
      writeState();
      return { data: state.myReviews[idx], delay: 300 };
    }
    if (method === "delete") {
      state.myReviews.splice(idx, 1);
      writeState();
      return { data: ok(null) };
    }
  }

  return null;
}

/** 목 응답을 axios 어댑터 응답 객체로 감싼다. */
export async function buildMockResponse(config, mock) {
  await new Promise((resolve) => setTimeout(resolve, mock.delay ?? DEFAULT_DELAY_MS));
  return {
    data: mock.data,
    status: mock.status ?? 200,
    statusText: "OK",
    headers: { "x-design-preview": "mock" },
    config,
    request: {},
  };
}
