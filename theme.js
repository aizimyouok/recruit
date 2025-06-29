// =========================
// theme.js - 테마 관련 모듈 (완전한 통합 버전)
// =========================

export const ThemeModule = {
    // 테마 상수
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark'
    },

    STORAGE_KEY: 'theme',

    // 시스템 다크 모드 감지
    getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return ThemeModule.THEMES.DARK;
        }
        return ThemeModule.THEMES.LIGHT;
    },

    // 초기화
    initialize() {
        // 저장된 테마가 있는지 확인, 없으면 시스템 테마 사용
        const savedTheme = localStorage.getItem(ThemeModule.STORAGE_KEY);
        const initialTheme = savedTheme || ThemeModule.getSystemTheme();
        
        ThemeModule.setTheme(initialTheme);
        ThemeModule.setupSystemThemeListener();
        ThemeModule.addThemeTransitions();
        
        console.log('🎨 테마 초기화 완료:', initialTheme);
    },

    // 테마 토글
    toggle() {
        const currentTheme = ThemeModule.getCurrentTheme();
        const newTheme = currentTheme === ThemeModule.THEMES.DARK ? 
                         ThemeModule.THEMES.LIGHT : 
                         ThemeModule.THEMES.DARK;
        
        ThemeModule.setTheme(newTheme);
        
        // 토글 시 애니메이션 효과
        ThemeModule.addToggleAnimation();
        
        console.log('🎨 테마 변경:', currentTheme, '→', newTheme);
    },

    // 현재 테마 반환
    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || ThemeModule.THEMES.LIGHT;
    },

    // 특정 테마로 설정
    setTheme(theme) {
        if (!Object.values(ThemeModule.THEMES).includes(theme)) {
            console.warn('⚠️ 잘못된 테마:', theme);
            theme = ThemeModule.THEMES.LIGHT;
        }

        // DOM에 테마 적용
        document.documentElement.setAttribute('data-theme', theme);
        
        // 로컬 스토리지에 저장
        try {
            localStorage.setItem(ThemeModule.STORAGE_KEY, theme);
        } catch (error) {
            console.warn('⚠️ 테마 저장 실패:', error);
        }
        
        // 아이콘 업데이트
        ThemeModule.updateIcon(theme);
        
        // 메타 테마 컬러 업데이트 (모바일 브라우저용)
        ThemeModule.updateMetaThemeColor(theme);
        
        // 커스텀 이벤트 발생 (다른 컴포넌트에서 테마 변경을 감지할 수 있도록)
        ThemeModule.dispatchThemeChangeEvent(theme);
    },

    // 아이콘 업데이트
    updateIcon(theme) {
        const icon = document.getElementById('themeIcon');
        if (icon) {
            // 아이콘 변경 애니메이션
            icon.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                icon.className = theme === ThemeModule.THEMES.DARK ? 
                                'fas fa-sun' : 
                                'fas fa-moon';
                icon.style.transform = 'scale(1)';
            }, 150);
        }
    },

    // 메타 테마 컬러 업데이트 (모바일 브라우저 상단바 색상)
    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        // 테마에 따른 색상 설정
        const themeColors = {
            [ThemeModule.THEMES.LIGHT]: '#f8fafc',
            [ThemeModule.THEMES.DARK]: '#0f172a'
        };
        
        metaThemeColor.content = themeColors[theme];
    },

    // 시스템 테마 변경 감지
    setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                // 사용자가 수동으로 테마를 설정하지 않은 경우에만 시스템 테마 따라가기
                const savedTheme = localStorage.getItem(ThemeModule.STORAGE_KEY);
                if (!savedTheme) {
                    const newTheme = e.matches ? ThemeModule.THEMES.DARK : ThemeModule.THEMES.LIGHT;
                    ThemeModule.setTheme(newTheme);
                    console.log('🎨 시스템 테마 변경 감지:', newTheme);
                }
            });
        }
    },

    // 테마 변경 시 부드러운 전환 효과 추가
    addThemeTransitions() {
        if (!document.head.querySelector('#theme-transitions')) {
            const style = document.createElement('style');
            style.id = 'theme-transitions';
            style.textContent = `
                *, *::before, *::after {
                    transition: background-color 0.3s ease, 
                               color 0.3s ease, 
                               border-color 0.3s ease,
                               box-shadow 0.3s ease !important;
                }
                
                .theme-toggle {
                    transition: all 0.2s ease !important;
                }
                
                .theme-toggle:hover {
                    transform: scale(1.05);
                }
                
                #themeIcon {
                    transition: transform 0.3s ease !important;
                }
                
                /* 차트 컨테이너도 테마 전환 효과 적용 */
                .chart-container, 
                .content-container {
                    transition: background-color 0.3s ease, 
                               border-color 0.3s ease,
                               box-shadow 0.3s ease !important;
                }
            `;
            document.head.appendChild(style);
        }
    },

    // 토글 시 애니메이션 효과
    addToggleAnimation() {
        const button = document.querySelector('.theme-toggle');
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 100);
        }
        
        // 전체 화면에 subtle한 flash 효과
        ThemeModule.addFlashEffect();
    },

    // 테마 변경 시 flash 효과
    addFlashEffect() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        
        document.body.appendChild(flash);
        
        // 짧은 flash 효과
        requestAnimationFrame(() => {
            flash.style.opacity = '1';
            setTimeout(() => {
                flash.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(flash);
                }, 200);
            }, 50);
        });
    },

    // 커스텀 테마 변경 이벤트 발생
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: { theme, timestamp: Date.now() }
        });
        window.dispatchEvent(event);
    },

    // 테마 변경 이벤트 리스너 등록 헬퍼
    onThemeChange(callback) {
        window.addEventListener('themechange', (event) => {
            if (typeof callback === 'function') {
                callback(event.detail.theme);
            }
        });
    },

    // 테마 상태 정보 반환
    getThemeInfo() {
        const currentTheme = ThemeModule.getCurrentTheme();
        const systemTheme = ThemeModule.getSystemTheme();
        const savedTheme = localStorage.getItem(ThemeModule.STORAGE_KEY);
        
        return {
            current: currentTheme,
            system: systemTheme,
            saved: savedTheme,
            isSystemDefault: !savedTheme,
            isDark: currentTheme === ThemeModule.THEMES.DARK
        };
    },

    // 테마 초기화 (설정 리셋)
    reset() {
        try {
            localStorage.removeItem(ThemeModule.STORAGE_KEY);
            const systemTheme = ThemeModule.getSystemTheme();
            ThemeModule.setTheme(systemTheme);
            console.log('🎨 테마 리셋 완료, 시스템 테마로 복귀:', systemTheme);
        } catch (error) {
            console.error('❌ 테마 리셋 실패:', error);
        }
    },

    // 접근성을 위한 고대비 테마 감지
    isHighContrastMode() {
        return window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches;
    },

    // 애니메이션 감소 설정 감지
    isPrefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
};
