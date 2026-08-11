import api from "../../common/api/axios";

/*
 * 실제 백엔드(ReviewController)는 district/dong 문자열이 아니라
 * admin_dong_id(Long)를 기준으로 리뷰를 조회한다.
 * district/dong -> adminDongId 변환은 region/api/neighborhood.js의
 * getAdminDong()으로 먼저 처리한 뒤 이 함수를 호출해야 한다.
 */
export const getReviews = (adminDongId) => api.get("/reviews", { params: { adminDongId } });

// 특정 리뷰 상세 조회
export const getReview = (reviewId) => api.get(`/reviews/${reviewId}`);

// 로그인한 사용자가 작성한 리뷰 목록
export const getMyReviews = () => api.get("/reviews/me");

export const createReview = (payload) => api.post("/reviews", payload);
export const updateReview = (id, payload) => api.put(`/reviews/${id}`, payload);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// 리뷰 좋아요 / 싫어요. reactionType: "LIKE" | "DISLIKE"
// 같은 반응을 다시 보내면 서버에서 취소 처리된다.
export const reactToReview = (reviewId, reactionType) =>
  api.post(`/reviews/${reviewId}/reactions`, { reactionType });

// 리뷰 신고
export const reportReview = (reviewId, reason) => api.post(`/reviews/${reviewId}/reports`, { reason });
