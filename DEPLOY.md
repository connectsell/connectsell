# ConnectSell GitHub 배포 가이드

## 1. Git 설치

Git이 없다면 먼저 설치하세요.

- 다운로드: https://git-scm.com/download/win
- 설치 후 **PowerShell/터미널을 다시 열어야** `git` 명령이 인식됩니다.

---

## 2. GitHub에 업로드

PowerShell에서 아래 명령을 **순서대로** 실행하세요.

```powershell
cd C:\Users\USER\connectsell

git init
git add .
git commit -m "Initial commit: ConnectSell 웹사이트"
git branch -M main
git remote add origin https://github.com/connectsell/connectsell.git
git push -u origin main
```

- `git push` 시 GitHub 로그인 창이 뜨면 로그인하세요.
- **connectsell** 조직의 저장소에 push 권한이 있어야 합니다.

---

## 3. 홈페이지 배포 방법

### 방법 A: GitHub Pages (무료)

1. https://github.com/connectsell/connectsell 접속
2. **Settings** → **Pages**
3. **Source**: `Deploy from a branch`
4. **Branch**: `main` / **Folder**: `/ (root)`
5. **Save** 클릭

몇 분 후 `https://connectsell.github.io/connectsell/` 에서 사이트가 열립니다.

### 방법 B: Netlify (추천)

1. https://netlify.com 접속 후 로그인
2. **Add new site** → **Import an existing project**
3. **GitHub** 연결 → **connectsell/connectsell** 선택
4. **Deploy site** 클릭

자동으로 `https://랜덤이름.netlify.app` 형태의 URL이 생성됩니다.  
원하면 **Domain settings**에서 커스텀 도메인을 연결할 수 있습니다.

### 방법 C: Vercel

1. https://vercel.com 접속 후 로그인
2. **Add New** → **Project**
3. **connectsell/connectsell** 선택
4. **Deploy** 클릭

---

## 4. 이후 수정 시 업데이트

코드를 수정한 뒤:

```powershell
cd C:\Users\USER\connectsell
git add .
git commit -m "수정 내용 설명"
git push
```

GitHub Pages / Netlify / Vercel은 push 시 자동으로 다시 배포됩니다.
