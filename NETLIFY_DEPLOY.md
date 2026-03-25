# Netlify 배포 가이드

## 1. Netlify 접속

1. https://www.netlify.com 접속
2. **Sign up** 또는 **Log in** (GitHub로 로그인 권장)

---

## 2. 새 사이트 추가

### 방법 A: 수동 배포 (가장 간단)

1. https://app.netlify.com 접속 후 로그인
2. **Add new site** → **Deploy manually** 클릭
3. **C:\Users\USER\connectsell** 폴더 **자체**를 드래그 (폴더 안을 열어서 내용만 넣지 말 것)
   - **동영상(hero.mp4)** 이 나오게 하려면: `connectsell\email\images\hero.mp4` 가 있는지 확인한 뒤, **반드시 connectsell 폴더 통째로** 드래그하세요. (동영상이 100MB 넘으면 압축 권장)
4. 배포 완료 후 주소:
   - 샘플 랜딩: `https://[사이트이름].netlify.app/connectsell/sample1` 또는 `.../sample/landing.html`
   - 공동구매 제안서: `https://[사이트이름].netlify.app/connectsell/email/kakkukishake` 또는 `.../email/kakkukishake.html`

### 방법 B: GitHub 연동

1. **Add new site** → **Import an existing project** 클릭
2. **GitHub** 선택 후 연결
3. **connectsell** 저장소 선택
4. **Deploy site** 클릭

---

## 3. 빌드 설정 (이미 netlify.toml에 설정됨)

- **Build command**: (비워두거나 기본값)
- **Publish directory**: `.` (루트)
- 정적 사이트이므로 별도 빌드 없이 바로 배포됩니다.

---

## 4. 도메인 연결 (connectsell.co.kr)

배포 완료 후:

1. **Domain settings** → **Add custom domain**
2. **connectsell.co.kr** 입력
3. **www.connectsell.co.kr** 도 추가 (옵션)
4. Netlify가 안내하는 **DNS 설정**을 가비아에서 적용

### 가비아 DNS 설정

- **A 레코드**: `@` → Netlify IP (Netlify 대시보드에 표시)
- **CNAME 레코드**: `www` → `connectsell.netlify.app` (또는 Netlify가 안내하는 값)

---

## 5. 동영상이 안 나올 때

- **확인**: 브라우저에서 `https://[사이트주소]/email/images/hero.mp4` 를 직접 열어보세요. 동영상이 재생되면 배포된 것이고, 404면 아직 서버에 없음.
- **해결**: `connectsell` 폴더 **전체**를 다시 드래그해서 배포하고, 1~2분 후 새로고침.

---

## 6. 이후 업데이트

GitHub에 `git push` 하면 Netlify가 자동으로 다시 배포합니다.

```powershell
cd C:\Users\USER\connectsell
git add .
git commit -m "수정 내용"
git push
```

---

## Vercel에서 전환 시

기존에 Vercel에 도메인을 연결했다면:

1. **가비아 DNS**에서 Vercel 관련 레코드 삭제
2. Netlify 안내에 따라 새 DNS 레코드 추가
3. 전파에 24~48시간 걸릴 수 있음
