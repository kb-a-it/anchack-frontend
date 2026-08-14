import api from "../../common/api/axios";

export const getNeighborhoodDetail = (id) =>
  api.get(`/neighborhoods/${id}`);

export const compareNeighborhoods = (ids) =>
  api.post("/neighborhoods/compare", { ids });

/*
 * 화면에서 다루는 "구 이름 + 행정동 이름" 문자열을
 * 실제 DB의 admin_dong_id로 변환한다.
 *
 * 리뷰 작성/조회 등 admin_dong_id가 필요한 기능에서 사용한다.
 */
export const getAdminDong = (guName, dongName) =>
  api.get("/admin-dongs", {
    params: {
      guName,
      dongName,
    },
  });
