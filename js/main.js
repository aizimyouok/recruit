// js/main.js

import { EventBus } from './core/EventBus.js';
import { StateManager } from './core/StateManager.js';
import { DataService } from './services/DataService.js';

// =========================
// 애플리케이션 메인 객체
// =========================
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
    // 내부 모듈 인스턴스들
    // =========================
    _modules: {
        eventBus: null,
        stateManager: null,
        dataService: null
    },

    // =========================
    // 애플리케이션 상태 접근자
    // =========================
    get state() {
        return this._modules.stateManager?.state || {
            data: { all: [], filtered: [], headers: [] },
            ui: { 
                currentPage: 1, 
                totalPages: 1, 
                visibleColumns: {}, 
                nextSequenceNumber: 1,
                currentSortColumn: '지원일',
                currentSortDirection: 'desc',
                activeDateMode: 'all',
                currentView: 'table',
                searchTerm: '',
                currentEditingData: null
            },
            charts: { instances: {}, currentEfficiencyTab: 'route', currentTrendTab: 'all' }
        };
    },

    // =========================
    // 사이드바 관련 (추가됨)
    // =========================
    sidebar: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter')?.value || 'all';
            const customRange = document.getElementById('sidebarCustomDateRange');

            if (selectedPeriod === 'custom') {
                if (customRange) customRange.style.display = 'block';
            } else {
                if (customRange) customRange.style.display = 'none';
                App.sidebar.updateWidgets();
            }
        },

        updateWidgets() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter')?.value || 'all';
            const applyDateIndex = App.state.data?.headers?.indexOf('지원일') ?? -1;

            let filteredApplicants = [...(App.state.data?.all || [])];
            let periodLabel = '전체 기간';

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                const result = App.sidebar.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                filteredApplicants = result.data;
                periodLabel = result.label;
            }

            const stats = App.sidebar.calculateStats(filteredApplicants);
            App.sidebar.updateUI(stats, periodLabel);

            // 통계 페이지가 활성화되어 있으면 업데이트
            if (document.getElementById('stats')?.classList.contains('active')) {
                App.stats.update();
            }
        },

        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            const now = new Date();
            let filteredData = [...data];
            let label = '전체 기간';

            if (selectedPeriod === 'custom') {
                const startDate = document.getElementById('sidebarStartDate')?.value;
                const endDate = document.getElementById('sidebarEndDate')?.value;

                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);

                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date >= start && date <= end;
                        } catch (e) { return false; }
                    });

                    label = `${startDate} ~ ${endDate}`;
                }
            } else {
                const result = App.utils.filterDataByPeriod(data, selectedPeriod, applyDateIndex, now);
                filteredData = result.data;
                label = result.label;
            }

            return { data: filteredData, label };
        },

        calculateStats(filteredApplicants) {
            const headers = App.state.data?.headers || [];
            const contactResultIndex = headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = headers.indexOf('면접결과');
            const joinDateIndex = headers.indexOf('입과일');

            const totalCount = filteredApplicants.length;

            let interviewPendingCount = 0;
            if (contactResultIndex !== -1) {
                interviewPendingCount = filteredApplicants.filter(row => {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    return contactResult === '면접확정';
                }).length;
            }

            let successRate = 0;
            if (contactResultIndex !== -1 && interviewResultIndex !== -1) {
                const interviewConfirmed = filteredApplicants.filter(row => {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    return contactResult === '면접확정';
                });

                const passed = interviewConfirmed.filter(row => {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    return interviewResult === '합격';
                });

                successRate = interviewConfirmed.length > 0 ? Math.round((passed.length / interviewConfirmed.length) * 100) : 0;
            }

            let joinRate = 0;
            if (interviewResultIndex !== -1 && joinDateIndex !== -1) {
                const passedApplicants = filteredApplicants.filter(row => {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    return interviewResult === '합격';
                });

                const joinedApplicants = passedApplicants.filter(row => {
                    const joinDate = String(row[joinDateIndex] || '').trim();
                    return joinDate !== '' && joinDate !== '-';
                });

                joinRate = passedApplicants.length > 0 ? Math.round((joinedApplicants.length / passedApplicants.length) * 100) : 0;
            }

            return { totalCount, interviewPendingCount, successRate, joinRate };
        },

        updateUI(stats, periodLabel) {
            App.utils.updateElement('sidebarTotalApplicants', stats.totalCount);
            App.utils.updateElement('sidebarPeriodLabel', periodLabel);
            App.utils.updateElement('sidebarInterviewPending', stats.interviewPendingCount);
            App.utils.updateElement('sidebarSuccessRate', stats.successRate + '%');
            App.utils.updateElement('sidebarJoinRate', stats.joinRate + '%');
        }
    },

    // =========================
    // 통계 관련 (추가됨)
    // =========================
    stats: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('statsPeriodFilter')?.value || 'all';
            const customRange = document.getElementById('statsCustomDateRange');

            if (selectedPeriod === 'custom') {
                if (customRange) customRange.style.display = 'flex';
            } else {
                if (customRange) customRange.style.display = 'none';
                App.stats.update();
            }
        },

        update() {
            if (!App.state.data?.all || App.state.data.all.length === 0) {
                console.log('데이터가 없어서 통계 업데이트 불가');
                return;
            }

            try {
                const selectedPeriod = document.getElementById('statsPeriodFilter')?.value || 'all';
                const applyDateIndex = App.state.data.headers?.indexOf('지원일') ?? -1;

                let filteredApplicants = [...App.state.data.all];
                let periodLabel = '전체 기간';

                if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                    const result = App.stats.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                    filteredApplicants = result.data;
                    periodLabel = result.label;
                }

                const stats = App.sidebar.calculateStats(filteredApplicants);
                App.stats.updateStatCards(stats, periodLabel);

                // 차트 업데이트 (Chart.js가 로드되어 있는 경우에만)
                if (window.Chart && Object.keys(App.state.charts?.instances || {}).length > 0) {
                    App.charts.updateData(filteredApplicants);
                }

                App.efficiency.update(filteredApplicants);
                App.trend.update(filteredApplicants, applyDateIndex);

            } catch (error) {
                console.error('❌ 통계 데이터 업데이트 실패:', error);
            }
        },

        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            return App.sidebar.filterByPeriod(data, selectedPeriod, applyDateIndex);
        },

        updateStatCards(stats, periodLabel) {
            App.utils.updateElement('totalApplicantsChart', stats.totalCount);
            App.utils.updateElement('statsTimePeriod', periodLabel);
            App.utils.updateElement('pendingInterviewChart', stats.interviewPendingCount);
            App.utils.updateElement('successRateChart', stats.successRate + '%');
            App.utils.updateElement('joinRateChart', stats.joinRate + '%');
        }
    },

    // =========================
    // 차트 관련 (추가됨)
    // =========================
    charts: {
        initialize() {
            if (!window.Chart) {
                console.error('Chart.js가 로드되지 않았습니다.');
                return;
            }

            try {
                App.charts.createRouteChart();
                App.charts.createPositionChart();
                App.charts.createTrendChart();
                App.charts.createRegionChart();
                App.charts.createGenderChart();
                App.charts.createAgeChart();

                console.log('📊 차트 초기화 완료');

            } catch (error) {
                console.error('차트 초기화 실패:', error);
            }
        },

        createRouteChart() {
            const routeCtx = document.getElementById('routeChart');
            if (routeCtx && !App.state.charts?.instances?.route) {
                if (!App.state.charts) App.state.charts = { instances: {} };
                App.state.charts.instances.route = new Chart(routeCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.primary,
                            borderColor: App.config.CHART_COLORS.primary,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { beginAtZero: true } }
                    }
                });
            }
        },

        createPositionChart() {
            const positionCtx = document.getElementById('positionChart');
            if (positionCtx && !App.state.charts?.instances?.position) {
                if (!App.state.charts) App.state.charts = { instances: {} };
                App.state.charts.instances.position = new Chart(positionCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.success,
                            borderColor: App.config.CHART_COLORS.success,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { x: { beginAtZero: true } }
                    }
                });
            }
        },

        createTrendChart() {
            const trendCtx = document.getElementById('trendChart');
            if (trendCtx && !App.state.charts?.instances?.trend) {
                if (!App.state.charts) App.state.charts = { instances: {} };
                App.state.charts.instances.trend = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            label: '지원자 수',
                            data: [0],
                            borderColor: App.config.CHART_COLORS.primary,
                            backgroundColor: App.config.CHART_COLORS.primary + '20',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1 } }
                        }
                    }
                });
            }
        },

        createRegionChart() {
            const regionCtx = document.getElementById('regionChart');
            if (regionCtx && !App.state.charts?.instances?.region) {
                if (!App.state.charts) App.state.charts = { instances: {} };
                App.state.charts.instances.region = new Chart(regionCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: [
                                App.config.CHART_COLORS.primary,
                                App.config.CHART_COLORS.success,
                                App.config.CHART_COLORS.warning,
                                App.config.CHART_COLORS.danger,
                                App.config.CHART_COLORS.orange
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }
        },

        createGenderChart() {
            const genderCtx = document.getElementById('genderChart');
            if (genderCtx && !App.state.charts?.instances?.gender) {
                if (!App.state.charts) App.state.charts = { instances: {} };
                App.state.charts.instances.gender = new Chart(genderCtx, {
                    type: 'pie',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: [App.config.CHART_COLORS.primary, App.config.CHART_COLORS.warning]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }
        },

        createAgeChart() {
            const ageCtx = document.getElementById('ageChart');
            if (ageCtx && !App.state.charts?.instances?.age) {
                if (!App.state.charts) App.state.charts = { instances: {} };
                App.state.charts.instances.age = new Chart(ageCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.success,
                            borderColor: App.config.CHART_COLORS.success,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                    }
                });
            }
        },

        updateData(filteredData) {
            const headers = App.state.data?.headers || [];
            const routeIndex = headers.indexOf('지원루트');
            const positionIndex = headers.indexOf('모집분야');

            App.charts.updateRouteChart(filteredData, routeIndex);
            App.charts.updatePositionChart(filteredData, positionIndex);
            App.charts.updateRegionChart(filteredData);
            App.charts.updateGenderChart(filteredData);
            App.charts.updateAgeChart(filteredData);
        },

        updateRouteChart(filteredData, routeIndex) {
            if (routeIndex !== -1 && App.state.charts?.instances?.route) {
                const routeData = {};
                filteredData.forEach(row => {
                    const route = String(row[routeIndex] || '').trim();
                    if (route) {
                        routeData[route] = (routeData[route] || 0) + 1;
                    }
                });

                App.state.charts.instances.route.data.labels = Object.keys(routeData);
                App.state.charts.instances.route.data.datasets[0].data = Object.values(routeData);
                App.state.charts.instances.route.update();
            }
        },

        updatePositionChart(filteredData, positionIndex) {
            if (positionIndex !== -1 && App.state.charts?.instances?.position) {
                const positionData = {};
                filteredData.forEach(row => {
                    const position = String(row[positionIndex] || '').trim();
                    if (position) {
                        positionData[position] = (positionData[position] || 0) + 1;
                    }
                });

                App.state.charts.instances.position.data.labels = Object.keys(positionData);
                App.state.charts.instances.position.data.datasets[0].data = Object.values(positionData);
                App.state.charts.instances.position.update();
            }
        },

        updateRegionChart(filteredData) {
            const headers = App.state.data?.headers || [];
            const addressIndex = headers.indexOf('지역');

            if (addressIndex === -1 || !App.state.charts?.instances?.region) return;

            const regionData = {};

            filteredData.forEach(row => {
                const address = String(row[addressIndex] || '').trim();
                if (!address || address === '-') return;

                let region = App.utils.extractRegion(address);
                regionData[region] = (regionData[region] || 0) + 1;
            });

            if (Object.keys(regionData).length === 0) {
                App.state.charts.instances.region.data.labels = ['데이터 없음'];
                App.state.charts.instances.region.data.datasets[0].data = [1];
            } else {
                App.state.charts.instances.region.data.labels = Object.keys(regionData);
                App.state.charts.instances.region.data.datasets[0].data = Object.values(regionData);
            }

            App.state.charts.instances.region.update();
        },

        updateGenderChart(filteredData) {
            const headers = App.state.data?.headers || [];
            const genderIndex = headers.indexOf('성별');

            if (genderIndex === -1 || !App.state.charts?.instances?.gender) return;

            const genderData = {};

            filteredData.forEach(row => {
                const gender = String(row[genderIndex] || '').trim();
                if (!gender || gender === '-') return;

                genderData[gender] = (genderData[gender] || 0) + 1;
            });

            if (Object.keys(genderData).length === 0) {
                App.state.charts.instances.gender.data.labels = ['데이터 없음'];
                App.state.charts.instances.gender.data.datasets[0].data = [1];
            } else {
                App.state.charts.instances.gender.data.labels = Object.keys(genderData);
                App.state.charts.instances.gender.data.datasets[0].data = Object.values(genderData);
            }

            App.state.charts.instances.gender.update();
        },

        updateAgeChart(filteredData) {
            const headers = App.state.data?.headers || [];
            const ageIndex = headers.indexOf('나이');

            if (ageIndex === -1 || !App.state.charts?.instances?.age) return;

            const ageGroupData = {
                '20대 이하': 0,
                '30대': 0,
                '40대': 0,
                '50대': 0,
                '60대 이상': 0
            };

            filteredData.forEach(row => {
                const ageStr = String(row[ageIndex] || '').trim();
                if (!ageStr || ageStr === '-') return;

                const age = parseInt(ageStr, 10);
                if (isNaN(age)) return;

                if (age <= 29) ageGroupData['20대 이하']++;
                else if (age <= 39) ageGroupData['30대']++;
                else if (age <= 49) ageGroupData['40대']++;
                else if (age <= 59) ageGroupData['50대']++;
                else ageGroupData['60대 이상']++;
            });

            App.state.charts.instances.age.data.labels = Object.keys(ageGroupData);
            App.state.charts.instances.age.data.datasets[0].data = Object.values(ageGroupData);
            App.state.charts.instances.age.update();
        }
    },

    // =========================
    // 효율성 분석 관련 (추가됨)
    // =========================
    efficiency: {
        switchTab(tabName) {
            if (App.state.charts) {
                App.state.charts.currentEfficiencyTab = tabName;
            }

            document.querySelectorAll('.efficiency-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabName);
            });

            App.efficiency.update();
        },

        update(filteredData = null) {
            if (!filteredData) {
                const selectedPeriod = document.getElementById('statsPeriodFilter')?.value || 'all';
                filteredData = App.utils.getFilteredDataByPeriod(selectedPeriod);
            }

            const currentTab = App.state.charts?.currentEfficiencyTab || 'route';

            if (currentTab === 'route') {
                App.efficiency.updateRoute(filteredData);
            } else if (currentTab === 'recruiter') {
                App.efficiency.updateRecruiter(filteredData);
            } else if (currentTab === 'interviewer') {
                App.efficiency.updateInterviewer(filteredData);
            }
        },

        updateRoute(filteredData) {
            try {
                const headers = App.state.data?.headers || [];
                const routeIndex = headers.indexOf('지원루트');

                if (routeIndex === -1) {
                    const contentDiv = document.getElementById('efficiencyTabContent');
                    if (contentDiv) {
                        contentDiv.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">지원루트 데이터를 찾을 수 없습니다.</p>';
                    }
                    return;
                }

                const routeStats = App.efficiency.calculateStats(filteredData, routeIndex);
                App.efficiency.renderTable(routeStats, '지원루트');

            } catch (error) {
                console.error('지원루트 효율성 분석 업데이트 실패:', error);
                const contentDiv = document.getElementById('efficiencyTabContent');
                if (contentDiv) {
                    contentDiv.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
                }
            }
        },

        updateRecruiter(filteredData) {
            try {
                const headers = App.state.data?.headers || [];
                const recruiterIndex = headers.indexOf('증원자');

                if (recruiterIndex === -1) {
                    const contentDiv = document.getElementById('efficiencyTabContent');
                    if (contentDiv) {
                        contentDiv.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">증원자 데이터를 찾을 수 없습니다.</p>';
                    }
                    return;
                }

                const recruiterStats = App.efficiency.calculateStats(filteredData, recruiterIndex);
                App.efficiency.renderTable(recruiterStats, '증원자');

            } catch (error) {
                console.error('증원자별 효율성 분석 업데이트 실패:', error);
            }
        },

        updateInterviewer(filteredData) {
            try {
                const headers = App.state.data?.headers || [];
                const interviewerIndex = headers.indexOf('면접자');

                if (interviewerIndex === -1) {
                    const contentDiv = document.getElementById('efficiencyTabContent');
                    if (contentDiv) {
                        contentDiv.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">면접자 데이터를 찾을 수 없습니다.</p>';
                    }
                    return;
                }

                const interviewerStats = App.efficiency.calculateStats(filteredData, interviewerIndex);
                App.efficiency.renderTable(interviewerStats, '면접자');

            } catch (error) {
                console.error('면접관별 효율성 분석 업데이트 실패:', error);
            }
        },

        calculateStats(filteredData, categoryIndex) {
            const headers = App.state.data?.headers || [];
            const contactResultIndex = headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = headers.indexOf('면접결과');
            const joinDateIndex = headers.indexOf('입과일');

            const stats = {};

            filteredData.forEach(row => {
                const category = String(row[categoryIndex] || '').trim();
                if (!category || category === '-') return;

                if (!stats[category]) {
                    stats[category] = {
                        total: 0,
                        contacted: 0,
                        interviewConfirmed: 0,
                        passed: 0,
                        joined: 0
                    };
                }

                stats[category].total++;

                if (contactResultIndex !== -1) {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    if (contactResult !== '' && contactResult !== '-') {
                        stats[category].contacted++;
                    }

                    if (contactResult === '면접확정') {
                        stats[category].interviewConfirmed++;
                    }
                }

                if (interviewResultIndex !== -1) {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    if (interviewResult === '합격') {
                        stats[category].passed++;
                    }
                }

                if (joinDateIndex !== -1) {
                    const joinDate = String(row[joinDateIndex] || '').trim();
                    if (joinDate !== '' && joinDate !== '-') {
                        stats[category].joined++;
                    }
                }
            });

            return stats;
        },

        renderTable(stats, categoryName) {
            const dataArray = Object.entries(stats).map(([name, data]) => {
                const interviewConfirmRate = data.total > 0 ? (data.interviewConfirmed / data.total) * 100 : 0;
                const passRate = data.interviewConfirmed > 0 ? (data.passed / data.interviewConfirmed) * 100 : 0;
                const joinRate = data.total > 0 ? (data.joined / data.total) * 100 : 0;
                const volumeWeight = Math.min(data.total / Math.max(...Object.values(stats).map(s => s.total)), 1) * 100;

                const efficiencyScore = (joinRate * 0.4) + (passRate * 0.3) + (interviewConfirmRate * 0.2) + (volumeWeight * 0.1);

                return {
                    name,
                    ...data,
                    interviewConfirmRate: Math.round(interviewConfirmRate),
                    passRate: Math.round(passRate),
                    joinRate: Math.round(joinRate),
                    efficiencyScore: Math.round(efficiencyScore * 10) / 10
                };
            }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

            let tableHtml = `
                <div style="overflow-x: auto;">
                    <table class="efficiency-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--main-bg);">
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-weight: 600;">${categoryName}</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">총 지원자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">면접확정</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">합격자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">입과자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">면접확정률</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">합격률</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600; color: var(--accent-orange);">최종 입과율</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">효율성 점수</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            dataArray.forEach((item, index) => {
                const rankColor = index === 0 ? 'var(--success)' : index === 1 ? 'var(--warning)' : index === 2 ? 'var(--accent-orange)' : 'var(--text-primary)';
                const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

                tableHtml += `
                    <tr style="border-bottom: 1px solid var(--border-color); transition: all 0.2s ease;">
                        <td style="padding: 12px; font-weight: 600; color: ${rankColor};">${rankIcon} ${item.name}</td>
                        <td style="padding: 12px; text-align: center; font-weight: 500;">${item.total.toLocaleString()}</td>
                        <td style="padding: 12px; text-align: center;">${item.interviewConfirmed}</td>
                        <td style="padding: 12px; text-align: center;">${item.passed}</td>
                        <td style="padding: 12px; text-align: center;">${item.joined}</td>
                        <td style="padding: 12px; text-align: center;">${item.interviewConfirmRate}%</td>
                        <td style="padding: 12px; text-align: center;">${item.passRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--accent-orange);">${item.joinRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: ${rankColor}; font-size: 1.1rem;">${item.efficiencyScore}</td>
                    </tr>
                `;
            });

            tableHtml += `
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 15px; padding: 15px; background: var(--main-bg); border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    <strong>📊 효율성 점수 계산법:</strong> (입과율 × 0.4) + (합격률 × 0.3) + (면접확정률 × 0.2) + (총지원자수 가중치 × 0.1)
                </div>
            `;

            const contentDiv = document.getElementById('efficiencyTabContent');
            if (contentDiv) {
                contentDiv.innerHTML = tableHtml;
            }
        }
    },

    // =========================
    // 추이 분석 관련 (추가됨)
    // =========================
    trend: {
        switchTab(period) {
            if (App.state.charts) {
                App.state.charts.currentTrendTab = period;
            }

            document.querySelectorAll('.trend-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.period === period);
            });

            App.trend.update();
        },

        update(filteredData = null, applyDateIndex = null) {
            if (!applyDateIndex) {
                applyDateIndex = App.state.data?.headers?.indexOf('지원일') ?? -1;
            }

            if (applyDateIndex === -1 || !App.state.charts?.instances?.trend) return;

            let trendData = {};
            let labels = [];

            const currentTab = App.state.charts?.currentTrendTab || 'all';

            if (currentTab === 'all') {
                const result = App.trend.getAllTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            } else if (currentTab === 'year') {
                const result = App.trend.getYearTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            } else if (currentTab === 'month') {
                const result = App.trend.getMonthTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            }

            App.state.charts.instances.trend.data.labels = labels;
            App.state.charts.instances.trend.data.datasets[0].data = Object.values(trendData);
            App.state.charts.instances.trend.update();
        },

        getAllTrendData(applyDateIndex) {
            const trendData = {};

            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                trendData[key] = 0;
            }

            const allData = App.state.data?.all || [];
            allData.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    if (trendData.hasOwnProperty(key)) {
                        trendData[key]++;
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(key => {
                const [year, month] = key.split('-');
                return `${year}.${month}`;
            });

            return { data: trendData, labels };
        },

        getYearTrendData(applyDateIndex) {
            const trendData = {};
            const currentYear = new Date().getFullYear();

            for (let i = 4; i >= 0; i--) {
                const year = currentYear - i;
                trendData[year] = 0;
            }

            const allData = App.state.data?.all || [];
            allData.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    const year = date.getFullYear();
                    if (trendData.hasOwnProperty(year)) {
                        trendData[year]++;
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(year => `${year}년`);

            return { data: trendData, labels };
        },

        getMonthTrendData(applyDateIndex) {
            const trendData = {};
            const currentYear = new Date().getFullYear();

            for (let i = 1; i <= 12; i++) {
                const key = `${currentYear}-${i.toString().padStart(2, '0')}`;
                trendData[key] = 0;
            }

            const allData = App.state.data?.all || [];
            allData.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    if (date.getFullYear() === currentYear) {
                        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                        if (trendData.hasOwnProperty(key)) {
                            trendData[key]++;
                        }
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(key => {
                const [year, month] = key.split('-');
                return `${month}월`;
            });

            return { data: trendData, labels };
        }
    },

    // =========================
    // 모달 관련
    // =========================
    modal: {
        get element() {
            return document.getElementById('applicantModal');
        },

        openNew() {
            document.querySelector('#applicantModal .modal-title').textContent = '신규 지원자 등록';
            App.modal.buildForm();
            document.querySelector('#applicantModal .modal-footer').innerHTML = `<button class="primary-btn" onclick="App.modal.saveNew()">저장하기</button>`;
            App.modal.element.style.display = 'flex';
        },

        openDetail(rowData) {
            document.querySelector('#applicantModal .modal-title').textContent = '지원자 상세 정보';
            App.modal.buildForm(rowData, true);

            document.querySelector('#applicantModal .modal-footer').innerHTML = `
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="modal-close-btn" onclick="App.modal.close()">
                        <i class="fas fa-times"></i> 닫기
                    </button>
                    <button class="modal-edit-btn" onclick="App.modal.openEdit()">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button class="modal-delete-btn" onclick="App.modal.delete()">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            `;

            App.state.ui.currentEditingData = [...rowData];
            App.modal.element.style.display = 'flex';
        },

        openEdit() {
            if (!App.state.ui.currentEditingData) {
                alert('편집할 데이터가 없습니다.');
                return;
            }

            document.querySelector('#applicantModal .modal-title').textContent = '지원자 정보 수정';
            App.modal.buildForm(App.state.ui.currentEditingData, false);

            document.querySelector('#applicantModal .modal-footer').innerHTML = `
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="modal-close-btn" onclick="App.modal.close()">
                        <i class="fas fa-times"></i> 취소
                    </button>
                    <button class="modal-edit-btn" onclick="App.modal.saveEdit()">
                        <i class="fas fa-save"></i> 저장
                    </button>
                </div>
            `;
        },

        close() {
            App.modal.element.style.display = 'none';
            document.getElementById('applicantForm').innerHTML = '';
            App.state.ui.currentEditingData = null;
        },

        buildForm(data = null, isReadOnly = false) {
            const form = document.getElementById('applicantForm');
            form.innerHTML = '';

            if (!App.state.data?.headers) return;

            App.state.data.headers.forEach((header, index) => {
                const formGroup = document.createElement('div');
                formGroup.className = `form-group ${header === '비고' || header === '면접리뷰' ? 'full-width' : ''}`;

                const isRequired = App.config.REQUIRED_FIELDS.includes(header) && !isReadOnly;

                let value = '';
                if (data) {
                    value = String(data[index] || '');
                } else {
                    if (header === '구분') value = App.state.ui?.nextSequenceNumber || 1;
                    else if (header === '지원일') {
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, '0');
                        const day = String(now.getDate()).padStart(2, '0');
                        value = `${year}-${month}-${day}`;
                    }
                }

                if ((App.config.DATE_FIELDS.includes(header) || header === '지원일') && value && value !== '-') {
                    value = App.utils.formatDateForInput(value);
                }

                const inputHtml = App.modal.createInput(header, value, isRequired, isReadOnly);
                formGroup.innerHTML = `<label for="modal-form-${header}">${header}${isRequired ? ' *' : ''}</label>${inputHtml}`;
                form.appendChild(formGroup);
            });
        },

        createInput(header, value, isRequired, isDisabled) {
            const isDisabledOrReadOnly = isDisabled || header === '구분';

            if (header === '연락처') {
                return `<input type="tel" id="modal-form-${header}" value="${value}" oninput="App.utils.formatPhoneNumber(this)" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
            } else if (App.config.DATE_FIELDS.includes(header) || header === '지원일') {
                return `<input type="date" id="modal-form-${header}" value="${value}" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
            } else if (App.config.TIME_FIELDS.includes(header)) {
                return `<input type="text" id="modal-form-${header}" value="${value}" placeholder="예: 14시 30분" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
            } else if (App.config.DROPDOWN_OPTIONS[header]) {
                return App.modal.createDropdownInput(header, value, isRequired, isDisabledOrReadOnly);
            } else if (header === '비고' || header === '면접리뷰') {
                return `<textarea id="modal-form-${header}" rows="3" ${isDisabledOrReadOnly ? 'disabled' : ''}>${value}</textarea>`;
            } else {
                return `<input type="text" id="modal-form-${header}" value="${value}" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''} ${header === '구분' ? 'style="background-color: #f1f5f9;"' : ''}>`;
            }
        },

        createDropdownInput(header, value, isRequired, isDisabled) {
            const options = App.config.DROPDOWN_OPTIONS[header];
            const hasDirectInput = options.includes('직접입력');
            let customValue = '';
            let selectValue = value;

            if (hasDirectInput && !options.includes(value) && value) {
                selectValue = '직접입력';
                customValue = value;
            }

            let html = `<select id="modal-form-${header}" ${hasDirectInput ? `onchange="App.modal.handleDropdownChange(this, '${header}')"` : ''} ${isRequired ? 'required' : ''} ${isDisabled ? 'disabled' : ''}>
                            <option value="">선택해주세요</option>
                            ${options.map(option => `<option value="${option}" ${selectValue === option ? 'selected' : ''}>${option}</option>`).join('')}
                        </select>`;

            if(hasDirectInput) {
                html += `<input type="text" id="modal-form-${header}-custom" value="${customValue}" placeholder="직접 입력하세요" style="display:${selectValue === '직접입력' ? 'block' : 'none'}; margin-top:5px;" ${isDisabled ? 'disabled' : ''}>`;
            }

            return html;
        },

        handleDropdownChange(selectElement, fieldName) {
            const customInput = document.getElementById(`modal-form-${fieldName}-custom`);
            if (!customInput) return;
            
            const isDirectInput = selectElement.value === '직접입력';

            customInput.style.display = isDirectInput ? 'block' : 'none';
            if(isDirectInput) customInput.focus();

            const isRequired = document.querySelector(`label[for="modal-form-${fieldName}"]`)?.textContent.includes('*');
            if(isRequired){
                if(isDirectInput){
                    selectElement.removeAttribute('required');
                    customInput.setAttribute('required', '');
                } else {
                    customInput.removeAttribute('required');
                    selectElement.setAttribute('required', '');
                }
            }
        },

        async saveNew() {
            const saveBtn = document.querySelector('#applicantModal .modal-footer .primary-btn');
            if (!saveBtn) return;
            
            const originalText = saveBtn.innerHTML;

            try {
                const applicantData = App.modal.collectFormData();

                if (!App.modal.validateFormData(applicantData)) {
                    alert('필수 항목을 모두 입력해주세요.');
                    return;
                }

                if (App.state.data?.headers?.includes('구분')) {
                    applicantData['구분'] = String(App.state.ui?.nextSequenceNumber || 1);
                }
                if (App.state.data?.headers?.includes('지원일')) {
                    applicantData['지원일'] = new Date().toISOString().split('T')[0];
                }

                App.modal.prepareTimeData(applicantData);

                saveBtn.disabled = true;
                saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

                await App.data.save(applicantData);

                App.modal.close();
                App.data.fetch();

            } catch (error) {
                console.error("데이터 저장 실패:", error);
                alert("데이터 저장 중 오류 발생: " + error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        },

        async saveEdit() {
            const saveBtn = document.querySelector('#applicantModal .modal-footer .modal-edit-btn');
            if (!saveBtn) return;
            
            const originalText = saveBtn.innerHTML;

            try {
                const updatedData = App.modal.collectFormData();

                if (!App.modal.validateFormData(updatedData)) {
                    alert('필수 항목을 모두 입력해주세요.');
                    return;
                }

                App.modal.prepareTimeData(updatedData);

                const gubunIndex = App.state.data?.headers?.indexOf('구분') ?? -1;
                if (gubunIndex === -1 || !App.state.ui?.currentEditingData) {
                    alert('편집 정보를 찾을 수 없습니다.');
                    return;
                }

                const gubunValue = App.state.ui.currentEditingData[gubunIndex];
                if (!gubunValue) {
                    alert('구분값을 찾을 수 없습니다.');
                    return;
                }

                saveBtn.disabled = true;
                saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

                await App.data.save(updatedData, true, gubunValue);

                alert('정보가 성공적으로 수정되었습니다.');
                App.modal.close();
                App.data.fetch();

            } catch (error) {
                console.error("데이터 수정 실패:", error);
                alert("데이터 수정 중 오류 발생: " + error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        },

        async delete() {
            if (!App.state.ui?.currentEditingData) {
                alert('삭제할 데이터가 없습니다.');
                return;
            }

            const gubunIndex = App.state.data?.headers?.indexOf('구분') ?? -1;
            const nameIndex = App.state.data?.headers?.indexOf('이름') ?? -1;

            if (gubunIndex === -1) {
                alert('삭제를 위한 고유 식별자(구분)를 찾을 수 없습니다.');
                return;
            }

            const gubunValue = App.state.ui.currentEditingData[gubunIndex];
            const applicantName = nameIndex !== -1 ? App.state.ui.currentEditingData[nameIndex] || '해당 지원자' : '해당 지원자';

            if (!confirm(`정말로 '${applicantName}' 님의 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                return;
            }

            const deleteBtn = document.querySelector('.modal-delete-btn');
            if (!deleteBtn) return;
            
            const originalText = deleteBtn.innerHTML;

            try {
                deleteBtn.disabled = true;
                deleteBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 삭제 중...';

                await App.data.delete(gubunValue);

                alert(`'${applicantName}' 님의 정보가 성공적으로 삭제되었습니다.`);
                App.modal.close();
                App.data.fetch();

            } catch (error) {
                console.error("데이터 삭제 실패:", error);
                alert("데이터 삭제 중 오류가 발생했습니다: " + error.message);
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = originalText;
            }
        },

        collectFormData() {
            const applicantData = {};
            if (!App.state.data?.headers) return applicantData;
            
            App.state.data.headers.forEach(header => {
                const input = document.getElementById(`modal-form-${header}`);
                const customInput = document.getElementById(`modal-form-${header}-custom`);
                if (input) {
                    let value = (customInput && customInput.style.display !== 'none') ? customInput.value : input.value;
                    applicantData[header] = value;
                }
            });
            return applicantData;
        },

        validateFormData(data) {
            return App.config.REQUIRED_FIELDS.every(field => data[field] && data[field].trim() !== '');
        },

        prepareTimeData(data) {
            const timeHeader = '면접 시간';
            if (data[timeHeader]) {
                data[timeHeader] = "'" + data[timeHeader];
            }
            return data;
        }
    },

    // =========================
    // 네비게이션 관련
    // =========================
    navigation: {
        switchPage(pageId) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(pageId)?.classList.add('active');
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            const navItem = document.querySelector(`.nav-item[onclick="App.navigation.switchPage('${pageId}')"]`);
            if (navItem) navItem.classList.add('active');

            const titles = { dashboard: '지원자 현황', stats: '통계 분석' };
            const titleElement = document.getElementById('pageTitle');
            if (titleElement) titleElement.textContent = titles[pageId] || pageId;

            // 통계 페이지로 이동할 때 차트 초기화
            if (pageId === 'stats') {
                setTimeout(() => {
                    if (window.Chart && App.state.data?.all.length > 0) {
                        App.charts.initialize();
                        App.stats.update();
                        App.efficiency.update();
                        App.trend.update();
                    }
                }, 100);
            }

            // 모바일에서 페이지 전환 시 사이드바 닫기
            if (window.innerWidth <= 768 && document.getElementById('sidebar')?.classList.contains('mobile-open')) {
                App.ui.toggleMobileMenu();
            }
        }
    },

    // =========================
    // UI 관련
    // =========================
    ui: {
        toggleMobileMenu() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            if (sidebar) sidebar.classList.toggle('mobile-open');
            if (overlay) overlay.classList.toggle('show');
        },

        toggleColumnDropdown() {
            const dropdown = document.getElementById('columnToggleDropdown');
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        },

        handleColumnToggle(event, columnName) {
            if (App.state.ui?.visibleColumns) {
                App.state.ui.visibleColumns[columnName] = event.target.checked;
                App.filter.apply();
            }
        },

        setupColumnToggles() {
            const dropdown = document.getElementById('columnToggleDropdown');
            if (!dropdown || !App.state.data?.headers) return;
            
            dropdown.innerHTML = '';
            App.state.data.headers.forEach(header => {
                const item = document.createElement('div');
                item.className = 'column-toggle-item';
                const isChecked = App.state.ui?.visibleColumns?.[header] ? 'checked' : '';
                item.innerHTML = `<input type="checkbox" id="toggle-${header}" ${isChecked} onchange="App.ui.handleColumnToggle(event, '${header}')"><label for="toggle-${header}">${header}</label>`;
                dropdown.appendChild(item);
            });
        }
    },

    // =========================
    // 검색 관련
    // =========================
    search: {
        handle() {
            if (App.state.ui?.searchTimeout) {
                clearTimeout(App.state.ui.searchTimeout);
            }

            const searchTimeout = setTimeout(() => {
                const searchInput = document.getElementById('globalSearch');
                if (searchInput && App.state.ui) {
                    App.state.ui.searchTerm = String(searchInput.value || '').toLowerCase();
                    App.state.ui.currentPage = 1;
                    App.filter.apply();
                }
            }, 300);

            if (App.state.ui) {
                App.state.ui.searchTimeout = searchTimeout;
            }
        }
    },

    // =========================
    // 필터 관련
    // =========================
    filter: {
        apply() {
            let data = [...(App.state.data?.all || [])];
            
            const routeFilter = document.getElementById('routeFilter')?.value || 'all';
            const positionFilter = document.getElementById('positionFilter')?.value || 'all';
            const applyDateIndex = App.state.data?.headers?.indexOf('지원일') ?? -1;
            const routeIndex = App.state.data?.headers?.indexOf('지원루트') ?? -1;
            const positionIndex = App.state.data?.headers?.indexOf('모집분야') ?? -1;

            // 검색어 필터
            if (App.state.ui?.searchTerm) {
                data = data.filter(row => row.some(cell => String(cell || '').toLowerCase().includes(App.state.ui.searchTerm)));
            }

            // 지원루트 필터
            if (routeFilter !== 'all' && routeIndex !== -1) {
                data = data.filter(row => String(row[routeIndex] || '') === routeFilter);
            }

            // 모집분야 필터
            if (positionFilter !== 'all' && positionIndex !== -1) {
                data = data.filter(row => String(row[positionIndex] || '') === positionFilter);
            }

            // 날짜 필터
            if (applyDateIndex !== -1 && App.state.ui?.activeDateMode !== 'all') {
                data = App.filter.applyDateFilter(data, applyDateIndex);
            }

            // 정렬 적용
            data = App.utils.sortData(data);

            // 상태 업데이트
            if (App.state.data) {
                App.state.data.filtered = data;
            }

            // 페이지네이션 업데이트
            App.pagination.updateTotal();
            App.filter.updateSummary();

            // 렌더링
            const pageData = App.pagination.getCurrentPageData();
            if (App.state.ui?.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }

            App.pagination.updateUI();
        },

        applyDateFilter(data, applyDateIndex) {
            // 간단한 날짜 필터 구현
            return data;
        },

        reset(runApplyFilters = true) {
            document.querySelectorAll('.filter-bar select').forEach(select => select.value = 'all');
            const globalSearch = document.getElementById('globalSearch');
            if (globalSearch) globalSearch.value = '';
            
            if (App.state.ui) {
                App.state.ui.searchTerm = '';
                App.state.ui.activeDateMode = 'all';
                App.state.ui.currentPage = 1;
            }
            
            App.filter.updateDateFilterUI();
            if (runApplyFilters) {
                App.filter.apply();
            }
        },

        updateSummary() {
            const filteredCount = App.state.data?.filtered?.length || 0;
            const searchText = App.state.ui?.searchTerm ? ` (검색: "${App.state.ui.searchTerm}")` : '';
            const pageInfo = filteredCount > App.config.ITEMS_PER_PAGE ? ` - ${App.state.ui?.currentPage || 1}/${App.state.ui?.totalPages || 1} 페이지` : '';
            
            const summaryElement = document.getElementById('filterSummary');
            if (summaryElement) {
                summaryElement.innerHTML = `<strong>지원자:</strong> ${filteredCount}명${searchText}${pageInfo}`;
            }
        },

        populateDropdowns() {
            const routeIndex = App.state.data?.headers?.indexOf('지원루트') ?? -1;
            const positionIndex = App.state.data?.headers?.indexOf('모집분야') ?? -1;

            if (routeIndex !== -1 && App.state.data?.all) {
                const routes = [...new Set(App.state.data.all.map(row => String(row[routeIndex] || '').trim()).filter(Boolean))];
                const routeFilter = document.getElementById('routeFilter');
                if (routeFilter) {
                    routeFilter.innerHTML = '<option value="all">전체</option>';
                    routes.sort().forEach(route => routeFilter.innerHTML += `<option value="${route}">${route}</option>`);
                }
            }

            if (positionIndex !== -1 && App.state.data?.all) {
                const positions = [...new Set(App.state.data.all.map(row => String(row[positionIndex] || '').trim()).filter(Boolean))];
                const positionFilter = document.getElementById('positionFilter');
                if (positionFilter) {
                    positionFilter.innerHTML = '<option value="all">전체</option>';
                    positions.sort().forEach(pos => positionFilter.innerHTML += `<option value="${pos}">${pos}</option>`);
                }
            }
        },

        updateDateFilterUI() {
            document.querySelectorAll('.date-mode-btn').forEach(btn =>
                btn.classList.toggle('active', btn.dataset.mode === (App.state.ui?.activeDateMode || 'all'))
            );

            const container = document.getElementById('dateInputsContainer');
            if (container) {
                if ((App.state.ui?.activeDateMode || 'all') === 'all') {
                    container.innerHTML = `<span style="color: var(--text-secondary); font-size: 0.9rem; padding: 0 10px;">모든 데이터 표시</span>`;
                } else {
                    container.innerHTML = '';
                }
            }
        }
    },

    // =========================
    // 페이지네이션 관련
    // =========================
    pagination: {
        updateTotal() {
            const filteredLength = App.state.data?.filtered?.length || 0;
            const totalPages = Math.ceil(filteredLength / App.config.ITEMS_PER_PAGE);
            
            if (App.state.ui) {
                App.state.ui.totalPages = totalPages;
                if (App.state.ui.currentPage > totalPages && totalPages > 0) {
                    App.state.ui.currentPage = totalPages;
                } else if (totalPages === 0) {
                    App.state.ui.currentPage = 1;
                }
            }
        },

        getCurrentPageData() {
            const filtered = App.state.data?.filtered || [];
            const currentPage = App.state.ui?.currentPage || 1;
            const startIndex = (currentPage - 1) * App.config.ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + App.config.ITEMS_PER_PAGE, filtered.length);
            return filtered.slice(startIndex, endIndex);
        },

        goToPage(page) {
            const totalPages = App.state.ui?.totalPages || 1;
            if (page >= 1 && page <= totalPages && App.state.ui) {
                App.state.ui.currentPage = page;
                const pageData = App.pagination.getCurrentPageData();
                
                if (App.state.ui.currentView === 'table') {
                    App.render.table(pageData);
                } else {
                    App.render.cards(pageData);
                }
                App.pagination.updateUI();
            }
        },

        goToPrevPage() {
            const currentPage = App.state.ui?.currentPage || 1;
            App.pagination.goToPage(currentPage - 1);
        },

        goToNextPage() {
            const currentPage = App.state.ui?.currentPage || 1;
            App.pagination.goToPage(currentPage + 1);
        },

        goToLastPage() {
            const totalPages = App.state.ui?.totalPages || 1;
            App.pagination.goToPage(totalPages);
        },

        updateUI() {
            const paginationContainer = document.getElementById('paginationContainer');
            const paginationInfo = document.getElementById('paginationInfo');
            
            if (!paginationContainer || !paginationInfo) return;

            const filteredLength = App.state.data?.filtered?.length || 0;
            
            if (filteredLength === 0) {
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';

            const currentPage = App.state.ui?.currentPage || 1;
            const totalPages = App.state.ui?.totalPages || 1;
            const startItem = (currentPage - 1) * App.config.ITEMS_PER_PAGE + 1;
            const endItem = Math.min(currentPage * App.config.ITEMS_PER_PAGE, filteredLength);
            
            paginationInfo.textContent = `${startItem}-${endItem} / ${filteredLength}명`;

            // 버튼 상태 업데이트
            const firstPageBtn = document.getElementById('firstPageBtn');
            const prevPageBtn = document.getElementById('prevPageBtn');
            const nextPageBtn = document.getElementById('nextPageBtn');
            const lastPageBtn = document.getElementById('lastPageBtn');

            if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
            if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
            if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
            if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
        }
    },

    // =========================
    // 뷰 관련
    // =========================
    view: {
        switch(viewType) {
            if (App.state.ui) {
                App.state.ui.currentView = viewType;
            }
            
            const tableView = document.getElementById('tableView');
            const cardsView = document.getElementById('cardsView');
            const viewBtns = document.querySelectorAll('.view-btn');

            viewBtns.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`.view-btn[onclick="App.view.switch('${viewType}')"]`);
            if (activeBtn) activeBtn.classList.add('active');

            const pageData = App.pagination.getCurrentPageData();

            if (viewType === 'table') {
                if (tableView) tableView.style.display = 'block';
                if (cardsView) cardsView.classList.remove('active');
                App.render.table(pageData);
            } else {
                if (tableView) tableView.style.display = 'none';
                if (cardsView) cardsView.classList.add('active');
                App.render.cards(pageData);
            }
        }
    },

    // =========================
    // 렌더링 관련
    // =========================
    render: {
        table(dataToRender) {
            const tableContainer = document.querySelector('.table-container');
            if (!tableContainer) return;

            if (!dataToRender && (!App.state.data?.all || App.state.data.all.length === 0)) {
                tableContainer.innerHTML = '<div style="text-align: center; padding: 40px;">데이터를 불러오는 중...</div>';
                return;
            }

            const renderData = dataToRender || [];

            tableContainer.innerHTML = '';
            const table = document.createElement('table');
            table.className = 'data-table';
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', '지원자 목록 테이블');

            App.render.tableHeader(table);
            App.render.tableBody(table, renderData);

            tableContainer.appendChild(table);
        },

        tableHeader(table) {
            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            const headers = App.state.data?.headers || [];
            const visibleColumns = App.state.ui?.visibleColumns || {};

            headers.forEach(header => {
                if (visibleColumns[header]) {
                    const th = document.createElement('th');
                    th.className = 'sortable-header';
                    th.setAttribute('role', 'columnheader');
                    th.setAttribute('tabindex', '0');
                    th.setAttribute('aria-sort', 'none');
                    th.onclick = () => App.table.sort(header);

                    th.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            th.click();
                        }
                    });

                    let sortIcon = 'fa-sort';
                    const currentSortColumn = App.state.ui?.currentSortColumn;
                    const currentSortDirection = App.state.ui?.currentSortDirection;
                    
                    if (currentSortColumn === header && currentSortDirection) {
                        sortIcon = currentSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
                    }

                    th.innerHTML = `${header} <i class="fas ${sortIcon} sort-icon ${currentSortColumn === header ? 'active' : ''}"></i>`;
                    headerRow.appendChild(th);
                }
            });
        },

        tableBody(table, dataToRender) {
            const tbody = table.createTBody();
            const headers = App.state.data?.headers || [];
            const visibleColumns = App.state.ui?.visibleColumns || {};

            if (!dataToRender || dataToRender.length === 0) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = Object.values(visibleColumns).filter(Boolean).length || 1;
                cell.textContent = '표시할 데이터가 없습니다.';
                cell.style.textAlign = 'center';
                cell.style.padding = '40px';
                return;
            }

            dataToRender.forEach((rowData, index) => {
                const row = tbody.insertRow();
                row.id = `row-${index}`;

                row.onclick = (event) => {
                    if (event.target.tagName !== 'A') {
                        App.modal.openDetail(rowData);
                    }
                };

                App.render.tableCells(row, rowData, index);
            });
        },

        tableCells(row, rowData, index) {
            const headers = App.state.data?.headers || [];
            const visibleColumns = App.state.ui?.visibleColumns || {};
            const currentPage = App.state.ui?.currentPage || 1;

            headers.forEach((header, cellIndex) => {
                if (visibleColumns[header]) {
                    const cell = row.insertCell();
                    let cellData = rowData[cellIndex];

                    if (header === '구분') {
                        const displaySequence = (currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;
                        cellData = displaySequence;
                    }

                    const statusClass = App.utils.getStatusClass(header, cellData);
                    if (statusClass) {
                        cell.innerHTML = `<span class="status-badge ${statusClass}">${String(cellData || '')}</span>`;
                    } else if (header === '연락처' && cellData) {
                        cell.innerHTML = `<a href="tel:${String(cellData).replace(/\D/g, '')}">${cellData}</a>`;
                    } else if (header === '면접 시간' && cellData) {
                        cell.textContent = App.utils.formatInterviewTime(cellData);
                    } else if ((header.includes('날짜') || header.includes('날자') || header.includes('지원일') || header.includes('입과일')) && cellData) {
                        cell.textContent = App.utils.formatDate(cellData);
                    } else {
                        cell.textContent = String(cellData || '');
                    }
                }
            });
        },

        cards(dataToRender) {
            const cardsContainer = document.getElementById('cardsView');
            if (!cardsContainer) return;
            
            cardsContainer.innerHTML = '';

            if (!dataToRender || dataToRender.length === 0) {
                cardsContainer.innerHTML = '<p style="text-align:center; padding: 40px; grid-column: 1/-1;">표시할 데이터가 없습니다.</p>';
                return;
            }

            const headers = App.state.data?.headers || [];
            const currentPage = App.state.ui?.currentPage || 1;

            dataToRender.forEach((rowData, index) => {
                const card = document.createElement('div');
                card.className = 'applicant-card';
                card.onclick = () => App.modal.openDetail(rowData);

                const getVal = (header) => String(rowData[headers.indexOf(header)] || '-');
                const name = getVal('이름');
                const phone = getVal('연락처');
                const route = getVal('지원루트');
                const position = getVal('모집분야');
                let date = getVal('지원일');

                if(date !== '-') {
                    try {
                        date = new Date(date).toLocaleDateString('ko-KR');
                    } catch(e) {}
                }

                const displaySequence = (currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;

                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-name">${name}</div>
                        <div class="card-sequence">#${displaySequence}</div>
                    </div>
                    <div class="card-info">
                        <div><span class="card-label">연락처:</span> ${phone}</div>
                        <div><span class="card-label">지원루트:</span> ${route}</div>
                        <div><span class="card-label">모집분야:</span> ${position}</div>
                    </div>
                    <div class="card-footer">
                        <span>지원일: ${date}</span>
                        ${phone !== '-' ? `<a href="tel:${phone.replace(/\D/g, '')}" onclick="event.stopPropagation()"><i class="fas fa-phone"></i></a>` : ''}
                    </div>`;
                cardsContainer.appendChild(card);
            });
        }
    },

    // =========================
    // 테이블 관련
    // =========================
    table: {
        sort(columnName) {
            if (!App.state.ui) return;
            
            const currentSortColumn = App.state.ui.currentSortColumn;
            const currentSortDirection = App.state.ui.currentSortDirection;

            if (currentSortColumn === columnName) {
                App.state.ui.currentSortDirection = currentSortDirection === 'asc' ? 'desc' : '';
                if (App.state.ui.currentSortDirection === '') {
                    App.state.ui.currentSortColumn = '지원일';
                    App.state.ui.currentSortDirection = 'desc';
                }
            } else {
                App.state.ui.currentSortColumn = columnName;
                App.state.ui.currentSortDirection = 'asc';
            }
            App.filter.apply();
        }
    },

    // =========================
    // 데이터 관련
    // =========================
    data: {
        async fetch() {
            if (App._modules.dataService) {
                return await App._modules.dataService.fetch();
            } else {
                console.error('DataService가 초기화되지 않았습니다.');
                return null;
            }
        },

        updateSequenceNumber() {
            if (App._modules.dataService) {
                return App._modules.dataService.updateSequenceNumber();
            }
        },

        updateInterviewSchedule() {
            if (App._modules.dataService) {
                return App._modules.dataService.updateInterviewSchedule();
            }
        },

        showInterviewDetails(name, route) {
            if (App._modules.dataService) {
                return App._modules.dataService.showInterviewDetails(name, route);
            }
        },

        async save(data, isUpdate = false, gubun = null) {
            if (App._modules.dataService) {
                return await App._modules.dataService.save(data, isUpdate, gubun);
            } else {
                throw new Error('DataService가 초기화되지 않았습니다.');
            }
        },

        async delete(gubun) {
            if (App._modules.dataService) {
                return await App._modules.dataService.delete(gubun);
            } else {
                throw new Error('DataService가 초기화되지 않았습니다.');
            }
        }
    },

    // =========================
    // 테마 관련
    // =========================
    theme: {
        initialize() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            App.theme.updateIcon(savedTheme);
        },

        toggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            App.theme.updateIcon(newTheme);
        },

        updateIcon(theme) {
            const icon = document.getElementById('themeIcon');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    },

    // =========================
    // 유틸리티
    // =========================
    utils: {
        formatDateForInput(dateValue) {
            try {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    const tzOffset = date.getTimezoneOffset() * 60000;
                    const localDate = new Date(date.getTime() - tzOffset);
                    return localDate.toISOString().split('T')[0];
                }
            } catch (e) {
                console.log('날짜 변환 실패:', dateValue);
            }
            return dateValue;
        },

        formatPhoneNumber(input) {
            let value = input.value.replace(/\D/g, '').slice(0, 11);
            if (value.length > 7) {
                input.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
            } else if (value.length > 3) {
                input.value = `${value.slice(0, 3)}-${value.slice(3)}`;
            } else {
                input.value = value;
            }
        },

        formatDate(dateValue) {
            try {
                const date = new Date(dateValue);
                return date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            } catch (e) {
                return String(dateValue || '');
            }
        },

        formatInterviewTime(timeValue) {
            if (!timeValue || timeValue.trim() === '-') {
                return '-';
            }

            try {
                const date = new Date(timeValue);

                if (isNaN(date.getTime())) {
                    return String(timeValue);
                }

                return date.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

            } catch (e) {
                return String(timeValue);
            }
        },

        getStatusClass(header, value) {
            if (!value) return '';
            const valueStr = String(value).trim();
            if (valueStr === '') return '';

            const statusMap = {
                '합격': 'status-합격', '입과': 'status-입과', '출근': 'status-출근',
                '불합격': 'status-불합격', '거절': 'status-거절', '미참석': 'status-미참석',
                '보류': 'status-보류', '면접확정': 'status-면접확정', '대기': 'status-대기'
            };

            for (const [status, className] of Object.entries(statusMap)) {
                if (valueStr.includes(status)) return className;
            }
            return '';
        },

        sortData(data) {
            if (!App.state.ui?.currentSortColumn || !App.state.ui?.currentSortDirection) {
                return data;
            }

            const headers = App.state.data?.headers || [];
            const sortIndex = headers.indexOf(App.state.ui.currentSortColumn);
            
            if (sortIndex === -1) return data;

            return data.sort((a, b) => {
                let valA = a[sortIndex];
                let valB = b[sortIndex];

                if (App.state.ui.currentSortColumn === '지원일' ||
                    App.state.ui.currentSortColumn.includes('날짜') ||
                    App.state.ui.currentSortColumn.includes('날자') ||
                    App.state.ui.currentSortColumn.includes('입과일')) {
                    valA = new Date(valA || '1970-01-01');
                    valB = new Date(valB || '1970-01-01');
                } else if (['나이', '구분'].includes(App.state.ui.currentSortColumn)) {
                    valA = Number(valA) || 0;
                    valB = Number(valB) || 0;
                } else {
                    valA = String(valA || '').toLowerCase();
                    valB = String(valB || '').toLowerCase();
                }

                if (valA < valB) return App.state.ui.currentSortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return App.state.ui.currentSortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        },

        extractRegion(address) {
            if (address.includes('서울')) return '서울';
            else if (address.includes('경기')) return '경기';
            else if (address.includes('인천')) return '인천';
            else if (address.includes('부산')) return '부산';
            else if (address.includes('대구')) return '대구';
            else if (address.includes('대전')) return '대전';
            else if (address.includes('광주')) return '광주';
            else if (address.includes('울산')) return '울산';
            else if (address.includes('세종')) return '세종';
            else if (address.includes('강원')) return '강원';
            else if (address.includes('충북') || address.includes('충청북')) return '충북';
            else if (address.includes('충남') || address.includes('충청남')) return '충남';
            else if (address.includes('전북') || address.includes('전라북')) return '전북';
            else if (address.includes('전남') || address.includes('전라남')) return '전남';
            else if (address.includes('경북') || address.includes('경상북')) return '경북';
            else if (address.includes('경남') || address.includes('경상남')) return '경남';
            else if (address.includes('제주')) return '제주';
            else return '기타';
        },

        filterDataByPeriod(data, selectedPeriod, applyDateIndex, now) {
            let filteredData = [...data];
            let label = '전체 기간';

            if (selectedPeriod === 'year') {
                const currentYear = now.getFullYear();
                filteredData = data.filter(row => {
                    try {
                        const dateValue = row[applyDateIndex];
                        if (!dateValue) return false;
                        const date = new Date(dateValue);
                        return date.getFullYear() === currentYear;
                    } catch (e) { return false; }
                });
                label = `${currentYear}년`;

            } else if (selectedPeriod === 'month') {
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();
                filteredData = data.filter(row => {
                    try {
                        const dateValue = row[applyDateIndex];
                        if (!dateValue) return false;
                        const date = new Date(dateValue);
                        return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
                    } catch (e) { return false; }
                });
                label = `${currentYear}.${currentMonth.toString().padStart(2, '0')}`;

            } else if (selectedPeriod === 'month') {
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();
                filteredData = data.filter(row => {
                    try {
                        const dateValue = row[applyDateIndex];
                        if (!dateValue) return false;
                        const date = new Date(dateValue);
                        return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
                    } catch (e) { return false; }
                });
                label = `${currentYear}.${currentMonth.toString().padStart(2, '0')}`;

            } else if (selectedPeriod === 'week') {
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                filteredData = data.filter(row => {
                    try {
                        const dateValue = row[applyDateIndex];
                        if (!dateValue) return false;
                        const date = new Date(dateValue);
                        return date >= weekStart && date <= weekEnd;
                    } catch (e) { return false; }
                });
                label = '이번 주';
            }

            return { data: filteredData, label };
        },

        getFilteredDataByPeriod(selectedPeriod) {
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            let filteredApplicants = [...App.state.data.all];

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                const now = new Date();

                if (selectedPeriod === 'custom') {
                    const startDate = document.getElementById('statsStartDate')?.value;
                    const endDate = document.getElementById('statsEndDate')?.value;

                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);

                        filteredApplicants = App.state.data.all.filter(row => {
                            try {
                                const dateValue = row[applyDateIndex];
                                if (!dateValue) return false;
                                const date = new Date(dateValue);
                                return date >= start && date <= end;
                            } catch (e) { return false; }
                        });
                    }
                } else {
                    const result = App.utils.filterDataByPeriod(App.state.data.all, selectedPeriod, applyDateIndex, now);
                    filteredApplicants = result.data;
                }
            }

            return filteredApplicants;
        },

        formatPhoneNumber(input) {
            let value = input.value.replace(/\D/g, '').slice(0, 11);
            if (value.length > 7) {
                input.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
            } else if (value.length > 3) {
                input.value = `${value.slice(0, 3)}-${value.slice(3)}`;
            } else {
                input.value = value;
            }
        },

        updateElement(elementId, value) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value;
            }
        },

        enhanceAccessibility() {
            try {
                const header = document.querySelector('.main-header');
                if (header) {
                    header.setAttribute('role', 'banner');
                    header.setAttribute('aria-label', '메인 헤더 영역');
                }

                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.setAttribute('role', 'navigation');
                    sidebar.setAttribute('aria-label', '주 메뉴 네비게이션');
                }

                const mainContent = document.querySelector('.content-area');
                if (mainContent) {
                    mainContent.setAttribute('role', 'main');
                    mainContent.setAttribute('aria-label', '메인 콘텐츠 영역');
                }

                document.querySelectorAll('button').forEach(button => {
                    if (!button.getAttribute('aria-label') && button.title) {
                        button.setAttribute('aria-label', button.title);
                    }
                });

                const filterBar = document.querySelector('.filter-bar');
                if (filterBar) {
                    filterBar.setAttribute('role', 'search');
                    filterBar.setAttribute('aria-label', '지원자 필터링 도구');
                }

                console.log('♿ 접근성 개선 완료');

            } catch (error) {
                console.error('접근성 개선 실패:', error);
            }
        },

        createSkeletonTable() {
            // 이제 TableComponent에서 처리됨
            return App._modules.tableComponent.createSkeletonTable();
        },

        generateVisibleColumns(headers) {
            const visibleColumns = {};
            const defaultHiddenColumns = App.config.DEFAULT_HIDDEN_COLUMNS;
            
            headers.forEach(header => {
                visibleColumns[header] = !defaultHiddenColumns.includes(header);
            });
            
            App.state.ui.visibleColumns = visibleColumns;
        }
    },

    // =========================
    // 사이드바 관련 (기존과 동일)
    // =========================
    sidebar: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter').value;
            const customRange = document.getElementById('sidebarCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'block';
            } else {
                customRange.style.display = 'none';
                App.sidebar.updateWidgets();
            }
        },

        updateWidgets() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter')?.value || 'all';
            const applyDateIndex = App.state.data.headers.indexOf('지원일');

            let filteredApplicants = [...App.state.data.all];
            let periodLabel = '전체 기간';

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                const result = App.sidebar.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                filteredApplicants = result.data;
                periodLabel = result.label;
            }

            const stats = App.sidebar.calculateStats(filteredApplicants);
            App.sidebar.updateUI(stats, periodLabel);

            if (document.getElementById('stats').classList.contains('active')) {
                App.stats.update();
            }
        },

        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            const now = new Date();
            let filteredData = [...data];
            let label = '전체 기간';

            if (selectedPeriod === 'custom') {
                const startDate = document.getElementById('sidebarStartDate')?.value;
                const endDate = document.getElementById('sidebarEndDate')?.value;

                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);

                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date >= start && date <= end;
                        } catch (e) { return false; }
                    });

                    label = `${startDate} ~ ${endDate}`;
                }
            } else {
                const result = App.utils.filterDataByPeriod(data, selectedPeriod, applyDateIndex, now);
                filteredData = result.data;
                label = result.label;
            }

            return { data: filteredData, label };
        },

        calculateStats(filteredApplicants) {
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');

            const totalCount = filteredApplicants.length;

            let interviewPendingCount = 0;
            if (contactResultIndex !== -1) {
                interviewPendingCount = filteredApplicants.filter(row => {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    return contactResult === '면접확정';
                }).length;
            }

            let successRate = 0;
            if (contactResultIndex !== -1 && interviewResultIndex !== -1) {
                const interviewConfirmed = filteredApplicants.filter(row => {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    return contactResult === '면접확정';
                });

                const passed = interviewConfirmed.filter(row => {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    return interviewResult === '합격';
                });

                successRate = interviewConfirmed.length > 0 ? Math.round((passed.length / interviewConfirmed.length) * 100) : 0;
            }

            let joinRate = 0;
            if (interviewResultIndex !== -1 && joinDateIndex !== -1) {
                const passedApplicants = filteredApplicants.filter(row => {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    return interviewResult === '합격';
                });

                const joinedApplicants = passedApplicants.filter(row => {
                    const joinDate = String(row[joinDateIndex] || '').trim();
                    return joinDate !== '' && joinDate !== '-';
                });

                joinRate = passedApplicants.length > 0 ? Math.round((joinedApplicants.length / passedApplicants.length) * 100) : 0;
            }

            return { totalCount, interviewPendingCount, successRate, joinRate };
        },

        updateUI(stats, periodLabel) {
            document.getElementById('sidebarTotalApplicants').textContent = stats.totalCount;
            document.getElementById('sidebarPeriodLabel').textContent = periodLabel;
            document.getElementById('sidebarInterviewPending').textContent = stats.interviewPendingCount;
            document.getElementById('sidebarSuccessRate').textContent = stats.successRate + '%';
            document.getElementById('sidebarJoinRate').textContent = stats.joinRate + '%';
        }
    },

    // =========================
    // 통계 관련 (기존과 동일)
    // =========================
    stats: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('statsPeriodFilter').value;
            const customRange = document.getElementById('statsCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                App.stats.update();
            }
        },

        update() {
            if (!App.state.data.all || App.state.data.all.length === 0) {
                console.log('데이터가 없어서 통계 업데이트 불가');
                return;
            }

            try {
                const selectedPeriod = document.getElementById('statsPeriodFilter')?.value || 'all';
                const applyDateIndex = App.state.data.headers.indexOf('지원일');

                let filteredApplicants = [...App.state.data.all];
                let periodLabel = '전체 기간';

                if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                    const result = App.stats.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                    filteredApplicants = result.data;
                    periodLabel = result.label;
                }

                const stats = App.sidebar.calculateStats(filteredApplicants);
                App.stats.updateStatCards(stats, periodLabel);

                if (window.Chart && Object.keys(App.state.charts.instances).length > 0) {
                    App.charts.updateData(filteredApplicants);
                }

                App.efficiency.update(filteredApplicants);
                App.trend.update(filteredApplicants, applyDateIndex);

            } catch (error) {
                console.error('❌ 통계 데이터 업데이트 실패:', error);
            }
        },

        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            return App.sidebar.filterByPeriod(data, selectedPeriod, applyDateIndex);
        },

        updateStatCards(stats, periodLabel) {
            App.utils.updateElement('totalApplicantsChart', stats.totalCount);
            App.utils.updateElement('statsTimePeriod', periodLabel);
            App.utils.updateElement('pendingInterviewChart', stats.interviewPendingCount);
            App.utils.updateElement('successRateChart', stats.successRate + '%');
            App.utils.updateElement('joinRateChart', stats.joinRate + '%');
        }
    },

    // =========================
    // 내부 모듈 인스턴스들 (외부에서 접근 불가)
    // =========================
    _modules: {
        eventBus: null,
        stateManager: null,
        dataService: null
    },

    // =========================
    // 애플리케이션 상태 (기존과 동일하게 접근 가능)
    // =========================
    get state() {
        return this._modules.stateManager.state;
    },

    // =========================
    // 애플리케이션 초기화 (기존과 동일)
    // =========================
    init: {
        async start() {
            // 내부 모듈들 초기화
            App._modules.eventBus = new EventBus();
            App._modules.stateManager = new StateManager(App._modules.eventBus);
            App._modules.dataService = new DataService(App._modules.eventBus, App._modules.stateManager, App.config);

            // 이벤트 리스너 설정
            App.init.setupEventListeners();
            App.init.setupDateFilterListeners();
            App.init.setupModuleEventListeners();

            // 테마 초기화
            App.theme.initialize();
            
            // 데이터 fetch
            await App.data.fetch();
            
            // 접근성 개선
            setTimeout(() => {
                App.utils.enhanceAccessibility();
            }, 1000);
        },

        setupEventListeners() {
            document.addEventListener('click', function(event) {
                const dropdownContainer = document.querySelector('.column-toggle-container');
                if (dropdownContainer && !dropdownContainer.contains(event.target)) {
                    document.getElementById('columnToggleDropdown').style.display = 'none';
                }

                if (window.innerWidth <= 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar.classList.contains('mobile-open') &&
                        !sidebar.contains(event.target) &&
                        !event.target.closest('.mobile-menu-btn')) {
                        App.ui.toggleMobileMenu();
                    }
                }
            });
        },

        setupDateFilterListeners() {
            document.getElementById('dateModeToggle').addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    App.state.ui.activeDateMode = e.target.dataset.mode;
                    App.filter.updateDateFilterUI();
                    App.filter.apply();
                }
            });
        },

        // 모듈 간 이벤트 리스너 설정
        setupModuleEventListeners() {
            const eventBus = App._modules.eventBus;

            // 데이터 업데이트 시 UI 갱신
            eventBus.on('data:fetch:success', () => {
                App.filter.populateDropdowns();
                App.sidebar.updateWidgets();
                App.data.updateInterviewSchedule();
                App.filter.reset(true);
            });

            // 모달 관련 이벤트
            eventBus.on('modal:open:detail', (data) => {
                App.modal.openDetail(data);
            });

            // 상태 변경 시 사이드바 업데이트
            eventBus.on('state:changed:data.all', () => {
                App.sidebar.updateWidgets();
            });
        }
    },

    // =========================
    // 테마 관련 (기존과 동일)
    // =========================
    theme: {
        initialize() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            App.theme.updateIcon(savedTheme);
        },

        toggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            App.theme.updateIcon(newTheme);
        },

        updateIcon(theme) {
            const icon = document.getElementById('themeIcon');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    // =========================
    // 네비게이션 관련 (기존과 동일)
    // =========================
    navigation: {
        switchPage(pageId) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.querySelector(`.nav-item[onclick="App.navigation.switchPage('${pageId}')"]`).classList.add('active');

            const titles = { dashboard: '지원자 현황', stats: '통계 분석' };
            document.getElementById('pageTitle').textContent = titles[pageId];

            if (pageId === 'stats') {
                setTimeout(() => {
                    if (window.Chart && App.state.data.all.length > 0) {
                        App.charts.initialize();
                        App.stats.update();
                        App.efficiency.update();
                        App.trend.update();
                    }
                }, 100);
            }

            if (window.innerWidth <= 768 && document.getElementById('sidebar').classList.contains('mobile-open')) {
                App.ui.toggleMobileMenu();
            }
        }
    },

    // =========================
    // UI 관련 (기존과 동일)
    // =========================
    ui: {
        toggleMobileMenu() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('show');
        },

        toggleColumnDropdown() {
            const dropdown = document.getElementById('columnToggleDropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        },

        handleColumnToggle(event, columnName) {
            App.state.ui.visibleColumns[columnName] = event.target.checked;
            App.filter.apply();
        },

        setupColumnToggles() {
            const dropdown = document.getElementById('columnToggleDropdown');
            dropdown.innerHTML = '';
            App.state.data.headers.forEach(header => {
                const item = document.createElement('div');
                item.className = 'column-toggle-item';
                item.innerHTML = `<input type="checkbox" id="toggle-${header}" ${App.state.ui.visibleColumns[header] ? 'checked' : ''} onchange="App.ui.handleColumnToggle(event, '${header}')"><label for="toggle-${header}">${header}</label>`;
                dropdown.appendChild(item);
            });
        },

        showLoadingState(container) {
            return App._modules.dataService.showLoadingState(container);
        },

        updateProgress(container, percentage, text) {
            return App._modules.dataService.updateProgress(container, percentage, text);
        },

        showErrorState(container, error) {
            return App._modules.dataService.showErrorState(container, error);
        }
    },

    // =========================
    // 데이터 관련 (DataService로 위임하면서 기존 인터페이스 보존)
    // =========================
    data: {
        async fetch() {
            return await App._modules.dataService.fetch();
        },

        updateSequenceNumber() {
            return App._modules.dataService.updateSequenceNumber();
        },

        updateInterviewSchedule() {
            return App._modules.dataService.updateInterviewSchedule();
        },

        showInterviewDetails(name, route) {
            return App._modules.dataService.showInterviewDetails(name, route);
        },

        async save(data, isUpdate = false, gubun = null) {
            return await App._modules.dataService.save(data, isUpdate, gubun);
        },

        async delete(gubun) {
            return await App._modules.dataService.delete(gubun);
        }
    },

    // =========================
    // 검색 관련 (기존과 동일)
    // =========================
    search: {
        handle() {
            if (App.state.ui.searchTimeout) {
                clearTimeout(App.state.ui.searchTimeout);
            }

            App.state.ui.searchTimeout = setTimeout(() => {
                App.state.ui.searchTerm = String(document.getElementById('globalSearch').value || '').toLowerCase();
                App.state.ui.currentPage = 1;
                App.filter.apply();
            }, 300);
        }
    },

    // =========================
    // 나머지 모든 기존 모듈들 (filter, pagination, view, render, table, modal, sidebar, stats, charts, efficiency, trend, utils)
    // 여기서는 핵심 모듈만 보여주고, 실제로는 기존 script.js의 모든 내용이 그대로 들어갑니다.
    // =========================

    // 필터 관련 (기존과 동일)
    filter: {
        apply() {
            let data = [...App.state.data.all];
            console.log('필터 적용 시작 - 원본 데이터:', data.length);

            const routeFilter = document.getElementById('routeFilter').value;
            const positionFilter = document.getElementById('positionFilter').value;
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            if (App.state.ui.searchTerm) {
                data = data.filter(row => row.some(cell => String(cell || '').toLowerCase().includes(App.state.ui.searchTerm)));
            }

            if (routeFilter !== 'all' && routeIndex !== -1) {
                data = data.filter(row => String(row[routeIndex] || '') === routeFilter);
            }

            if (positionFilter !== 'all' && positionIndex !== -1) {
                data = data.filter(row => String(row[positionIndex] || '') === positionFilter);
            }

            if (applyDateIndex !== -1 && App.state.ui.activeDateMode !== 'all') {
                data = App.filter.applyDateFilter(data, applyDateIndex);
            }

            App.state.data.filtered = App.utils.sortData(data);
            console.log('필터 적용 완료 - 필터링된 데이터:', App.state.data.filtered.length);

            // 페이지네이션 관련 업데이트
            App.pagination.updateTotal();
            App.filter.updateSummary();

            // 현재 뷰에 따라 렌더링
            const pageData = App.pagination.getCurrentPageData();
            console.log('렌더링할 페이지 데이터:', pageData.length);

            // 이벤트 발생으로 컴포넌트들에게 알림
            App._modules.eventBus.emit('filter:applied', pageData);

            if (App.state.ui.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }

            App.pagination.updateUI();
        },

        applyDateFilter(data, applyDateIndex) {
            try {
                if (App.state.ui.activeDateMode === 'year') {
                    const year = document.getElementById('dateInput')?.value;
                    if(year) return data.filter(row => row[applyDateIndex] && new Date(row[applyDateIndex]).getFullYear() == year);
                } else if (App.state.ui.activeDateMode === 'month') {
                    const month = document.getElementById('dateInput')?.value;
                    if(month) return data.filter(row => String(row[applyDateIndex] || '').slice(0, 7) === month);
                } else if (App.state.ui.activeDateMode === 'day') {
                    const day = document.getElementById('dateInput')?.value;
                    if(day) return data.filter(row => String(row[applyDateIndex] || '').slice(0, 10) === day);
                } else if (App.state.ui.activeDateMode === 'range') {
                    const startDate = document.getElementById('startDateInput')?.value;
                    const endDate = document.getElementById('endDateInput')?.value;
                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        return data.filter(row => {
                            if(!row[applyDateIndex]) return false;
                            const applyDate = new Date(row[applyDateIndex]);
                            return applyDate >= start && applyDate <= end;
                        });
                    }
                }
            } catch(e) {
                console.error("날짜 필터링 오류", e);
            }
            return data;
        },

        reset(runApplyFilters = true) {
            document.querySelectorAll('.filter-bar select').forEach(select => select.value = 'all');
            document.getElementById('globalSearch').value = '';
            App.state.ui.searchTerm = '';
            App.state.ui.activeDateMode = 'all';
            App.state.ui.currentPage = 1;
            App.filter.updateDateFilterUI();
            if (runApplyFilters) {
                console.log('필터 리셋 중 - 전체 데이터 개수:', App.state.data.all.length);
                App.filter.apply();
            }
        },

        updateSummary() {
            const filteredCount = App.state.data.filtered.length;
            const searchText = App.state.ui.searchTerm ? ` (검색: "${App.state.ui.searchTerm}")` : '';
            const pageInfo = filteredCount > App.config.ITEMS_PER_PAGE ? ` - ${App.state.ui.currentPage}/${App.state.ui.totalPages} 페이지` : '';
            document.getElementById('filterSummary').innerHTML = `<strong>지원자:</strong> ${filteredCount}명${searchText}${pageInfo}`;
        },

        populateDropdowns() {
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            if (routeIndex !== -1) {
                const routes = [...new Set(App.state.data.all.map(row => String(row[routeIndex] || '').trim()).filter(Boolean))];
                const routeFilter = document.getElementById('routeFilter');
                routeFilter.innerHTML = '<option value="all">전체</option>';
                routes.sort().forEach(route => routeFilter.innerHTML += `<option value="${route}">${route}</option>`);
            }

            if (positionIndex !== -1) {
                const positions = [...new Set(App.state.data.all.map(row => String(row[positionIndex] || '').trim()).filter(Boolean))];
                const positionFilter = document.getElementById('positionFilter');
                positionFilter.innerHTML = '<option value="all">전체</option>';
                positions.sort().forEach(pos => positionFilter.innerHTML += `<option value="${pos}">${pos}</option>`);
            }
        },

        updateDateFilterUI() {
            document.querySelectorAll('.date-mode-btn').forEach(btn =>
                btn.classList.toggle('active', btn.dataset.mode === App.state.ui.activeDateMode)
            );

            const container = document.getElementById('dateInputsContainer');
            let html = '';
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');

            if (App.state.ui.activeDateMode === 'all') {
                html = `<span style="color: var(--text-secondary); font-size: 0.9rem; padding: 0 10px;">모든 데이터 표시</span>`;
            } else if (App.state.ui.activeDateMode === 'year') {
                html = `<input type="number" id="dateInput" value="${year}" onchange="App.filter.apply()">`;
            } else if (App.state.ui.activeDateMode === 'month') {
                html = `<button class="date-nav-btn" onclick="App.filter.navigateDate(-1)">&lt;</button><input type="month" id="dateInput" value="${year}-${month}" onchange="App.filter.apply()"><button class="date-nav-btn" onclick="App.filter.navigateDate(1)">&gt;</button>`;
            } else if (App.state.ui.activeDateMode === 'day') {
                html = `<button class="date-nav-btn" onclick="App.filter.navigateDate(-1)">&lt;</button><input type="date" id="dateInput" value="${year}-${month}-${day}" onchange="App.filter.apply()"><button class="date-nav-btn" onclick="App.filter.navigateDate(1)">&gt;</button>`;
            } else if (App.state.ui.activeDateMode === 'range') {
                html = `<input type="date" id="startDateInput" onchange="App.filter.apply()"><span style="margin: 0 5px;">-</span><input type="date" id="endDateInput" onchange="App.filter.apply()">`;
            }
            container.innerHTML = html;
        },

        navigateDate(direction) {
            const input = document.getElementById('dateInput');
            if (!input) return;

            if (App.state.ui.activeDateMode === 'year') {
                input.value = Number(input.value) + direction;
            } else {
                let currentDate = (App.state.ui.activeDateMode === 'month') ? new Date(input.value + '-02') : new Date(input.value);
                if(App.state.ui.activeDateMode === 'month') currentDate.setMonth(currentDate.getMonth() + direction);
                else if (App.state.ui.activeDateMode === 'day') currentDate.setDate(currentDate.getDate() + direction);
                input.value = currentDate.toISOString().slice(0, App.state.ui.activeDateMode === 'month' ? 7 : 10);
            }
            App.filter.apply();
        }
    }

    },

    // =========================
    // 페이지네이션 관련 (기존과 동일)
    // =========================
    pagination: {
        updateTotal() {
            App.state.ui.totalPages = Math.ceil(App.state.data.filtered.length / App.config.ITEMS_PER_PAGE);
            if (App.state.ui.currentPage > App.state.ui.totalPages && App.state.ui.totalPages > 0) {
                App.state.ui.currentPage = App.state.ui.totalPages;
            } else if (App.state.ui.totalPages === 0) {
                App.state.ui.currentPage = 1;
            }
        },

        getCurrentPageData() {
            const startIndex = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + App.config.ITEMS_PER_PAGE, App.state.data.filtered.length);
            return App.state.data.filtered.slice(startIndex, endIndex);
        },

        goToPage(page) {
            if (page >= 1 && page <= App.state.ui.totalPages) {
                App.state.ui.currentPage = page;
                const pageData = App.pagination.getCurrentPageData();
                
                // 이벤트 발생으로 컴포넌트들에게 알림
                App._modules.eventBus.emit('pagination:changed', { pageData, page });
                
                if (App.state.ui.currentView === 'table') {
                    App.render.table(pageData);
                } else {
                    App.render.cards(pageData);
                }
                App.pagination.updateUI();
            }
        },

        goToPrevPage() {
            App.pagination.goToPage(App.state.ui.currentPage - 1);
        },

        goToNextPage() {
            App.pagination.goToPage(App.state.ui.currentPage + 1);
        },

        goToLastPage() {
            App.pagination.goToPage(App.state.ui.totalPages);
        },

        updateUI() {
            const paginationContainer = document.getElementById('paginationContainer');
            const paginationInfo = document.getElementById('paginationInfo');
            const paginationNumbers = document.getElementById('paginationNumbers');
            const firstPageBtn = document.getElementById('firstPageBtn');
            const prevPageBtn = document.getElementById('prevPageBtn');
            const nextPageBtn = document.getElementById('nextPageBtn');
            const lastPageBtn = document.getElementById('lastPageBtn');

            if (App.state.data.filtered.length === 0) {
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';

            const startItem = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + 1;
            const endItem = Math.min(App.state.ui.currentPage * App.config.ITEMS_PER_PAGE, App.state.data.filtered.length);
            paginationInfo.textContent = `${startItem}-${endItem} / ${App.state.data.filtered.length}명`;

            firstPageBtn.disabled = App.state.ui.currentPage === 1;
            prevPageBtn.disabled = App.state.ui.currentPage === 1;
            nextPageBtn.disabled = App.state.ui.currentPage === App.state.ui.totalPages;
            lastPageBtn.disabled = App.state.ui.currentPage === App.state.ui.totalPages;

            App.pagination.renderPageNumbers(paginationNumbers);
        },

        renderPageNumbers(container) {
            container.innerHTML = '';
            const maxVisiblePages = 5;
            let startPage = Math.max(1, App.state.ui.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(App.state.ui.totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1) {
                const firstPageNum = document.createElement('button');
                firstPageNum.className = 'pagination-number';
                firstPageNum.textContent = '1';
                firstPageNum.onclick = () => App.pagination.goToPage(1);
                container.appendChild(firstPageNum);

                if (startPage > 2) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    container.appendChild(ellipsis);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageNum = document.createElement('button');
                pageNum.className = `pagination-number ${i === App.state.ui.currentPage ? 'active' : ''}`;
                pageNum.textContent = i;
                pageNum.onclick = () => App.pagination.goToPage(i);
                container.appendChild(pageNum);
            }

            if (endPage < App.state.ui.totalPages) {
                if (endPage < App.state.ui.totalPages - 1) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    container.appendChild(ellipsis);
                }

                const lastPageNum = document.createElement('button');
                lastPageNum.className = 'pagination-number';
                lastPageNum.textContent = App.state.ui.totalPages;
                lastPageNum.onclick = () => App.pagination.goToPage(App.state.ui.totalPages);
                container.appendChild(lastPageNum);
            }
        }
    },

    // =========================
    // 뷰 관련 (테이블/카드) (기존과 동일)
    // =========================
    view: {
        switch(viewType) {
            App.state.ui.currentView = viewType;
            const tableView = document.getElementById('tableView');
            const cardsView = document.getElementById('cardsView');
            const viewBtns = document.querySelectorAll('.view-btn');

            viewBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.view-btn[onclick="App.view.switch('${viewType}')"]`).classList.add('active');

            const pageData = App.pagination.getCurrentPageData();

            if (viewType === 'table') {
                tableView.style.display = 'block';
                cardsView.classList.remove('active');
                App.render.table(pageData);
            } else {
                tableView.style.display = 'none';
                cardsView.classList.add('active');
                App.render.cards(pageData);
            }
        }
    },

    // =========================
    // 렌더링 관련 (기존과 동일)
    // =========================
    render: {
        currentView() {
            const pageData = App.pagination.getCurrentPageData();
            if (App.state.ui.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }
        },

        table(dataToRender) {
            const tableContainer = document.querySelector('.table-container');

            if (!dataToRender && App.state.data.all.length === 0) {
                tableContainer.innerHTML = App.utils.createSkeletonTable();
                return;
            }

            const renderData = dataToRender || [];

            tableContainer.innerHTML = '';
            const table = document.createElement('table');
            table.className = 'data-table';
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', '지원자 목록 테이블');

            App.render.tableHeader(table);
            App.render.tableBody(table, renderData);

            tableContainer.appendChild(table);
        },

        tableHeader(table) {
            const thead = table.createTHead();
            const headerRow = thead.insertRow();

            App.state.data.headers.forEach(header => {
                if (App.state.ui.visibleColumns[header]) {
                    const th = document.createElement('th');
                    th.className = 'sortable-header';
                    th.setAttribute('role', 'columnheader');
                    th.setAttribute('tabindex', '0');
                    th.setAttribute('aria-sort', 'none');
                    th.onclick = () => App.table.sort(header);

                    th.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            th.click();
                        }
                    });

                    let sortIcon = 'fa-sort';
                    if (App.state.ui.currentSortColumn === header && App.state.ui.currentSortDirection) {
                        sortIcon = App.state.ui.currentSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
                    }

                    th.innerHTML = `${header} <i class="fas ${sortIcon} sort-icon ${App.state.ui.currentSortColumn === header ? 'active' : ''}"></i>`;
                    headerRow.appendChild(th);
                }
            });
        },

        tableBody(table, dataToRender) {
            const tbody = table.createTBody();

            if (!dataToRender || dataToRender.length === 0) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = Object.values(App.state.ui.visibleColumns).filter(Boolean).length || 1;
                cell.textContent = '표시할 데이터가 없습니다.';
                cell.style.textAlign = 'center';
                cell.style.padding = '40px';
                return;
            }

            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');

            dataToRender.forEach((rowData, index) => {
                const row = tbody.insertRow();
                row.id = `row-${index}`;

                row.onclick = (event) => {
                    if (event.target.tagName !== 'A') {
                        App.modal.openDetail(rowData);
                    }
                };

                if (interviewDateIndex !== -1) {
                    const urgency = App.utils.getInterviewUrgency(rowData[interviewDateIndex]);
                    if (urgency >= 0) row.classList.add(`urgent-interview-${urgency}`);
                }

                App.render.tableCells(row, rowData, index);
            });
        },

        tableCells(row, rowData, index) {
            App.state.data.headers.forEach((header, cellIndex) => {
                if (App.state.ui.visibleColumns[header]) {
                    const cell = row.insertCell();
                    let cellData = rowData[cellIndex];

                    if (header === '구분') {
                        const displaySequence = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;
                        cellData = displaySequence;
                    }

                    const statusClass = App.utils.getStatusClass(header, cellData);
                    if (statusClass) {
                        cell.innerHTML = `<span class="status-badge ${statusClass}">${String(cellData || '')}</span>`;
                    } else if (header === '연락처' && cellData) {
                        cell.innerHTML = `<a href="tel:${String(cellData).replace(/\D/g, '')}">${cellData}</a>`;
                    } else if (header === '면접 시간' && cellData) {
                        cell.textContent = App.utils.formatInterviewTime(cellData);
                    } else if ((header.includes('날짜') || header.includes('날자') || header.includes('지원일') || header.includes('입과일')) && cellData) {
                        cell.textContent = App.utils.formatDate(cellData);
                    } else {
                        cell.textContent = String(cellData || '');
                    }
                }
            });
        },

        cards(dataToRender) {
            const cardsContainer = document.getElementById('cardsView');
            cardsContainer.innerHTML = '';

            if (!dataToRender || dataToRender.length === 0) {
                cardsContainer.innerHTML = '<p style="text-align:center; padding: 40px; grid-column: 1/-1;">표시할 데이터가 없습니다.</p>';
                return;
            }

            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');

            dataToRender.forEach((rowData, index) => {
                const card = document.createElement('div');
                card.className = 'applicant-card';
                card.onclick = () => App.modal.openDetail(rowData);

                if (interviewDateIndex !== -1) {
                    const urgency = App.utils.getInterviewUrgency(rowData[interviewDateIndex]);
                    if (urgency >= 0) card.classList.add(`urgent-card-${urgency}`);
                }

                const getVal = (header) => String(rowData[App.state.data.headers.indexOf(header)] || '-');
                const name = getVal('이름');
                const phone = getVal('연락처');
                const route = getVal('지원루트');
                const position = getVal('모집분야');
                let date = getVal('지원일');

                if(date !== '-') {
                    try {
                        date = new Date(date).toLocaleDateString('ko-KR');
                    } catch(e) {}
                }

                const displaySequence = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;

                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-name">${name}</div>
                        <div class="card-sequence">#${displaySequence}</div>
                    </div>
                    <div class="card-info">
                        <div><span class="card-label">연락처:</span> ${phone}</div>
                        <div><span class="card-label">지원루트:</span> ${route}</div>
                        <div><span class="card-label">모집분야:</span> ${position}</div>
                    </div>
                    <div class="card-footer">
                        <span>지원일: ${date}</span>
                        ${phone !== '-' ? `<a href="tel:${phone.replace(/\D/g, '')}" onclick="event.stopPropagation()"><i class="fas fa-phone"></i></a>` : ''}
                    </div>`;
                cardsContainer.appendChild(card);
            });
        }
    },

    // =========================
    // 테이블 관련 (기존과 동일)
    // =========================
    table: {
        sort(columnName) {
            if (App.state.ui.currentSortColumn === columnName) {
                App.state.ui.currentSortDirection = App.state.ui.currentSortDirection === 'asc' ? 'desc' : '';
                if (App.state.ui.currentSortDirection === '') {
                    App.state.ui.currentSortColumn = '지원일';
                    App.state.ui.currentSortDirection = 'desc';
                }
            } else {
                App.state.ui.currentSortColumn = columnName;
                App.state.ui.currentSortDirection = 'asc';
            }
            App.filter.apply();
        }
    }
};

// =========================
// 전역에서 사용되는 함수들 (하위 호환성) - 기존과 동일
// =========================

// 모달 관련
window.onclick = function(event) {
    if (event.target == App.modal?.element) App.modal.close();
}

// =========================
// 애플리케이션 시작 - 기존과 동일
// =========================

document.addEventListener('DOMContentLoaded', () => {
    App.init.start();
});

// 전역 App 객체 노출 (기존과 동일)
window.App = App
