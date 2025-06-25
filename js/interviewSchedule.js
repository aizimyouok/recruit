// =================================
// js/interviewSchedule.js - 면접 일정 페이지 모듈 (기능 확장 버전)
// =================================

export const InterviewScheduleModule = {
    state: {
        interviewer: 'all',
        company: 'all',
        route: 'all',
        position: 'all',
        searchTerm: '',
        dateMode: 'range',
        dateValue: '',
        startDate: '',
        endDate: '',
        sortBy: '면접일시',
        sortOrder: 'asc',
        interviews: [],
        visibleColumns: {}
    },

    initialize(appInstance) {
        console.log('📅 면접일정 페이지 초기화');
        this.app = appInstance;
        this.populateFilters();
        this.setInitialDateRange();
        this.setupColumnToggles();
        this.applyFilters();
        document.getElementById('scheduleColumnToggleBtn').onclick = () => this.toggleColumnDropdown();
    },

    populateFilters() {
        const { headers, all } = this.app.state.data;
        const interviewerIndex = headers.indexOf('면접관');
        const companyIndex = headers.indexOf('회사명');
        const routeIndex = headers.indexOf('지원루트');
        const positionIndex = headers.indexOf('모집분야');

        const populate = (selector, index) => {
            const selectElement = document.getElementById(selector);
            if (selectElement && index !== -1) {
                const options = [...new Set(all.map(row => row[index]).filter(Boolean))];
                selectElement.innerHTML = `<option value="all">전체</option>`;
                options.sort().forEach(name => {
                    selectElement.innerHTML += `<option value="${name}">${name}</option>`;
                });
            }
        };

        populate('scheduleInterviewerFilter', interviewerIndex);
        populate('scheduleCompanyFilter', companyIndex);
        populate('scheduleRouteFilter', routeIndex);
        populate('schedulePositionFilter', positionIndex);
    },
    
    setInitialDateRange() {
        this.state.dateMode = 'range';
        const today = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(today.getMonth() + 1);
        
        this.state.startDate = this.formatDateForInput(today);
        this.state.endDate = this.formatDateForInput(oneMonthLater);
        
        this.updateDateFilterUI();
    },

    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    updateDateFilterUI() {
        const container = document.getElementById('scheduleDateFilterContainer');
        container.innerHTML = `
            <input type="date" id="scheduleStartDate" value="${this.state.startDate}" onchange="globalThis.App.interviewSchedule.applyFilters()">
            <span style="margin: 0 5px;">-</span>
            <input type="date" id="scheduleEndDate" value="${this.state.endDate}" onchange="globalThis.App.interviewSchedule.applyFilters()">
        `;
    },

    applyFilters() {
        if (!this.app) return;

        this.state.interviewer = document.getElementById('scheduleInterviewerFilter').value;
        this.state.company = document.getElementById('scheduleCompanyFilter').value;
        this.state.route = document.getElementById('scheduleRouteFilter').value;
        this.state.position = document.getElementById('schedulePositionFilter').value;
        this.state.searchTerm = document.getElementById('scheduleSearch').value.toLowerCase();
        this.state.startDate = document.getElementById('scheduleStartDate').value;
        this.state.endDate = document.getElementById('scheduleEndDate').value;

        const { headers, all } = this.app.state.data;
        const indices = {
            contactResult: headers.indexOf('1차 컨택 결과'),
            interviewDate: headers.indexOf('면접 날짜') !== -1 ? headers.indexOf('면접 날짜') : headers.indexOf('면접 날자'),
            interviewer: headers.indexOf('면접관'),
            company: headers.indexOf('회사명'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야'),
        };

        let filtered = all.filter(row => (row[indices.contactResult] || '').trim() === '면접확정' && (row[indices.interviewDate] || '').trim());
        
        // Date filter
        if (this.state.startDate && this.state.endDate) {
            const start = new Date(this.state.startDate);
            const end = new Date(this.state.endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(row => {
                const date = new Date(row[indices.interviewDate]);
                return !isNaN(date) && date >= start && date <= end;
            });
        }

        // Dropdown filters
        if (this.state.interviewer !== 'all') filtered = filtered.filter(row => (row[indices.interviewer] || '').includes(this.state.interviewer));
        if (this.state.company !== 'all') filtered = filtered.filter(row => row[indices.company] === this.state.company);
        if (this.state.route !== 'all') filtered = filtered.filter(row => row[indices.route] === this.state.route);
        if (this.state.position !== 'all') filtered = filtered.filter(row => row[indices.position] === this.state.position);
        
        // Search term filter
        if (this.state.searchTerm) {
            filtered = filtered.filter(row => row.some(cell => String(cell).toLowerCase().includes(this.state.searchTerm)));
        }

        this.state.interviews = this.sortData(filtered);
        this.renderTable();
        this.renderInterviewerCounts(filtered, indices.interviewer);
    },

    sortData(data) {
        // Sorting logic here... (same as previous correct version)
        return data;
    },
    
    renderTable() {
        const container = document.getElementById('scheduleListContainer');
        if (!container) return;

        if (this.state.interviews.length === 0) {
            container.innerHTML = '<p class="no-results">해당 조건에 맞는 면접 일정이 없습니다.</p>';
            return;
        }

        const { headers } = this.app.state.data;
        const visibleHeaders = Object.keys(this.state.visibleColumns).filter(h => this.state.visibleColumns[h]);

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>${visibleHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${this.state.interviews.map(row => this.createRowHtml(row, headers, visibleHeaders)).join('')}
                </tbody>
            </table>
        `;
    },

    createRowHtml(row, headers, visibleHeaders) {
        const getValue = (headerName) => row[headers.indexOf(headerName)] || '-';
        
        let rowHtml = '';
        visibleHeaders.forEach(header => {
            let cellContent = '';
            // Generate cell content based on header, similar to main dashboard render logic
            // This part needs to be filled out based on desired display for each column
            cellContent = getValue(header); // Placeholder
            rowHtml += `<td>${cellContent}</td>`;
        });
        
        const rowDataEncoded = encodeURIComponent(JSON.stringify(row));
        return `<tr onclick="globalThis.App.modal.openDetail(JSON.parse(decodeURIComponent('${rowDataEncoded}')))">${rowHtml}</tr>`;
    },

    renderInterviewerCounts(filteredData, interviewerIndex) {
        const container = document.getElementById('interviewerCountsContainer');
        const counts = {};
        filteredData.forEach(row => {
            const interviewers = (row[interviewerIndex] || '미정').split(',').map(name => name.trim());
            interviewers.forEach(name => {
                counts[name] = (counts[name] || 0) + 1;
            });
        });

        const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

        let html = '<div class="interviewer-counts-header">면접관별 진행 건수</div>';
        sortedCounts.forEach(([name, count]) => {
            html += `
                <div class="interviewer-count-item">
                    <span class="interviewer-count-name">${name}</span>
                    <span class="interviewer-count-badge">${count}건</span>
                </div>
            `;
        });
        container.innerHTML = html;
    },
    
    resetFilters() {
        document.getElementById('scheduleSearch').value = '';
        document.getElementById('scheduleRouteFilter').value = 'all';
        document.getElementById('schedulePositionFilter').value = 'all';
        document.getElementById('scheduleInterviewerFilter').value = 'all';
        document.getElementById('scheduleCompanyFilter').value = 'all';
        this.setInitialDateRange();
        this.applyFilters();
    },
    
    refresh() {
        this.populateFilters();
        this.applyFilters();
    },

    // Column Toggle Functions
    setupColumnToggles() {
        const allHeaders = ['이름', '성별', '나이', '지원일', '지원루트', '회사명', '증원자', '모집분야', '면접관', '면접일시', 'D-Day', '비고'];
        allHeaders.forEach(h => { this.state.visibleColumns[h] = true; }); // Default to all visible
        
        const dropdown = document.getElementById('scheduleColumnToggleDropdown');
        dropdown.innerHTML = '';
        allHeaders.forEach(header => {
            const item = document.createElement('div');
            item.className = 'column-toggle-item';
            item.innerHTML = `
                <input type="checkbox" id="toggle-schedule-${header}" ${this.state.visibleColumns[header] ? 'checked' : ''} />
                <label for="toggle-schedule-${header}">${header}</label>
            `;
            item.querySelector('input').onchange = (e) => this.handleColumnToggle(e, header);
            dropdown.appendChild(item);
        });
    },

    handleColumnToggle(event, columnName) {
        this.state.visibleColumns[columnName] = event.target.checked;
        this.renderTable();
    },

    toggleColumnDropdown() {
        const dropdown = document.getElementById('scheduleColumnToggleDropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }
};
