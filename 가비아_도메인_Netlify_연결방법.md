# 가비아 도메인을 Netlify에 연결하는 방법

connectsell.co.kr 도메인(가비아)을 Netlify에 올린 사이트로 연결하려면 아래 순서대로 하세요.

---

## 1. Netlify에 배포가 되어 있어야 함

- **방법 A**: 터미널에서  
  `cd C:\Users\USER\connectsell`  
  후  
  `npx --yes netlify-cli deploy --dir=. --prod`  
  실행 (이미 폴더가 profound-cranachan 사이트에 연결돼 있음)
- **방법 B**: https://app.netlify.com 접속 → **Sites** → 해당 사이트 선택 → **Deploys** → **Drag and drop** 에서 `connectsell` 폴더 전체를 드래그해서 올리기

배포가 끝나면 **사이트 URL**이 나옵니다. (예: https://profound-cranachan-73021b.netlify.app)

---

## 2. Netlify에서 커스텀 도메인 추가

1. https://app.netlify.com 로그인
2. 해당 사이트(예: profound-cranachan-73021b) 클릭
3. **Domain settings** (도메인 설정) 또는 **Domain management** 로 이동
4. **Add custom domain** / **Add domain alias** 클릭
5. **connectsell.co.kr** 입력 후 추가
6. **www.connectsell.co.kr** 도 추가 (같은 메뉴에서)
7. Netlify가 **DNS 설정 안내**를 띄웁니다.  
   - **A 레코드** 또는 **CNAME** 에 넣을 값(주소)을 **메모**해 두세요.

---

## 3. 가비아에서 DNS 설정

1. https://www.gabia.com 로그인
2. **서비스 관리** → **connectsell.co.kr** → **관리**
3. 왼쪽 메뉴에서 **DNS 정보** (또는 **네임서버/DNS 설정**) 클릭
4. Netlify 안내에 맞게 설정:

   | 타입  | 호스트(이름) | 값(가리킬 주소) |
   |------|----------------|------------------|
   | A    | @              | Netlify가 알려준 IP (예: 75.2.60.5) |
   | CNAME| www            | Netlify 사이트 주소 (예: profound-cranachan-73021b.netlify.app) |

   (Netlify 화면에 나오는 값이 우선입니다. 그대로 입력하세요.)

5. **저장** 후 반영까지 10분~몇 시간 걸릴 수 있음

---

## 4. 확인

- 브라우저에서 **https://www.connectsell.co.kr** 접속
- **https://www.connectsell.co.kr/sample/landing.html** 로 샘플 페이지 확인

---

## 요약

| 단계 | 할 일 |
|------|--------|
| 1 | Netlify에 connectsell 폴더 배포 (CLI 또는 드래그) |
| 2 | Netlify에서 connectsell.co.kr, www.connectsell.co.kr 추가 |
| 3 | 가비아 DNS에서 A·CNAME 값을 Netlify 안내대로 입력 |
| 4 | 접속 테스트 |

도메인만 가비아에 두고, 실제 파일은 Netlify에서 서비스하는 구조입니다.
