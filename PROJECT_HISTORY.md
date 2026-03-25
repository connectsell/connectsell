# ConnectSell 프로젝트 작업 히스토리

> 홈페이지 수정 시 참고용 전체 작업 기록

---

## 📁 프로젝트 구조

```
connectsell/
├── index.html          # 메인 HTML
├── styles.css          # 스타일
├── script.js           # 스크립트
├── vercel.json         # Vercel 배포 설정
├── sample/             # 샘플신청 랜딩페이지 (인플루언서용)
│   ├── index.html      # 샘플 신청 폼
│   ├── sample.css      # 스타일
│   └── thanks.html     # 신청 완료 페이지
├── images/             # 이미지 (rolling, influencer, partners, service 등)
├── video/              # 동영상
│   ├── 25_02_06_완료 (8).mp4   # 메인 히어로 영상
│   └── namecard.mp4            # 협업 프로세스 섹션 배경 영상
├── README.md
├── DEPLOY.md           # 배포 가이드
├── 도메인연결가이드.md
└── PROJECT_HISTORY.md  # 이 파일
```

---

## 🔗 배포 정보

| 항목 | 값 |
|------|-----|
| **URL** | https://www.connectsell.co.kr |
| **샘플신청** | https://www.connectsell.co.kr/sample/ |
| **GitHub** | https://github.com/connectsell/connectsell |
| **배포** | Vercel (GitHub 연동 자동 배포) |
| **도메인** | 가비아 (connectsell.co.kr) |

---

## 📝 작업 히스토리 (시간순)

### 1. GitHub 배포 준비
- `C:\Users\USER\connectsell\` 폴더 생성
- index.html, styles.css, script.js, images/, video/ 복사
- .gitignore, README.md, DEPLOY.md 작성
- Git 초기화 및 GitHub push

### 2. 동영상 관련
- **메인 히어로 영상**: `video/25_02_06_완료 (8).mp4` (Downloads에서 복사)
- **협업 프로세스 영상**: `video/namecard.mp4` (Downloads에서 복사, 한글 파일명 → namecard.mp4로 변경)
- CDN 폴백 제거 (무관한 샘플 영상 표시 방지)
- **로딩 배경**: 초록색 → 어두운 회색(#1a1a1a)으로 변경 (동영상 로딩 시 깜빡임 완화)
- process-video-overlay 불투명도: 0.82 → 0.65 (동영상이 더 보이도록)

### 3. UI/텍스트 수정
- **네비게이션**: "Connect Sell" 텍스트(nav-logo) 제거 (CONTACT US 오른쪽)
- **텍스트 띄어쓰기**: "고객 경험(CX)을고려한" → "을 고려한"
- **줄바꿈**: "콘텐츠 적합도를 함께 고려해" → "함께" 뒤에 `<br>` 추가
- **브랜드 이미지**: object-fit: contain, padding 적용 (잘림 방지)

### 4. 도메인 연결
- **가비아 DNS 설정**:
  - A 레코드: @ → 76.76.21.21
  - CNAME: www → cname.vercel-dns.com. (끝에 점 필수)
- **Vercel**: connectsell.co.kr, www.connectsell.co.kr 도메인 추가
- SSL 인증서 자동 발급

### 5. 기타 (대화 요약 기준)
- LIFESTYLE MATCHING 섹션 텍스트 수정
- CONTACT US 섹션명 변경
- 푸터: 사업자번호, 통신판매업신고번호, CEO, 개인정보책임자 추가
- 인플루언서 카드 정리 (중복 제거, 20대 여성 뷰티 카드 추가)

---

### 2026-03-13: 홈페이지 동영상 로딩 개선 + 이메일 템플릿 v4 (브이롭티 TEA)

#### 1. 메인 동영상 늦게 뜨는 현상 수정
- **원인**: script.js에서 `heroVideo.load()` 재호출 시 진행 중인 로드가 abort되어 지연 발생
- **수정**:
  - `index.html`: `<link rel="preload" href="video/25_02_06_완료%20(8).mp4" as="video">` 추가
  - `script.js`: 초기 `heroVideo.src`, `heroVideo.load()` 호출 제거 (브라우저가 HTML source로 자동 로드)

#### 2. 이메일 템플릿 v4 생성
- **파일**: `email/kakkukishake-email-v4.html`
- **기반**: v3 복사 (파일명만 v4로 변경)

#### 3. 이메일 v4 - 브이롭티 TEA 전환
- **본문 텍스트 교체**: 단백질 쉐이크 → [가꾸기] 브이롭티 TEA
  - 붓기 관리, 컨디션 관리, 웰니스 루틴 TEA
  - 아침 루틴, 배달음식·불규칙 생활 패턴 등
  - "000님의 라이프스타일 · 루틴 콘텐츠 흐름과도 자연스럽게 연결될 수 있을 것" + "같아 공동구매 협업을 제안드리고자 연락드렸습니다." (줄바꿈 조정)
- **굵게 처리**: "붓기 관리와 컨디션 관리를 함께 할 수 있도록 기획된 웰니스 루틴 TEA입니다." / "아침 루틴으로 가볍게 한잔, 붓기 관리에 집중할 수 있는 제품입니다."

#### 4. 이메일 v4 - 이미지 교체
| 파일 | 교체 내용 |
|------|-----------|
| `email/images/store-review.png` | 상품리뷰 새 스크린샷 (포토&동영상 2,406건, 전체 3,378건) |
| `email/images/gakkuki-product-left.png` | 브이롭티 TEA (손에 든 보라색 티백) |
| `email/images/gakkuki-product.png` | 브이롭티 TEA (액체 흘러나오는 티백) |
| alt 텍스트 | "가꾸기 브이롭티 TEA" |

#### 5. 배포
- **배포**: Netlify `npx netlify-cli deploy --dir=. --prod`
- **사이트**: profound-cranachan-73021b.netlify.app
- **참고**: v4 이미지 반영을 위해 connectsell 폴더 전체 재배포 필요

---

## 🛠 수정 시 참고

### 동영상 교체
- 메인: `video/25_02_06_완료 (8).mp4` (100MB 미만이면 Git에 포함 가능)
- 협업 프로세스: `video/namecard.mp4`
- 100MB 초과 시: Cloudinary 등 외부 호스팅 후 URL로 교체

### 배포
```powershell
cd C:\Users\USER\connectsell
& "C:\Users\USER\AppData\Local\GitHubDesktop\app-3.5.5\resources\app\git\cmd\git.exe" add .
& "C:\Users\USER\AppData\Local\GitHubDesktop\app-3.5.5\resources\app\git\cmd\git.exe" commit -m "수정 내용"
& "C:\Users\USER\AppData\Local\GitHubDesktop\app-3.5.5\resources\app\git\cmd\git.exe" push
```

### Git 경로 (GitHub Desktop 사용 시)
```
C:\Users\USER\AppData\Local\GitHubDesktop\app-3.5.5\resources\app\git\cmd\git.exe
```

---

## 📌 주요 파일 경로

| 용도 | 경로 |
|------|------|
| 메인 HTML | C:\Users\USER\connectsell\index.html |
| 스타일 | C:\Users\USER\connectsell\styles.css |
| 스크립트 | C:\Users\USER\connectsell\script.js |
| 브랜드 롤링 이미지 | images/rolling/ (roll-1.png ~ roll-10.png) |
| 인플루언서 이미지 | images/influencer/ |
| 원본(참고용) | C:\Users\USER\ (index.html, styles.css 등) |

---

## 📋 TODO / 내일 할 일 (미완료)

### 1. FormSubmit 문의 폼 활성화
- **상태**: "Check Your Email" 메시지 표시됨
- **해야 할 일**: 
  1. connectsell01@gmail.com (또는 폼에 설정된 이메일) 메일함 확인
  2. FormSubmit에서 보낸 **"Activate Form"** 링크 클릭
  3. 활성화 완료 후 문의 폼이 정상 작동
- **참고**: FormSubmit은 무료 폼 서비스, 이메일로 문의 내용 전달

### 2. 텍스트 수정
| 위치 | 현재 | 수정 |
|------|------|------|
| #1 섹션 제목 | ConnectSell? | ConnectSell (물음표 제거) |
| #1 설명 | 브랜드와웰니스 (붙어있음) | 브랜드와 웰니스 (띄어쓰기) |

**브랜드와웰니스 수정 위치**: index.html 71번 줄  
`</span><span class="mobile-only">` → `</span> <span class="mobile-only">` (공백 추가)

### 3. 기타 개선 (선택)
- SEO 메타 태그, Open Graph 추가
- 문의 폼 제출 후 성공/실패 메시지

---

*마지막 업데이트: 2026년 3월 13일*
