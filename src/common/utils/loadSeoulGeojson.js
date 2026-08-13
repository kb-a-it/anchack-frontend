// 서울 행정동 경계 geojson(약 8.5MB)을 여러 지도 컴포넌트(ResultMap, NeighborhoodMap,
// DistrictMap, ExploreView)가 각자 fetch하고 있어서, 페이지에 따라 같은 8.5MB 파일을
// 최대 4번 중복 다운로드 + JSON.parse 하고 있었다.
// 모듈 레벨에 Promise를 캐싱해서, 최초 1번만 네트워크 요청/파싱하고 이후에는
// 캐시된 결과를 그대로 재사용하도록 한다.
let cachedPromise = null

export function loadSeoulGeojson() {
  if (!cachedPromise) {
    cachedPromise = fetch('/seoul_dong.geojson')
      .then((response) => response.json())
      .catch((err) => {
        // 실패한 경우 캐시를 비워서, 다음 호출에서 다시 시도할 수 있게 한다.
        cachedPromise = null
        throw err
      })
  }
  return cachedPromise
}
