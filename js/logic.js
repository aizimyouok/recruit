import { appState } from './state.js';

/**
 * 데이터를 정렬합니다.
 * @param {Array} data - 정렬할 데이터 배열
 * @returns {Array} 정렬된 새로운 배열
 */
export function sortData(data) {
    const { column, direction } = appState.sorting;
    if (!column || !direction) return data;

    const sortIndex = appState.currentHeaders.indexOf(column);
    if (sortIndex === -1) return data;

    return [...data].sort((a, b) => {
        let valA = a[sortIndex] || '';
        let valB = b[sortIndex] || '';
        
        if (column.includes('날') || column.includes('일')) {
            valA = new Date(valA || '1970-01-01');
            valB = new Date(valB || '1970-01-01');
        } else if (!isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '') {
            valA = Number(valA);
            valB = Number(valB);
        } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }
        
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * 핵심 통계를 계산합니다.
 * @param {Array} data - 통계를 계산할 데이터 배열
 * @returns {object} { total, pending, successRate, joinRate }
 */
export function calculateCoreStats(data) {
    const contactResultIndex = appState.currentHeaders.indexOf('1차 컨택 결과');
    const interviewResultIndex = appState.currentHeaders.indexOf('면접결과');
    const joinDateIndex = appState.currentHeaders.indexOf('입과일');

    const interviewConfirmed = data.filter(row => (row[contactResultIndex] || '').trim() === '면접확정');
    const passedFromConfirmed = interviewConfirmed.filter(row => (row[interviewResultIndex] || '').trim() === '합격');
    
    const allPassed = data.filter(row => (row[interviewResultIndex] || '').trim() === '합격');
    const joinedFromPassed = allPassed.filter(row => (row[joinDateIndex] || '').trim() && (row[joinDateIndex] || '').trim() !== '-');

    const successRate = interviewConfirmed.length > 0 ? Math.round((passedFromConfirmed.length / interviewConfirmed.length) * 100) : 0;
    const joinRate = allPassed.length > 0 ? Math.round((joinedFromPassed.length / allPassed.length) * 100) : 0;

    return {
        total: data.length,
        pending: interviewConfirmed.length,
        successRate: successRate,
        joinRate: joinRate
    };
}

/**
 * 기간에 따라 데이터를 필터링합니다.
 * @param {Array} data - 필터링할 원본 데이터
 * @param {number} dateIndex - 날짜 컬럼의 인덱스
 * @param {object} filterConfig - { mode, start, end, singleDate }
 * @returns {Array} 필터링된 데이터
 */
export function filterDataByPeriod(data, dateIndex, filterConfig) {
    if (dateIndex === -1 || filterConfig.mode === 'all') return data;
    
    const now = new Date();
    
    return data.filter(row => {
        const dateValue = row[dateIndex];
        if (!dateValue) return false;
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return false;

            switch (filterConfig.mode) {
                case 'year': return filterConfig.singleDate && date.getFullYear() == filterConfig.singleDate;
                case 'month': return filterConfig.singleDate && dateValue.slice(0, 7) === filterConfig.singleDate;
                case 'day': return filterConfig.singleDate && dateValue.slice(0, 10) === filterConfig.singleDate;
                case 'range':
                    if (!filterConfig.start || !filterConfig.end) return true;
                    const start = new Date(filterConfig.start);
                    const end = new Date(filterConfig.end);
                    end.setHours(23, 59, 59, 999);
                    return date >= start && date <= end;
                case 'this_year': return date.getFullYear() === now.getFullYear();
                case 'this_month': return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
                case 'this_week':
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    weekStart.setHours(0, 0, 0, 0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    weekEnd.setHours(23, 59, 59, 999);
                    return date >= weekStart && date <= weekEnd;
                default: return true;
            }
        } catch (e) {
            return false;
        }
    });
}