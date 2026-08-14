/*
 * 백엔드 review_categories.code <-> 화면 표시용 한글 라벨 매핑.
 *
 * 기존에는 여러 컴포넌트가 각자 다른 값(mockData.js의 REVIEW_CATEGORIES 등)을
 * 가져다 써서 "안전" vs "치안"처럼 라벨이 어긋나 항목별 별점이 깨지는 문제가 있었다.
 * 리뷰 작성/수정/조회와 관련된 모든 화면은 반드시 이 파일의 상수를 사용한다.
 */
export const CATEGORY_CODE_TO_LABEL = {
  NOISE: "소음",
  CLEANLINESS: "청결",
  SAFETY: "안전",
  ATMOSPHERE: "분위기",
  TRANSIT: "교통",
};

// 화면에 표시할 항목별 별점 라벨 목록 (한글)
export const REVIEW_CATEGORIES = Object.values(CATEGORY_CODE_TO_LABEL);

// 한글 라벨 -> 백엔드 카테고리 코드 역매핑 (예: "소음" -> "NOISE")
export const CATEGORY_LABEL_TO_CODE = Object.fromEntries(
  Object.entries(CATEGORY_CODE_TO_LABEL).map(([code, label]) => [label, code]),
);

/*
 * 백엔드 ReviewResponse를 화면(ReviewCard/TabReview/MyReviewList/ReviewEditModal)이
 * 기존에 쓰던 형태로 변환한다.
 *
 * 실제 API 응답 예시:
 * {
 *   reviewId: 1,
 *   adminDongId: 12,
 *   adminDongName: "증산동",
 *   guName: "은평구",
 *   overallRating: 4,
 *   content: "...",
 *   anonymous: false,
 *   status: "ACTIVE",
 *   writerId: 3,
 *   writerNickname: "홍길동",
 *   categoryScores: { NOISE: 4, CLEANLINESS: 5, SAFETY: 4, ATMOSPHERE: 4, TRANSIT: 3 },
 *   createdAt: "2026-08-01T12:00:00",
 *   updatedAt: "2026-08-01T12:00:00",
 * }
 */
export function mapReviewResponse(apiReview) {
  const ratings = {};

  Object.entries(apiReview.categoryScores || {}).forEach(([code, score]) => {
    const label = CATEGORY_CODE_TO_LABEL[code] || code;
    ratings[label] = score;
  });

  return {
    id: apiReview.reviewId,
    reviewId: apiReview.reviewId,
    adminDongId: apiReview.adminDongId,
    district: apiReview.guName || "",
    dong: apiReview.adminDongName || "",
    author: apiReview.anonymous ? "익명" : apiReview.writerNickname || "익명",
    date: (apiReview.createdAt || "").slice(0, 10).replaceAll("-", "."),
    overallRating: apiReview.overallRating,
    content: apiReview.content,
    anonymous: !!apiReview.anonymous,
    status: apiReview.status,
    writerId: apiReview.writerId,
    ratings,
  };
}
