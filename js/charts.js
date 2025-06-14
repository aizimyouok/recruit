import { appState } from './state.js';
import { calculateCoreStats, filterDataByPeriod } from './logic.js';

let chartInitialized = false;

/**
 * 모든 차트 인스턴스를 초기화합니다.
 */
export function initializeCharts() {
    if (chartInitialized) return;

    const colors = { primary: '#818cf8', success: '#10b981', warning: '#f59e0b', danger: '#ef4444', orange: '#fb923c' };
    const chartConfigs = {
        route: { type: 'bar', options: { indexAxis: 'y', plugins: { legend: { display: false } } }, data: { datasets: [{ backgroundColor: colors.primary }] } },
        position: { type: 'bar', options: { indexAxis: 'y', plugins: { legend: { display: false } } }, data: { datasets: [{ backgroundColor: colors.success }] } },
        trend: { type: 'line', options: {}, data: { datasets: [{ label: '지원자 수', borderColor: colors.primary, backgroundColor: colors.primary + '20', tension: 0.4, fill: true }] } },
        region: { type: 'doughnut', options: { plugins: { legend: { position: 'bottom' } } }, data: { datasets: [{ backgroundColor: Object.values(colors) }] } },
        gender: { type: 'pie', options: { plugins: { legend: { position: 'bottom' } } }, data: { datasets: [{ backgroundColor: [colors.primary, colors.warning] }] } },
        age: { type: 'bar', options: { plugins: { legend: { display: false } } }, data: { datasets: [{ backgroundColor: colors.orange }] } },
    };

    Object.entries(chartConfigs).forEach(([name, config]) => {
        const ctx = document.getElementById(`${name}Chart`);
        if (ctx && !appState.charts.instances[name]) {
            appState.charts.instances[name] = new Chart(ctx, {
                type: config.type,
                data: { labels: [], datasets: config.data.datasets },
                options: { responsive: true, maintainAspectRatio: false, ...config.options, scales: { x: { beginAtZero: true }, y: { beginAtZero: true } } }
            });
        }
    });
    chartInitialized = true;
}

/**
 * 통계 페이지의 모든 컴포넌트(카드, 차트, 테이블)를 업데이트합니다.
 */
export function updateStatistics() {
    if (appState.allApplicantData.length === 0) return;

    const selectedPeriod = document.getElementById('statsPeriodFilter').value;
    const periodMap = { 'all': 'all', 'year': 'this_year', 'month': 'this_month', 'week': 'this_week', 'custom': 'range' };
    
    const dateFilterConfig = {
        mode: periodMap[selectedPeriod],
        start: document.getElementById('statsStartDate').value,
        end: document.getElementById('statsEndDate').value
    };
    
    const dataToAnalyze = filterDataByPeriod(appState.allApplicantData, appState.currentHeaders.indexOf('지원일'), dateFilterConfig);
    const stats = calculateCoreStats(dataToAnalyze);

    // 상단 스탯 카드 업데이트
    updateStatCard('totalApplicantsChart', stats.total);
    updateStatCard('pendingInterviewChart', stats.pending);
    updateStatCard('successRateChart', `${stats.successRate}%`);
    updateStatCard('joinRateChart', `${stats.joinRate}%`);
    const labelEl = document.querySelector(`#statsPeriodFilter option[value="${selectedPeriod}"]`);
    updateStatCard('statsTimePeriod', labelEl ? labelEl.textContent : '전체 기간');
    
    // 기본 차트들 업데이트
    updateAggregateCharts(dataToAnalyze);
    
    // 효율성 분석 및 추이 분석 업데이트
    updateEfficiencyAnalysis(dataToAnalyze);
    updateTrendAnalysis(); // 추이 차트는 항상 전체 데이터를 기준으로 함
}

/**
 * 집계 기반 차트(루트, 분야, 성별, 연령)를 업데이트합니다.
 * @param {Array} data - 분석할 데이터
 */
function updateAggregateCharts(data) {
    // 차트 업데이트 헬퍼 함수
    const updateChart = (name, labels, chartData) => {
        const chart = appState.charts.instances[name];
        if (!chart) return;
        chart.data.labels = labels.length > 0 ? labels : ['데이터 없음'];
        chart.data.datasets[0].data = labels.length > 0 ? chartData : [1];
        chart.update();
    };
    
    // 컬럼별 데이터 집계 헬퍼 함수
    const aggregateByColumn = (colName) => {
        const counts = {};
        const index = appState.currentHeaders.indexOf(colName);
        if (index === -1) return { labels: [], data: [] };
        data.forEach(row => {
            const key = (row[index] || '미입력').trim();
            counts[key] = (counts[key] || 0) + 1;
        });
        return { labels: Object.keys(counts), data: Object.values(counts) };
    };

    let chartData;
    chartData = aggregateByColumn('지원루트');
    updateChart('route', chartData.labels, chartData.data);
    
    chartData = aggregateByColumn('모집분야');
    updateChart('position', chartData.labels, chartData.data);
    
    chartData = aggregateByColumn('성별');
    updateChart('gender', chartData.labels, chartData.data);
    
    // 연령대별 집계
    const ageIndex = appState.currentHeaders.indexOf('나이');
    const ageGroups = { '20대 이하': 0, '30대': 0, '40대': 0, '50대': 0, '60대 이상': 0 };
    if (ageIndex !== -1) {
        data.forEach(row => {
            const age = parseInt(row[ageIndex], 10);
            if(isNaN(age)) return;
            if (age <= 29) ageGroups['20대 이하']++;
            else if (age <= 39) ageGroups['30대']++;
            else if (age <= 49) ageGroups['40대']++;
            else if (age <= 59) ageGroups['50대']++;
            else ageGroups['60대 이상']++;
        });
    }
    updateChart('age', Object.keys(ageGroups), Object.values(ageGroups));
}

/**
 * 지원자 추이 분석 차트를 업데이트합니다. (항상 전체 데이터 기준)
 */
function updateTrendAnalysis() {
    const trendChart = appState.charts.instances.trend;
    if (!trendChart) return;

    const applyDateIndex = appState.currentHeaders.indexOf('지원일');
    if (applyDateIndex === -1) return;

    const trendData = {};
    const mode = appState.charts.currentTrendTab;
    const dataSet = appState.allApplicantData;

    if (mode === 'all') { // 최근 12개월
        for (let i = 11; i >= 0; i--) {
            const d = new Date(); d.setMonth(d.getMonth() - i);
            trendData[`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`] = 0;
        }
    } else if (mode === 'year') { // 최근 5년
        const currentYear = new Date().getFullYear();
        for (let i = 4; i >= 0; i--) trendData[currentYear - i] = 0;
    } else if (mode === 'month') { // 올해 월별
        const currentYear = new Date().getFullYear();
        for (let i = 1; i <= 12; i++) trendData[`${currentYear}-${i.toString().padStart(2, '0')}`] = 0;
    }

    dataSet.forEach(row => {
        try {
            const date = new Date(row[applyDateIndex]);
            if(isNaN(date.getTime())) return;
            let key;
            if (mode === 'year') {
                key = date.getFullYear();
            } else {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            }
            if (trendData.hasOwnProperty(key)) trendData[key]++;
        } catch(e) {}
    });
    
    trendChart.data.labels = Object.keys(trendData);
    trendChart.data.datasets[0].data = Object.values(trendData);
    trendChart.update();
}

/**
 * 효율성 분석 테이블을 업데이트합니다.
 * @param {Array} data - 분석할 데이터
 */
function updateEfficiencyAnalysis(data) {
    const tab = appState.charts.currentEfficiencyTab;
    const categoryHeader = { 'route': '지원루트', 'recruiter': '증원자', 'interviewer': '면접자' }[tab];
    
    const categoryIndex = appState.currentHeaders.indexOf(categoryHeader);
    const container = document.getElementById('efficiencyTabContent');

    if (categoryIndex === -1) {
        container.innerHTML = `<p class="error-message">${categoryHeader} 컬럼이 없습니다.</p>`;
        return;
    }

    const contactResultIndex = appState.currentHeaders.indexOf('1차 컨택 결과');
    const interviewResultIndex = appState.currentHeaders.indexOf('면접결과');
    const joinDateIndex = appState.currentHeaders.indexOf('입과일');
    
    const stats = {};
    data.forEach(row => {
        const category = (row[categoryIndex] || '미입력').trim();
        if (!stats[category]) stats[category] = { total: 0, interviewConfirmed: 0, passed: 0, joined: 0 };
        stats[category].total++;
        if ((row[contactResultIndex] || '').trim() === '면접확정') stats[category].interviewConfirmed++;
        if ((row[interviewResultIndex] || '').trim() === '합격') stats[category].passed++;
        if ((row[joinDateIndex] || '').trim() && (row[joinDateIndex] || '').trim() !== '-') stats[category].joined++;
    });

    renderEfficiencyTable(stats, categoryHeader);
}

/**
 * 효율성 분석 데이터를 받아 HTML 테이블로 렌더링합니다.
 * @param {object} stats - 분석된 통계 데이터
 * @param {string} categoryName - 카테고리 이름 (예: 지원루트)
 */
function renderEfficiencyTable(stats, categoryName) {
    const container = document.getElementById('efficiencyTabContent');
    if (Object.keys(stats).length === 0) {
        container.innerHTML = `<p style="text-align:center; padding: 20px;">분석할 데이터가 없습니다.</p>`;
        return;
    }

    const maxTotal = Math.max(...Object.values(stats).map(s => s.total), 1);

    const dataArray = Object.entries(stats).map(([name, data]) => {
        const interviewConfirmRate = data.total > 0 ? (data.interviewConfirmed / data.total) * 100 : 0;
        const passRate = data.interviewConfirmed > 0 ? (data.passed / data.interviewConfirmed) * 100 : 0;
        const joinRate = data.total > 0 ? (data.joined / data.total) * 100 : 0; // 최종 입과율은 전체 지원자 대비
        const volumeWeight = (data.total / maxTotal) * 100;
        const efficiencyScore = (joinRate * 0.4) + (passRate * 0.3) + (interviewConfirmRate * 0.2) + (volumeWeight * 0.1);
        return { name, ...data, interviewConfirmRate: Math.round(interviewConfirmRate), passRate: Math.round(passRate), joinRate: Math.round(joinRate), efficiencyScore: Math.round(efficiencyScore * 10) / 10 };
    }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);
    
    const headers = [categoryName, '총 지원자', '면접확정', '합격자', '입과자', '면접확정률', '합격률', '최종 입과율', '효율성 점수'];
    let tableHtml = `<div class="table-container"><table class="efficiency-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
    
    dataArray.forEach((item, index) => {
        const rankClass = index < 3 ? `efficiency-rank-${index + 1}` : '';
        tableHtml += `<tr class="${rankClass}">
            <td>${item.name}</td>
            <td>${item.total.toLocaleString()}</td>
            <td>${item.interviewConfirmed}</td>
            <td>${item.passed}</td>
            <td>${item.joined}</td>
            <td>${item.interviewConfirmRate}%</td>
            <td>${item.passRate}%</td>
            <td style="font-weight: bold; color: var(--accent-orange);">${item.joinRate}%</td>
            <td style="font-weight: bold;">${item.efficiencyScore}</td>
        </tr>`;
    });
    
    tableHtml += `</tbody></table></div>`;
    container.innerHTML = tableHtml;
}


// ===================================================================================
// 이벤트 핸들러 (main.js에서 호출)
// ===================================================================================

export function handleEfficiencyTabClick(tab) {
    appState.charts.currentEfficiencyTab = tab;
    document.querySelectorAll('.efficiency-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
    updateStatistics();
}

export function handleTrendTabClick(period) {
    appState.charts.currentTrendTab = period;
    document.querySelectorAll('.trend-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.period === period));
    updateTrendAnalysis();
}

function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = value;
}