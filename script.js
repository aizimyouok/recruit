// =========================
// 애플리케이션 메인 객체 (안전한 버전)
// =========================

console.log('🔧 script.js 실행 시작...');

// 전역 오류 핸들러
window.addEventListener('error', function(e) {
    console.error('전역 오류 발생:', e.error);
});

try {
    const App = {
        // =========================
        // 설정 및 상수
        // =========================
        config: {
            APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby3-nGn2KZCc49NIELYgr3_Wp_vUElARftdXuIEk-V2dh3Fb9p2yqe3fN4JhIVqpZR2/exec',
            ITEMS_PER_PAGE: 30,
            DEFAULT_HIDDEN_COLUMNS: ['비고', '부재', '거절', '보류', '면접확정', '면접 날짜', '면접 시간', '미참석', '불합격/보류', '입과/출근', '입과일', '지점배치', '면접리뷰'],
            REQUIRED_FIELDS: ['이름', '연락처', '지원루트', '모집분야'],
            DROPDOWN_OPTIONS: {
                '지원루트': ['사람인', '잡코리아', '인크루트', '아웃바운드', '배우공고', '당근', 'Instagram', 'Threads', '직접입력'],
                '모집분야': ['영업', '강사', '상조', '직접입력'],
                '성별': ['남', '여'],
                '증원자': ['회사', '이성진', '김영빈', '최혜진', '직접입력'],
                '1차 컨택 결과': ['부재1회', '부재2회', '보류', '거절', '파기', '면접확정'],
                '면접자': ['이성진', '김영빈', '최혜진', '직접입력'],
                '면접결과': ['미참석', '불합격', '보류', '합격']
            },
            DATE_FIELDS: ['면접 날짜', '면접 날자', '입과일'],
            TIME_FIELDS: ['면접 시간'],
            CHART_COLORS: {
                primary: '#818cf8',
                success: '#10b981',
                warning: '#f59e0b',
                danger: '#ef4444',
                orange: '#fb923c'
            }
        },

        // =========================
        // 애플리케이션 상태
        // =========================
        state: {
            data: {
                all: [],
                filtered: [],
                headers: []
            },
            ui: {
                currentPage: 1,
                totalPages: 1,
                visibleColumns: {},
                nextSequenceNumber: 1,
                activeDetailRowId: null,
                currentSortColumn: '지원일',
                currentSortDirection: 'desc',
                activeDateMode: 'all',
                currentView: 'table',
                searchTerm: '',
                searchTimeout: null,
                currentEditingData: null
            },
            charts: {
                instances: {},
                currentEfficiencyTab: 'route',
                currentTrendTab: 'all'
            }
        },

        // =========================
        // 애플리케이션 초기화
        // =========================
        init: {
            async start() {
                console.log('🚀 App.init.start() 호출됨');
                try {
                    App.theme.initialize();
                    App.init.setupEventListeners();
                    App.init.setupDateFilterListeners();
                    await App.data.fetch();
                    setTimeout(() => {
                        App.utils.enhanceAccessibility();
                    }, 1000);
                    console.log('✅ App 초기화 완료!');
                } catch (error) {
                    console.error('❌ App 초기화 중 오류:', error);
                }
            },

            setupEventListeners() {
                try {
                    document.addEventListener('click', function(event) {
                        const dropdownContainer = document.querySelector('.column-toggle-container');
                        if (dropdownContainer && !dropdownContainer.contains(event.target)) {
                            const dropdown = document.getElementById('columnToggleDropdown');
                            if (dropdown) dropdown.style.display = 'none';
                        }

                        if (window.innerWidth <= 768) {
                            const sidebar = document.getElementById('sidebar');
                            if (sidebar && sidebar.classList.contains('mobile-open') &&
                                !sidebar.contains(event.target) &&
                                !event.target.closest('.mobile-menu-btn')) {
                                App.ui.toggleMobileMenu();
                            }
                        }
                    });
                } catch (error) {
                    console.error('이벤트 리스너 설정 오류:', error);
                }
            },

            setupDateFilterListeners() {
                try {
                    const dateModeToggle = document.getElementById('dateModeToggle');
                    if (dateModeToggle) {
                        dateModeToggle.addEventListener('click', (e) => {
                            if (e.target.tagName === 'BUTTON') {
                                App.state.ui.activeDateMode = e.target.dataset.mode;
                                App.filter.updateDateFilterUI();
                                App.filter.apply();
                            }
                        });
                    }
                } catch (error) {
                    console.error('날짜 필터 리스너 설정 오류:', error);
                }
            }
        },

        // =========================
        // 테마 관련
        // =========================
        theme: {
            initialize() {
                try {
                    const savedTheme = localStorage.getItem('theme') || 'light';
                    document.documentElement.setAttribute('data-theme', savedTheme);
                    App.theme.updateIcon(savedTheme);
                } catch (error) {
                    console.error('테마 초기화 오류:', error);
                }
            },

            toggle() {
                try {
                    const currentTheme = document.documentElement.getAttribute('data-theme');
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    localStorage.setItem('theme', newTheme);
                    App.theme.updateIcon(newTheme);
                } catch (error) {
                    console.error('테마 토글 오류:', error);
                }
            },

            updateIcon(theme) {
                try {
                    const icon = document.getElementById('themeIcon');
                    if (icon) {
                        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                    }
                } catch (error) {
                    console.error('테마 아이콘 업데이트 오류:', error);
                }
            }
        },

        // =========================
        // 네비게이션 관련
        // =========================
        navigation: {
            switchPage(pageId) {
                try {
                    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                    const targetPage = document.getElementById(pageId);
                    if (targetPage) targetPage.classList.add('active');
                    
                    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                    const navItem = document.querySelector(`.nav-item[onclick="App.navigation.switchPage('${pageId}')"]`);
                    if (navItem) navItem.classList.add('active');

                    const titles = { 
                        dashboard: '지원자 현황', 
                        stats: '채용 통계 분석',
                        efficiency: '효율성 분석'
                    };
                    const titleElement = document.getElementById('pageTitle');
                    if (titleElement && titles[pageId]) {
                        titleElement.textContent = titles[pageId];
                    }

                    if (pageId === 'stats') {
                        setTimeout(() => {
                            if (window.Chart && App.state.data.all.length > 0) {
                                App.charts.initialize();
                                App.stats.update();
                                App.trend.update();
                            }
                        }, 100);
                    } else if (pageId === 'efficiency') {
                        setTimeout(() => {
                            if (window.Chart && App.state.data.all.length > 0) {
                                App.charts.initializeEfficiency();
                                App.efficiency.updateAll();
                            }
                        }, 100);
                    }

                    if (window.innerWidth <= 768) {
                        const sidebar = document.getElementById('sidebar');
                        if (sidebar && sidebar.classList.contains('mobile-open')) {
                            App.ui.toggleMobileMenu();
                        }
                    }
                } catch (error) {
                    console.error('페이지 전환 오류:', error);
                }
            }
        },

        // =========================
        // UI 관련 (기본 기능만)
        // =========================
        ui: {
            toggleMobileMenu() {
                try {
                    const sidebar = document.getElementById('sidebar');
                    const overlay = document.querySelector('.mobile-overlay');
                    if (sidebar) sidebar.classList.toggle('mobile-open');
                    if (overlay) overlay.classList.toggle('show');
                } catch (error) {
                    console.error('모바일 메뉴 토글 오류:', error);
                }
            },

            showLoadingState(container) {
                if (container) {
                    container.innerHTML = `
                        <div class="smooth-loading-container">
                            <div class="advanced-loading-spinner"></div>
                            <div class="loading-text">데이터를 불러오는 중입니다</div>
                        </div>`;
                }
            }
        },

        // =========================
        // 기본 데이터 관련
        // =========================
        data: {
            async fetch() {
                console.log('📊 데이터 가져오기 시작...');
                try {
                    const tableContainer = document.querySelector('.table-container');
                    if (tableContainer) {
                        App.ui.showLoadingState(tableContainer);
                    }

                    // 임시로 빈 데이터 설정 (API 호출 없이)
                    App.state.data.headers = ['구분', '이름', '연락처', '지원루트', '모집분야', '지원일'];
                    App.state.data.all = [];
                    App.state.data.filtered = [];

                    console.log('✅ 데이터 가져오기 완료 (테스트 모드)');
                    
                    if (tableContainer) {
                        tableContainer.innerHTML = '<p style="text-align: center; padding: 40px;">테스트 모드 - 필터 동기화 테스트 준비 완료!</p>';
                    }
                } catch (error) {
                    console.error('❌ 데이터 가져오기 실패:', error);
                }
            }
        },

        // =========================
        // 기본 필터 관련
        // =========================
        filter: {
            apply() {
                console.log('필터 적용됨');
            },

            updateDateFilterUI() {
                console.log('날짜 필터 UI 업데이트됨');
            }
        },

        // =========================
        // 기본 사이드바 관련
        // =========================
        sidebar: {
            updateWidgets() {
                console.log('사이드바 위젯 업데이트됨');
            }
        },

        // =========================
        // 기본 통계 관련
        // =========================
        stats: {
            update() {
                console.log('통계 업데이트됨');
            }
        },

        // =========================
        // 기본 효율성 관련
        // =========================
        efficiency: {
            updateAll() {
                console.log('효율성 분석 업데이트됨');
            }
        },

        // =========================
        // 기본 차트 관련
        // =========================
        charts: {
            initialize() {
                console.log('기본 차트 초기화됨');
            },

            initializeEfficiency() {
                console.log('효율성 차트 초기화됨');
            }
        },

        // =========================
        // 기본 추이 관련
        // =========================
        trend: {
            update() {
                console.log('추이 업데이트됨');
            }
        },

        // =========================
        // 기본 모달 관련
        // =========================
        modal: {
            close() {
                console.log('모달 닫힘');
            }
        },

        // =========================
        // 유틸리티 함수들
        // =========================
        utils: {
            enhanceAccessibility() {
                console.log('접근성 개선 완료');
            }
        }
    };

    // 전역 등록
    window.App = App;
    console.log('✅ App 객체 생성 및 전역 등록 완료!');

    // 디버깅 함수
    window.debugApp = function() {
        console.log('=== App 객체 디버그 정보 ===');
        console.log('App 정의됨:', typeof App !== 'undefined');
        console.log('window.App 정의됨:', typeof window.App !== 'undefined');
        console.log('App.init:', typeof App.init);
        console.log('App.state:', typeof App.state);
        console.log('App.data:', typeof App.data);
        console.log('App 객체:', App);
    };

} catch (error) {
    console.error('❌ App 객체 생성 중 치명적 오류:', error);
}

// =========================
// 애플리케이션 시작
// =========================

document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 DOM 로드 완료, App 초기화 시작...');
        console.log('App 객체 존재:', typeof App !== 'undefined');
        console.log('App.init 존재:', typeof App?.init !== 'undefined');
        
        if (typeof App !== 'undefined' && App.init) {
            App.init.start();
            console.log('✅ App 초기화 완료!');
        } else {
            console.error('❌ App 객체 또는 App.init을 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('❌ App 초기화 중 오류:', error);
    }
});

console.log('🔧 script.js 실행 완료!');
