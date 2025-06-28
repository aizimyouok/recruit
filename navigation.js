// js/navigation.js (리포트 페이지 초기화 로직 추가 버전)

export const NavigationModule = {
    switchPage(appInstance, pageId) {
        // ▼▼▼▼▼ [여기부터 추가] ▼▼▼▼▼
        // 페이지를 전환하기 전에, 현재 활성화된 페이지를 찾아서 정리(destroy) 함수를 호출합니다.
        const currentPageElement = document.querySelector('.page.active');
        if (currentPageElement) {
            const currentPageId = currentPageElement.id;
            // 만약 현재 페이지가 'report'라면, report 모듈의 destroy 함수를 실행합니다.
            if (currentPageId === 'report' && appInstance.report && typeof appInstance.report.destroy === 'function') {
                appInstance.report.destroy();
            }
            // 다른 페이지들도 정리 로직이 필요하다면 여기에 추가할 수 있습니다.
        }
        // ▲▲▲▲▲ [여기까지 추가] ▲▲▲▲▲
        // 모든 페이지 숨기기
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // 선택된 페이지 표시
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 네비게이션 버튼 상태 업데이트
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        const targetNavBtn = document.querySelector(`.nav-item[onclick*="'${pageId}'"]`);
        if (targetNavBtn) {
            targetNavBtn.classList.add('active');
        }

        // 페이지 제목 업데이트
        const titles = { 
            dashboard: '지원자 현황', 
            stats: '채용 통계 분석',
            efficiency: '효율성 분석',
            interviewSchedule: '면접관별 상세 일정',
            report: '리포트 발행'
        };
        
        const titleElement = document.getElementById('pageTitle');
        if (titleElement && titles[pageId]) {
            titleElement.textContent = titles[pageId];
        }

        // 페이지별 특수 처리
        NavigationModule.handlePageSpecificActions(appInstance, pageId);

        // 모바일에서 사이드바 닫기
        NavigationModule.closeMobileSidebarIfOpen();

        // 히스토리 업데이트 (선택사항)
        if (window.history && window.history.pushState) {
            NavigationModule.updateHistory(pageId);
        }
    },

    handlePageSpecificActions(appInstance, pageId) {
        if (pageId === 'stats') {
            setTimeout(() => {
                if (window.Chart && appInstance.state.data.all.length > 0) {
                    if (Object.keys(appInstance.state.charts.instances).length === 0) {
                        appInstance.charts.initialize();
                    }
                    appInstance.stats.update();
                    appInstance.trend.update();
                    appInstance.demographics.initialize();
                }
            }, 100);
        } else if (pageId === 'efficiency') {
            setTimeout(() => {
                if (window.Chart && appInstance.state.data.all.length > 0) {
                    if (!appInstance.state.charts.instances.radar || !appInstance.state.charts.instances.scatter) {
                        appInstance.charts.initializeEfficiency();
                    }
                    appInstance.efficiency.updateAll();
                }
            }, 100);
        } else if (pageId === 'interviewSchedule') {
            setTimeout(() => {
                if (appInstance.interviewSchedule && appInstance.state.data.all.length > 0) {
                    appInstance.interviewSchedule.initialize(appInstance);
                }
            }, 100);
        } else if (pageId === 'report') { // ▼▼▼▼▼ [수정된 부분] ▼▼▼▼▼
            setTimeout(() => {
                // 리포트 페이지로 전환될 때, ReportModule의 initialize 함수를 호출합니다.
                // 이 함수가 필터와 탭을 화면에 그리는 역할을 합니다.
                if (appInstance.report && typeof appInstance.report.initialize === 'function') {
                    appInstance.report.initialize(appInstance);
                }
            }, 100);
        } else if (pageId === 'dashboard') { // ▲▲▲▲▲ [수정된 부분] ▲▲▲▲▲
            if (appInstance.state.data.all.length > 0) {
                appInstance.data.updateInterviewSchedule();
                appInstance.sidebar.updateWidgets();
            }
        }
    },

    closeMobileSidebarIfOpen() {
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                const overlay = document.querySelector('.mobile-overlay');
                if (overlay) {
                    overlay.classList.remove('show');
                }
            }
        }
    },

    getCurrentPage() {
        const activePage = document.querySelector('.page.active');
        return activePage ? activePage.id : 'dashboard';
    },

    updateHistory(pageId) {
        try {
            if (history.pushState) {
                const newUrl = window.location.origin + window.location.pathname + '?page=' + pageId;
                const currentUrl = window.location.href;
                
                if (currentUrl !== newUrl) {
                    history.pushState({ page: pageId }, '', newUrl);
                }
            }
        } catch (error) {
            console.warn('히스토리 업데이트 실패:', error);
        }
    },

    initializeHistoryHandling(appInstance) {
        window.addEventListener('popstate', (event) => {
            const urlParams = new URLSearchParams(window.location.search);
            const pageFromUrl = urlParams.get('page') || 'dashboard';
            
            const currentPage = NavigationModule.getCurrentPage();
            if (currentPage !== pageFromUrl) {
                NavigationModule.switchPage(appInstance, pageFromUrl);
            }
        });

        const urlParams = new URLSearchParams(window.location.search);
        const initialPage = urlParams.get('page');
        const validPages = ['dashboard', 'stats', 'efficiency', 'interviewSchedule', 'report'];
        if (initialPage && validPages.includes(initialPage)) {
            setTimeout(() => {
                NavigationModule.switchPageWithoutHistory(appInstance, initialPage);
            }, 100);
        }
    },

    switchPageWithoutHistory(appInstance, pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        const targetNavBtn = document.querySelector(`.nav-item[onclick*="'${pageId}'"]`);
        if (targetNavBtn) {
            targetNavBtn.classList.add('active');
        }

        const titles = { 
            dashboard: '지원자 현황', 
            stats: '채용 통계 분석',
            efficiency: '효율성 분석',
            interviewSchedule: '면접관별 상세 일정',
            report: '리포트 발행'
        };
        
        const titleElement = document.getElementById('pageTitle');
        if (titleElement && titles[pageId]) {
            titleElement.textContent = titles[pageId];
        }

        NavigationModule.handlePageSpecificActions(appInstance, pageId);
    },

    addPageTransitionEffects() {
        const style = document.createElement('style');
        style.textContent = `
            .page {
                transition: opacity 0.3s ease, transform 0.3s ease;
                opacity: 0;
                transform: translateY(10px);
                display: none; /* 기본적으로 숨김 처리 */
            }
            
            .page.active {
                display: block; /* active 클래스가 있을 때만 보이도록 */
                opacity: 1;
                transform: translateY(0);
            }
            
            .nav-item {
                transition: all 0.2s ease;
            }
            
            .nav-item.active {
                background: #718096;
                border-left-color: var(--sidebar-accent);
                font-weight: 500;
            }
        `;
        
        if (!document.head.querySelector('#navigation-styles')) {
            style.id = 'navigation-styles';
            document.head.appendChild(style);
        }
    }
};
