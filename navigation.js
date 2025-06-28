// js/navigation.js (최종 안정화 버전)

export const NavigationModule = {
    // 각 페이지에 해당하는 모듈을 등록합니다.
    pageModules: {
        report: null,
        interviewSchedule: null,
        stats: null,
        efficiency: null,
        dashboard: null
    },

    // App 객체에서 각 모듈을 받아와 등록합니다.
    registerModules(appInstance) {
        this.pageModules.report = appInstance.report;
        this.pageModules.interviewSchedule = appInstance.interviewSchedule;
        // 다른 페이지 모듈들도 필요에 따라 등록할 수 있습니다.
        // this.pageModules.stats = appInstance.stats; 
    },

    /**
     * 페이지를 전환하는 메인 함수 (가장 중요한 부분)
     * @param {object} appInstance - 메인 App 객체
     * @param {string} newPageId - 전환할 페이지의 ID
     */
    switchPage(appInstance, newPageId) {
        if (!this.pageModules.report) {
            this.registerModules(appInstance);
        }

        const oldPageId = this.getCurrentPage();

        // 1. 만약 현재 페이지와 목표 페이지가 같다면 아무것도 하지 않음
        if (oldPageId === newPageId) return;

        // 2. 현재 페이지(떠나는 페이지)의 destroy 함수를 호출하여 기능을 완전히 종료시킴
        const oldModule = this.pageModules[oldPageId];
        if (oldModule && typeof oldModule.destroy === 'function') {
            oldModule.destroy();
        }

        // 3. 모든 페이지에서 'active' 클래스를 제거하고 목표 페이지만 활성화
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(newPageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 4. 네비게이션 메뉴의 활성 상태 업데이트
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        const targetNavBtn = document.querySelector(`.nav-item[onclick*="'${newPageId}'"]`);
        if (targetNavBtn) {
            targetNavBtn.classList.add('active');
        }

        // 5. 페이지 제목 업데이트
        const titles = { 
            dashboard: '지원자 현황', stats: '채용 통계 분석', efficiency: '효율성 분석',
            interviewSchedule: '면접관별 상세 일정', report: '리포트 발행'
        };
        document.getElementById('pageTitle').textContent = titles[newPageId] || '대시보드';

        // 6. 새로 활성화된 페이지의 initialize 함수를 호출하여 기능을 시작시킴
        const newModule = this.pageModules[newPageId];
        if (newModule && typeof newModule.initialize === 'function') {
            // setTimeout을 주어 렌더링이 안정화된 후 스크립트를 실행
            setTimeout(() => newModule.initialize(), 50);
        }
        
        // 기타 UI 처리
        this.closeMobileSidebarIfOpen();
        this.updateHistory(newPageId);
    },

    // (이하 함수들은 이전과 거의 동일하지만 안정성을 위해 전체 코드를 제공합니다)
    handlePageSpecificActions(appInstance, pageId) {
        // 이 함수는 이제 각 모듈의 initialize 함수가 대체하므로, 레거시 호환성을 위해 남겨두거나 삭제할 수 있습니다.
        // 여기서는 switchPage에서 직접 모듈을 호출하므로 이 함수의 역할이 줄어듭니다.
        // 단, stats, efficiency 페이지는 아직 모듈화되지 않았으므로 기존 로직 유지
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
        } else if (pageId === 'dashboard') {
            if (appInstance.state.data.all.length > 0) {
                appInstance.data.updateInterviewSchedule();
                appInstance.sidebar.updateWidgets();
            }
        }
    },
    
    closeMobileSidebarIfOpen() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            document.querySelector('.mobile-overlay')?.classList.remove('show');
        }
    },

    getCurrentPage() {
        return document.querySelector('.page.active')?.id || 'dashboard';
    },

    updateHistory(pageId) {
        try {
            const newUrl = `${window.location.pathname}?page=${pageId}`;
            if (window.location.search !== `?page=${pageId}`) {
                history.pushState({ page: pageId }, '', newUrl);
            }
        } catch (error) {
            console.warn('히스토리 업데이트 실패:', error);
        }
    },

    initializeHistoryHandling(appInstance) {
        window.onpopstate = (event) => {
            const pageFromUrl = event.state?.page || new URLSearchParams(window.location.search).get('page') || 'dashboard';
            this.switchPage(appInstance, pageFromUrl);
        };
        const initialPage = new URLSearchParams(window.location.search).get('page') || 'dashboard';
        this.switchPage(appInstance, initialPage);
    },
};
