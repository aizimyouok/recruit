// =========================
// navigation.js - 네비게이션 관련 모듈 (완전한 통합 버전)
// =========================

export const NavigationModule = {
    switchPage(appInstance, pageId) {
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
            interviewSchedule: '면접관별 상세 일정' 
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
                    // 차트가 없다면 먼저 초기화
                    if (Object.keys(appInstance.state.charts.instances).length === 0) {
                        appInstance.charts.initialize();
                    }
                    appInstance.stats.update();
                    appInstance.trend.update();
                    // 🔥 새로운 인구통계 시스템 초기화
                    appInstance.demographics.initialize();
                }
            }, 100);
        } else if (pageId === 'efficiency') {
            setTimeout(() => {
                if (window.Chart && appInstance.state.data.all.length > 0) {
                    // 효율성 차트가 없다면 먼저 초기화
                    if (!appInstance.state.charts.instances.radar || !appInstance.state.charts.instances.scatter) {
                        appInstance.charts.initializeEfficiency();
                    }
                    appInstance.efficiency.updateAll();
                }
            }, 100);
        } else if (pageId === 'interviewSchedule') { // 추가된 부분
            setTimeout(() => {
                if (appInstance.interviewSchedule && appInstance.state.data.all.length > 0) {
                    appInstance.interviewSchedule.initialize(appInstance);
                }
            }, 100);
        } else if (pageId === 'dashboard') {
            // 대시보드 페이지로 돌아올 때 필요한 처리
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

    // 현재 활성 페이지 ID 반환
    getCurrentPage() {
        const activePage = document.querySelector('.page.active');
        return activePage ? activePage.id : 'dashboard';
    },

    // 페이지 히스토리 관리
    updateHistory(pageId) {
        try {
            if (history.pushState) {
                const newUrl = window.location.origin + window.location.pathname + '?page=' + pageId;
                const currentUrl = window.location.href;
                
                // URL이 실제로 변경되는 경우에만 히스토리에 추가
                if (currentUrl !== newUrl) {
                    history.pushState({ page: pageId }, '', newUrl);
                }
            }
        } catch (error) {
            console.warn('히스토리 업데이트 실패:', error);
        }
    },

    // 브라우저 뒤로가기/앞으로가기 이벤트 처리
    initializeHistoryHandling(appInstance) {
        window.addEventListener('popstate', (event) => {
            const urlParams = new URLSearchParams(window.location.search);
            const pageFromUrl = urlParams.get('page') || 'dashboard';
            
            // 현재 활성 페이지와 다른 경우에만 페이지 전환
            const currentPage = NavigationModule.getCurrentPage();
            if (currentPage !== pageFromUrl) {
                NavigationModule.switchPage(appInstance, pageFromUrl);
            }
        });

        // 초기 페이지 로드 시 URL에서 페이지 정보 읽기
        const urlParams = new URLSearchParams(window.location.search);
        const initialPage = urlParams.get('page');
        const validPages = ['dashboard', 'stats', 'efficiency', 'interviewSchedule']; // 추가된 부분
        if (initialPage && validPages.includes(initialPage)) {
            // 초기 로드이므로 히스토리 추가 없이 페이지만 전환
            setTimeout(() => {
                NavigationModule.switchPageWithoutHistory(appInstance, initialPage);
            }, 100);
        }
    },

    // 히스토리 업데이트 없이 페이지 전환 (초기 로드용)
    switchPageWithoutHistory(appInstance, pageId) {
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
            interviewSchedule: '면접 일정'
        };
        
        const titleElement = document.getElementById('pageTitle');
        if (titleElement && titles[pageId]) {
            titleElement.textContent = titles[pageId];
        }

        // 페이지별 특수 처리
        NavigationModule.handlePageSpecificActions(appInstance, pageId);
    },

    // 페이지 전환 애니메이션 효과 추가
    addPageTransitionEffects() {
        const style = document.createElement('style');
        style.textContent = `
            .page {
                transition: opacity 0.3s ease, transform 0.3s ease;
                opacity: 0;
                transform: translateY(10px);
            }
            
            .page.active {
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
