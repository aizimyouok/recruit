export const config = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby3-nGn2KZCc49NIELYgr3_Wp_vUElARftdXuIEk-V2dh3Fb9p2yqe3fN4JhIVqpZR2/exec',
    DEFAULT_HIDDEN_COLUMNS: ['비고', '부재', '거절', '보류', '면접확정', '면접 날짜', '면접 시간', '미참석', '불합격/보류', '입과/출근', '입과일', '지점배치', '면접리뷰'],
    PAGINATION_ITEMS_PER_PAGE: 30
};

export const appState = {
    allApplicantData: [],
    filteredData: [],
    currentHeaders: [],
    nextSequenceNumber: 1,
    pagination: { currentPage: 1, totalPages: 1 },
    ui: {
        visibleColumns: {},
        currentView: 'table',
        activeDateMode: 'all',
        searchTimeout: null,
        currentEditingData: null,
    },
    sorting: { column: '지원일', direction: 'desc' },
    filters: { searchTerm: '' },
    charts: {
        instances: {},
        currentEfficiencyTab: 'route',
        currentTrendTab: 'all',
    }
};