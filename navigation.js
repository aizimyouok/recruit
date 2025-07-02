// js/navigation.js (최종 안정화 버전)

const NavigationModule = {
    // 각 페이지에 해당하는 모듈을 등록하는 객체
    pageModules: {
        report: null,
        interviewSchedule: null,
        costManagement: null,
        // 추후 다른 페이지들도 모듈로 관리 가능
        stats: null,
        efficiency: null,
        dashboard: null
    },

    // App 인스턴스로부터 각 페이지 모듈을 가져와 등록
    registerModules(appInstance) {
        if (this.pageModules.report) return; // 이미 등록되었다면 중복 실행 방지
        this.pageModules.report = appInstance.report;
        this.pageModules.interviewSchedule = appInstance.interviewSchedule;
        this.pageModules.costManagement = appInstance.costManagement;
        // 다른 모듈 등록...
    },

    /**
     * 페이지를 전환하는 새로운 메인 함수
     * @param {object} appInstance - 메인 App 객체
     * @param {string} newPageId - 전환할 페이지의 ID
     */
    switchPage(appInstance, newPageId) {
        // 모듈이 등록되지 않았다면 먼저 등록
        if (!this.pageModules.report) {
            this.registerModules(appInstance);
        }

        const oldPageId = this.getCurrentPage();
        if (oldPageId === newPageId && document.querySelector('.page.active')) return;

        // 1. 이전 페이지 모듈의 destroy 함수를 호출하여 기능 및 이벤트 리스너 정리
        const oldModule = this.pageModules[oldPageId];
        if (oldModule && typeof oldModule.destroy === 'function') {
            oldModule.destroy();
        }

        // 2. 모든 페이지 숨기고, 목표 페이지만 활성화
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(newPageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // 3. 네비게이션 메뉴 활성 상태 업데이트
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        const targetNavBtn = document.querySelector(`.nav-item[onclick*="'${newPageId}'"]`);
        if (targetNavBtn) {
            targetNavBtn.classList.add('active');
        }

        // 4. 페이지 제목 업데이트
        const titles = { 
            dashboard: '지원자 현황', stats: '채용 통계 분석', efficiency: '효율성 분석',
            interviewSchedule: '면접관별 상세 일정 및 입과 일정', report: '리포트 발행', costManagement: '비용 관리'
        };
        document.getElementById('pageTitle').textContent = titles[newPageId] || '대시보드';

        // 5. 새로운 페이지 모듈의 initialize 함수를 호출하여 기능 시작
        const newModule = this.pageModules[newPageId];
        if (newModule) {
            if (typeof newModule.initialize === 'function') {
                // ▼▼▼▼▼ 여기가 수정된 부분입니다 ▼▼▼▼▼
                setTimeout(() => newModule.initialize(appInstance), 10);
                // ▲▲▲▲▲ 여기가 수정된 부분입니다 ▲▲▲▲▲
            } else if (typeof newModule.onPageShow === 'function') {
                // costManagement 모듈처럼 onPageShow 메서드를 사용하는 경우
                setTimeout(() => newModule.onPageShow(), 10);
            }
        } else {
            // 모듈화되지 않은 레거시 페이지 처리
            this.handleLegacyPageActions(appInstance, newPageId);
        }
        
        // 6. 기타 UI 처리
        this.closeMobileSidebarIfOpen();
        this.updateHistory(newPageId);
    },

    // 모듈화되지 않은 페이지들의 스크립트를 처리하는 함수
    handleLegacyPageActions(appInstance, pageId) {
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
    
    // =========================================================================
    // 이하 이전에 누락되었던 필수 함수들을 모두 복원했습니다.
    // =========================================================================
    
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
                if (window.location.href !== newUrl) {
                    history.pushState({ page: pageId }, '', newUrl);
                }
            }
        } catch (error) {
            console.warn('히스토리 업데이트 실패:', error);
        }
    },

    initializeHistoryHandling(appInstance) {
        // 최초 페이지 로딩 시 URL을 기반으로 페이지 설정
        const urlParams = new URLSearchParams(window.location.search);
        const initialPage = urlParams.get('page') || 'dashboard';
        setTimeout(() => {
            this.switchPage(appInstance, initialPage);
        }, 100);

        // 뒤로가기/앞으로가기 버튼 처리
        window.addEventListener('popstate', (event) => {
            const pageFromUrl = event.state?.page || new URLSearchParams(window.location.search).get('page') || 'dashboard';
            if (this.getCurrentPage() !== pageFromUrl) {
                this.switchPage(appInstance, pageFromUrl);
            }
        });
    },

    // 오류의 원인이었던 함수를 복원했습니다.
    addPageTransitionEffects() {
        const styleId = 'page-transition-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .page {
                transition: opacity 0.3s ease, transform 0.3s ease;
                opacity: 0;
                transform: translateY(10px);
                display: none;
            }
            .page.active {
                display: block;
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
};
