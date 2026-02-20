// 모바일 햄버거 메뉴
(function() {
    var header = document.getElementById('main-header');
    var nav = document.getElementById('main-nav');
    var toggle = document.querySelector('.nav-toggle');
    var overlay = document.getElementById('nav-overlay');
    function openNav() {
        if (header) header.classList.add('nav-open');
        if (overlay) { overlay.classList.add('nav-overlay-visible'); overlay.setAttribute('aria-hidden', 'false'); }
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeNav() {
        if (header) header.classList.remove('nav-open');
        if (overlay) { overlay.classList.remove('nav-overlay-visible'); overlay.setAttribute('aria-hidden', 'true'); }
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    if (toggle) toggle.addEventListener('click', function() {
        if (header && header.classList.contains('nav-open')) closeNav();
        else openNav();
    });
    if (overlay) overlay.addEventListener('click', closeNav);
    if (nav) nav.querySelectorAll('a').forEach(function(a) { a.addEventListener('click', closeNav); });
})();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll animation to service cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// #1~#4 서비스 행 순서대로 노출: 섹션이 화면에 들어오면 #1 → #2 → #3 → #4 순으로 페이드인
(function() {
    var section = document.getElementById('about');
    if (!section) return;
    var done = false;
    function addReveal() {
        if (done) return;
        done = true;
        section.classList.add('revealed');
    }
    var io = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) addReveal();
    }, { threshold: 0.12 });
    io.observe(section);
    setTimeout(addReveal, 2000);
})();

// 협업 문의 폼 카드 스크롤 시 페이드인
var contactCard = document.querySelector('.contact-form-card');
if (contactCard) {
    contactCard.style.opacity = '0';
    contactCard.style.transform = 'translateY(30px)';
    contactCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(contactCard);
}

// 협업 문의 탭 전환 (브랜드 / 크리에이터) - 탭 클릭 시 폼 리셋
document.querySelectorAll('.contact-tab').forEach(function(btn) {
    btn.addEventListener('click', function() {
        var tab = this.getAttribute('data-tab');
        var wasActive = this.classList.contains('active');
        document.querySelectorAll('.contact-tab').forEach(function(b) {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        var hidden = document.getElementById('contact-type');
        if (hidden) hidden.value = tab;
        if (!wasActive) {
            var form = document.getElementById('partner-form');
            if (form) {
                form.reset();
                if (hidden) hidden.value = tab;
                var privacyContent = document.getElementById('privacy-content');
                var privacyToggle = document.getElementById('privacy-toggle');
                if (privacyContent) privacyContent.classList.remove('expanded');
                if (privacyToggle) privacyToggle.setAttribute('aria-expanded', 'false');
            }
        }
    });
});

// 개인정보 동의 토글 (펼치기/접기)
(function() {
    var toggle = document.getElementById('privacy-toggle');
    var content = document.getElementById('privacy-content');
    if (!toggle || !content) return;
    toggle.addEventListener('click', function() {
        var expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', !expanded);
        content.classList.toggle('expanded', !expanded);
    });
})();

// 파트너 폼 제출 → FormSubmit (개인정보 동의 필수)
(function() {
    var form = document.getElementById('partner-form');
    if (!form) return;
    form.addEventListener('submit', function(e) {
        var consent = document.getElementById('privacy-consent');
        if (consent && !consent.checked) {
            e.preventDefault();
            alert('개인정보 수집·이용에 동의해 주세요.');
            consent.focus();
            return;
        }
        var path = (window.location.pathname || '/index.html').split('?')[0];
        var next = document.getElementById('form-next');
        var subject = document.getElementById('form-subject');
        if (next) next.value = (window.location.origin || '') + path + '?submitted=1#contact';
        if (subject) subject.value = '[ConnectSell 문의] ' + (document.getElementById('contact-type').value === 'creator' ? '크리에이터' : '브랜드');
    });
})();

// FormSubmit 리다이렉트 후 알림
(function() {
    var params = new URLSearchParams(window.location.search);
    var hashPart = (window.location.hash || '').replace(/^#/, '');
    if (hashPart && hashPart.includes('?')) {
        var hashParams = new URLSearchParams(hashPart.split('?')[1] || '');
        if (hashParams.get('submitted') === '1') params = hashParams;
    }
    if (params.get('submitted') === '1') {
        alert('문의내용이 전송되었습니다.');
        params.delete('submitted');
        var cleanHash = window.location.hash.split('?')[0] || '#contact';
        var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + cleanHash;
        history.replaceState(null, '', clean);
    }
})();

// Header: 스크롤해도 헤더 스타일 변경하지 않음 (항상 투명 배경 + 흰색 텍스트 유지)

// Video handling
const heroVideo = document.querySelector('.hero-video');
const animatedBackground = document.querySelector('.hero-animated-background');

if (heroVideo) {
    let videoLoaded = false;
    let fallbackShown = false;
    let currentSourceIndex = 0;

    // 비디오 소스 목록
    const videoSources = heroVideo.querySelectorAll('source');
    
    // 비디오를 강제로 표시
    heroVideo.style.display = 'block';
    heroVideo.style.opacity = '1';
    heroVideo.style.visibility = 'visible';
    heroVideo.style.zIndex = '0';
    
    function tryNextSource() {
        if (currentSourceIndex < videoSources.length - 1) {
            currentSourceIndex++;
            const nextSource = videoSources[currentSourceIndex];
            heroVideo.src = nextSource.src;
            heroVideo.load();
            console.log('다음 비디오 소스 시도:', nextSource.src);
        } else {
            console.log('모든 비디오 소스 실패 - 애니메이션 배경 사용');
            showFallback();
        }
    }

    // 비디오 로드 성공 시
    heroVideo.addEventListener('loadeddata', function() {
        videoLoaded = true;
        heroVideo.classList.remove('hidden');
        heroVideo.style.opacity = '1';
        heroVideo.style.visibility = 'visible';
        heroVideo.style.display = 'block';
        
        if (animatedBackground) {
            animatedBackground.classList.remove('active');
        }
        
        // 비디오 재생 시도
        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(function() {
                console.log('비디오 재생 성공');
            }).catch(function(error) {
                console.log('비디오 자동 재생 실패:', error);
                // 재생 실패해도 비디오는 표시
                heroVideo.style.opacity = '1';
                heroVideo.style.visibility = 'visible';
            });
        }
    });

    // 비디오 로드 에러 처리
    heroVideo.addEventListener('error', function(e) {
        console.log('비디오 로드 실패:', e);
        console.log('현재 시도한 URL:', heroVideo.src);
        console.log('비디오 에러 코드:', heroVideo.error ? heroVideo.error.code : 'unknown');
        tryNextSource();
    });
    
    // 비디오 로드 시작 시
    heroVideo.addEventListener('loadstart', function() {
        console.log('비디오 로드 시작:', heroVideo.src);
    });
    
    // 비디오 로드 중단 시
    heroVideo.addEventListener('abort', function() {
        console.log('비디오 로드 중단:', heroVideo.src);
        tryNextSource();
    });

    // 비디오가 재생 가능할 때
    heroVideo.addEventListener('canplay', function() {
        videoLoaded = true;
        heroVideo.classList.remove('hidden');
        heroVideo.style.opacity = '1';
        heroVideo.style.visibility = 'visible';
        heroVideo.style.display = 'block';
    });

    // 비디오가 재생 시작될 때
    heroVideo.addEventListener('playing', function() {
        videoLoaded = true;
        heroVideo.classList.remove('hidden');
        heroVideo.style.opacity = '1';
        heroVideo.style.visibility = 'visible';
        if (animatedBackground) {
            animatedBackground.classList.remove('active');
        }
    });

    function showFallback() {
        if (fallbackShown) return;
        fallbackShown = true;
        heroVideo.classList.add('hidden');
        if (animatedBackground) {
            animatedBackground.classList.add('active');
        }
    }

    // 첫 번째 소스로 시작
    if (videoSources.length > 0) {
        // 첫 번째 소스의 src를 직접 설정
        const firstSource = videoSources[0];
        console.log('첫 번째 비디오 소스 시도:', firstSource.src);
        heroVideo.src = firstSource.src;
        heroVideo.load();
        
        // 강제로 재생 시도
        setTimeout(function() {
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise.then(function() {
                    console.log('비디오 재생 성공:', heroVideo.src);
                }).catch(function(error) {
                    console.log('초기 재생 시도 실패:', error);
                    console.log('비디오 URL:', heroVideo.src);
                });
            }
        }, 500);
    } else {
        console.log('비디오 소스를 찾을 수 없습니다.');
    }

    // 일정 시간 후 비디오가 로드되지 않으면 폴백 표시
    setTimeout(function() {
        if (!videoLoaded && !fallbackShown) {
            console.log('비디오 로드 타임아웃 - 비디오는 표시하되 폴백도 준비');
            // 비디오는 계속 표시 시도
        }
    }, 8000);
}
