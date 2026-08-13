let kakaoMapPromise = null;

export const loadKakaoMap = () => {
  if (window.kakao?.maps) {
    return new Promise((resolve) => {
      window.kakao.maps.load(() => resolve(window.kakao));
    });
  }

  if (kakaoMapPromise) {
    return kakaoMapPromise;
  }

  kakaoMapPromise = new Promise((resolve, reject) => {
    const appKey = import.meta.env.VITE_KAKAO_JS_KEY;

    if (!appKey) {
      reject(
        new Error(
          "VITE_KAKAO_JS_KEY 환경변수가 설정되지 않았습니다."
        )
      );
      return;
    }

    const script = document.createElement("script");

    script.src =
      `https://dapi.kakao.com/v2/maps/sdk.js` +
      `?appkey=${appKey}` +
      `&autoload=false` +
      `&libraries=services,clusterer`;

    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve(window.kakao);
      });
    };

    script.onerror = () => {
      kakaoMapPromise = null;
      reject(new Error("카카오맵 SDK를 불러오지 못했습니다."));
    };

    document.head.appendChild(script);
  });

  return kakaoMapPromise;
};
