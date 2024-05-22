# 실행 방법

1. http2는 TLS가 기본이므로, openssl을 통해 self signing이 필요합니다.
```bash
openssl req -nodes -new -x509 -keyout server.key -out server.crt -days 365
```

2. 서버 실행
```bash
> node server.js
```

3. 실행 후, 각 웹페이지 접속해서 속도 비교
> http://localhost:3000

> https://localhost:3001

개발자 도구의 콘솔 창을 통해 총 시간을 비교해볼 수 있다.

`생각보다 속도차가 많이 나지 않아서 조금 놀랬다.`
