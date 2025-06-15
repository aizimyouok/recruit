// js/components/Table.js

/**
 * 테이블 컴포넌트
 * 기존 App.render와 App.table의 모든 기능을 캡슐화
 */
export class TableComponent {
    constructor(eventBus, stateManager, config) {
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.config = config;
        this.container = document.querySelector('.table-container');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 상태 변경 감지
        this.eventBus.on('data:updated', () => {
            this.refresh();
        });

        this.eventBus.on('filter:applied', (data) => {
            this.render(data);
        });

        this.eventBus.on('sort:changed', ({ column, direction }) => {
            this.updateSortIndicators(column, direction);
        });

        this.eventBus.on('pagination:changed', ({ pageData }) => {
            this.render(pageData);
        });
    }

    /**
     * 테이블 렌더링 - 기존 App.render.table과 동일
     */
    render(dataToRender) {
        // 전체 데이터가 없고 렌더링할 데이터도 없을 때만 스켈레톤 표시
        if (!dataToRender && this.stateManager.state.data.all.length === 0) {
            this.container.innerHTML = this.createSkeletonTable();
            return;
        }

        // dataToRender가 없으면 빈 배열로 처리
        const renderData = dataToRender || [];

        this.container.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'data-table';
        table.setAttribute('role', 'table');
        table.setAttribute('aria-label', '지원자 목록 테이블');

        this.renderHeader(table);
        this.renderBody(table, renderData);

        this.container.appendChild(table);
        
        this.eventBus.emit('table:rendered', { rowCount: renderData.length });
    }

    /**
     * 테이블 헤더 렌더링
     */
    renderHeader(table) {
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        const headers = this.stateManager.state.data.headers;
        const visibleColumns = this.stateManager.state.ui.visibleColumns;

        headers.forEach(header => {
            if (visibleColumns[header]) {
                const th = document.createElement('th');
                th.className = 'sortable-header';
                th.setAttribute('role', 'columnheader');
                th.setAttribute('tabindex', '0');
                th.setAttribute('aria-sort', 'none');
                
                // 정렬 이벤트 처리
                th.onclick = () => this.handleSort(header);
                th.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleSort(header);
                    }
                });

                this.updateHeaderContent(th, header);
                headerRow.appendChild(th);
            }
        });
    }

    /**
     * 헤더 내용 업데이트 (정렬 아이콘 포함)
     */
    updateHeaderContent(th, header) {
        const currentSortColumn = this.stateManager.state.ui.currentSortColumn;
        const currentSortDirection = this.stateManager.state.ui.currentSortDirection;
        
        let sortIcon = 'fa-sort';
        let ariaSort = 'none';
        
        if (currentSortColumn === header && currentSortDirection) {
            if (currentSortDirection === 'asc') {
                sortIcon = 'fa-sort-up';
                ariaSort = 'ascending';
            } else {
                sortIcon = 'fa-sort-down';
                ariaSort = 'descending';
            }
        }

        th.setAttribute('aria-sort', ariaSort);
        th.innerHTML = `${header} <i class="fas ${sortIcon} sort-icon ${currentSortColumn === header ? 'active' : ''}"></i>`;
    }

    /**
     * 정렬 처리
     */
    handleSort(columnName) {
        const currentSortColumn = this.stateManager.state.ui.currentSortColumn;
        const currentSortDirection = this.stateManager.state.ui.currentSortDirection;

        let newDirection;
        
        if (currentSortColumn === columnName) {
            newDirection = currentSortDirection === 'asc' ? 'desc' : '';
            if (newDirection === '') {
                // 정렬 해제 시 기본 정렬로 복귀
                this.stateManager.state.ui.currentSortColumn = '지원일';
                this.stateManager.state.ui.currentSortDirection = 'desc';
            } else {
                this.stateManager.state.ui.currentSortDirection = newDirection;
            }
        } else {
            this.stateManager.state.ui.currentSortColumn = columnName;
            this.stateManager.state.ui.currentSortDirection = 'asc';
        }

        this.eventBus.emit('sort:requested', {
            column: this.stateManager.state.ui.currentSortColumn,
            direction: this.stateManager.state.ui.currentSortDirection
        });
    }

    /**
     * 정렬 인디케이터 업데이트
     */
    updateSortIndicators(column, direction) {
        const headers = this.container.querySelectorAll('.sortable-header');
        headers.forEach(header => {
            const headerText = header.textContent.replace(/\s+[▲▼]?$/, '').trim();
            this.updateHeaderContent(header, headerText);
        });
    }

    /**
     * 테이블 바디 렌더링
     */
    renderBody(table, dataToRender) {
        const tbody = table.createTBody();
        const visibleColumns = this.stateManager.state.ui.visibleColumns;

        if (!dataToRender || dataToRender.length === 0) {
            const row = tbody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = Object.values(visibleColumns).filter(Boolean).length || 1;
            cell.textContent = '표시할 데이터가 없습니다.';
            cell.style.textAlign = 'center';
            cell.style.padding = '40px';
            cell.style.color = 'var(--text-secondary)';
            return;
        }

        const headers = this.stateManager.state.data.headers;
        let interviewDateIndex = headers.indexOf('면접 날짜');
        if (interviewDateIndex === -1) interviewDateIndex = headers.indexOf('면접 날자');

        dataToRender.forEach((rowData, index) => {
            const row = tbody.insertRow();
            row.id = `row-${index}`;
            row.setAttribute('data-row-index', index);

            // 행 클릭 이벤트 - 모달 열기
            row.onclick = (event) => {
                if (event.target.tagName !== 'A') {
                    this.eventBus.emit('row:clicked', { data: rowData, index });
                }
            };

            // 면접 임박도에 따른 스타일링
            if (interviewDateIndex !== -1) {
                const urgency = this.getInterviewUrgency(rowData[interviewDateIndex]);
                if (urgency >= 0) {
                    row.classList.add(`urgent-interview-${urgency}`);
                }
            }

            this.renderCells(row, rowData, index);
        });
    }

    /**
     * 테이블 셀 렌더링
     */
    renderCells(row, rowData, index) {
        const headers = this.stateManager.state.data.headers;
        const visibleColumns = this.stateManager.state.ui.visibleColumns;
        const currentPage = this.stateManager.state.ui.currentPage;

        headers.forEach((header, cellIndex) => {
            if (visibleColumns[header]) {
                const cell = row.insertCell();
                let cellData = rowData[cellIndex];

                // 구분 컬럼은 페이지별 순번으로 표시
                if (header === '구분') {
                    const displaySequence = (currentPage - 1) * this.config.ITEMS_PER_PAGE + index + 1;
                    cellData = displaySequence;
                }

                this.setCellContent(cell, header, cellData);
            }
        });
    }

    /**
     * 셀 내용 설정
     */
    setCellContent(cell, header, cellData) {
        const statusClass = this.getStatusClass(header, cellData);
        
        if (statusClass) {
            // 상태 배지
            cell.innerHTML = `<span class="status-badge ${statusClass}">${String(cellData || '')}</span>`;
        } else if (header === '연락처' && cellData) {
            // 전화번호 링크
            const cleanPhone = String(cellData).replace(/\D/g, '');
            cell.innerHTML = `<a href="tel:${cleanPhone}" onclick="event.stopPropagation()">${cellData}</a>`;
        } else if (header === '면접 시간' && cellData) {
            // 시간 포맷팅
            cell.textContent = this.formatInterviewTime(cellData);
        } else if ((header.includes('날짜') || header.includes('날자') || header.includes('지원일') || header.includes('입과일')) && cellData) {
            // 날짜 포맷팅
            cell.textContent = this.formatDate(cellData);
        } else {
            // 일반 텍스트
            cell.textContent = String(cellData || '');
        }

        // 셀 타이틀 설정 (말줄임표 대응)
        if (cellData && String(cellData).length > 20) {
            cell.title = String(cellData);
        }
    }

    /**
     * 스켈레톤 테이블 생성
     */
    createSkeletonTable() {
        const skeletonRows = Array.from({length: 8}, (_, i) => `
            <tr class="skeleton-row">
                <td><div class="skeleton-cell short"></div></td>
                <td><div class="skeleton-cell medium"></div></td>
                <td><div class="skeleton-cell long"></div></td>
                <td><div class="skeleton-cell short"></div></td>
                <td><div class="skeleton-cell medium"></div></td>
                <td><div class="skeleton-cell long"></div></td>
                <td><div class="skeleton-cell medium"></div></td>
            </tr>
        `).join('');

        return `
            <div class="skeleton-container">
                <table class="skeleton-table">
                    <thead>
                        <tr>
                            <th>구분</th><th>이름</th><th>연락처</th><th>지원루트</th><th>모집분야</th><th>지원일</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${skeletonRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * 테이블 새로고침
     */
    refresh() {
        const currentPageData = this.getCurrentPageData();
        this.render(currentPageData);
    }

    /**
     * 현재 페이지 데이터 가져오기
     */
    getCurrentPageData() {
        const filtered = this.stateManager.state.data.filtered;
        const currentPage = this.stateManager.state.ui.currentPage;
        const itemsPerPage = this.config.ITEMS_PER_PAGE;
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);
        
        return filtered.slice(startIndex, endIndex);
    }

    /**
     * 유틸리티 메서드들
     */
    getInterviewUrgency(interviewDate) {
        if (!interviewDate) return -1;
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const date = new Date(interviewDate);
            date.setHours(0, 0, 0, 0);
            const diffTime = date.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 2) return diffDays;
            return -1;
        } catch (e) {
            return -1;
        }
    }

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
    }

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
    }

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
    }

    /**
     * 테이블 상태 정보 반환 (디버깅용)
     */
    getStatus() {
        const table = this.container.querySelector('.data-table');
        return {
            isRendered: !!table,
            rowCount: table ? table.tBodies[0]?.rows.length || 0 : 0,
            columnCount: table ? table.tHead?.rows[0]?.cells.length || 0 : 0,
            currentSort: {
                column: this.stateManager.state.ui.currentSortColumn,
                direction: this.stateManager.state.ui.currentSortDirection
            }
        };
    }

    /**
     * 테이블 데이터 내보내기
     */
    exportData(format = 'csv') {
        const headers = this.stateManager.state.data.headers;
        const visibleHeaders = headers.filter(header => this.stateManager.state.ui.visibleColumns[header]);
        const filteredData = this.stateManager.state.data.filtered;

        const exportData = filteredData.map(row => {
            return headers.map((header, index) => {
                if (this.stateManager.state.ui.visibleColumns[header]) {
                    return row[index] || '';
                }
                return null;
            }).filter(cell => cell !== null);
        });

        this.eventBus.emit('table:export:requested', {
            format,
            headers: visibleHeaders,
            data: exportData
        });
    }

    /**
     * 선택된 행들의 데이터 반환
     */
    getSelectedRows() {
        const selectedRows = this.container.querySelectorAll('tr.selected');
        const selectedData = [];
        
        selectedRows.forEach(row => {
            const rowIndex = parseInt(row.getAttribute('data-row-index'));
            if (!isNaN(rowIndex)) {
                const pageData = this.getCurrentPageData();
                if (pageData[rowIndex]) {
                    selectedData.push(pageData[rowIndex]);
                }
            }
        });
        
        return selectedData;
    }

    /**
     * 행 선택/해제 토글
     */
    toggleRowSelection(rowIndex) {
        const row = this.container.querySelector(`tr[data-row-index="${rowIndex}"]`);
        if (row) {
            row.classList.toggle('selected');
            this.eventBus.emit('row:selection:changed', {
                rowIndex,
                isSelected: row.classList.contains('selected'),
                selectedCount: this.getSelectedRows().length
            });
        }
    }

    /**
     * 모든 행 선택/해제
     */
    toggleAllRows(selectAll) {
        const rows = this.container.querySelectorAll('tbody tr[data-row-index]');
        rows.forEach(row => {
            if (selectAll) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        });
        
        this.eventBus.emit('rows:selection:changed', {
            selectAll,
            selectedCount: selectAll ? rows.length : 0
        });
    }
}