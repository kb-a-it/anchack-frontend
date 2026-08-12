import api from "../../common/api/axios";

/*
 * adminDongId는 getAdminDong()으로 조회한 뒤 전달한다.
 */
export const getReviews = (adminDongId) =>
  api.get("/reviews", { params: { adminDongId } });

// 리뷰 상세 조회
export const getReview = (reviewId) => api.get(`/reviews/${reviewId}`);

// 내 리뷰 목록
export const getMyReviews = () => api.get("/reviews/me");

// 리뷰 작성
export const createReview = (payload) => api.post("/reviews", payload);

// 리뷰 수정
export const updateReview = (id, payload) =>
  api.put(`/reviews/${id}`, payload);

// 리뷰 삭제
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

/*
 * 좋아요/싫어요 기능은 백엔드 비활성화로 주석 처리
 */
// export const reactToReview = (reviewId, reactionType) =>
//   api.post(`/reviews/${reviewId}/reactions`, { reactionType });

// 리뷰 신고
export const reportReview = (reviewId, reason) =>
  api.post(`/reviews/${reviewId}/reports`, { reason });
