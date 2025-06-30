// =========================
// state.js - 상태 관리
// =========================

export const createInitialState = () => ({
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
        filterTimeout: null, // 🔥 추가
        currentEditingData: null
    },
    charts: {
        instances: {},
        currentEfficiencyTab: 'route',
        currentTrendTab: 'all'
    }
});

export { createInitialState };
