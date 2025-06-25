// =================================
// js/interviewSchedule.js - 면접 일정 페이지 모듈 (최종 수정 버전)
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
        sortBy: '면접일', // 기본 정렬 기준
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

        const columnToggleBtn = document.getElementById('scheduleColumnToggleBtn');
        if (columnToggleBtn) {
            columnToggleBtn.onclick = () => this.toggleColumnDropdown();
        }
    },

    populateFilters() {
        if (!this.app || !this.app.state.data.all.length) return;

        const { headers, all } = this.app.state.data;
        const indices = {
            interviewer: headers.indexOf('면접관'),
            company: headers.indexOf('회사명'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야')
        };

        const populate = (selector, index) => {
            const selectElement = document.getElementById(selector);
            if (selectElement && index !== -1) {
                const options = [...new Set(all.map(row => (row[index] || '').trim()).filter(Boolean))];
                selectElement.innerHTML = `<option value="all">전체</option>`;
                options.sort().forEach(name => {
                    selectElement.innerHTML += `<option value="${name}">${name}</option>`;
                });
            }
        };

        populate('scheduleInterviewerFilter', indices.interviewer);
        populate('scheduleCompanyFilter', indices.company);
        populate('scheduleRouteFilter', indices.route);
        populate('schedulePositionFilter', indices.position);
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
        if (!container) return;

        let html = `
            <div id="scheduleDateModeToggle" class="date-mode-toggle-group">
                <button class="date-mode-btn ${this.state.dateMode === 'all' ? 'active' : ''}" data-mode="all">전체</button>
                <button class="date-mode-btn ${this.state.dateMode === 'year' ? 'active' : ''}" data-mode="year">연</button>
                <button class="date-mode-btn ${this.state.dateMode === 'month' ? 'active' : ''}" data-mode="month">월</button>
                <button class="date-mode-btn ${this.state.dateMode === 'day' ? 'active' : ''}" data-mode="day">일</button>
                <button class="date-mode-btn ${this.state.dateMode === 'range' ? 'active' : ''}" data-mode="range">기간</button>
            </div>
            <div id="scheduleDateInputsContainer" class="date-inputs-group"></div>
        `;
        container.innerHTML = html;

        this.updateDateInputs();

        const toggleGroup = container.querySelector('#scheduleDateModeToggle');
        if(toggleGroup) {
            toggleGroup.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    this.state.dateMode = e.target.dataset.mode;
                    if (['year', 'month', 'day'].includes(this.state.dateMode)) {
                        this.state.dateValue = ''; 
                    }
                    this.updateDateFilterUI();
                    this.applyFilters();
                }
            });
        }
    },

    updateDateInputs() {
        const container = document.getElementById('scheduleDateInputsContainer');
        if (!container) return;

        let html = '';
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');

        const handleInputChange = (e) => {
            if (e.target.value) {
                this.state.dateValue = e.target.value;
                this.applyFilters();
            }
        };

        switch(this.state.dateMode) {
            case 'year':
                html = `<input type="number" class="date-input" id="scheduleDateValue" value="${this.state.dateValue || year}">`;
                break;
            case 'month':
                html = `<input type="month" class="date-input" id="scheduleDateValue" value="${this.state.dateValue || `${year}-${month}`}">`;
                break;
            case 'day':
                html = `<input type="date" class="date-input" id="scheduleDateValue" value="${this.state.dateValue || `${year}-${month}-${day}`}">`;
                break;
            case 'range':
                html = `
                    <input type="date" class="date-input" id="scheduleStartDate" value="${this.state.startDate}" onchange="globalThis.App.interviewSchedule.applyFilters()">
                    <span style="margin: 0 5px;">-</span>
                    <input type="date" class="date-input" id="scheduleEndDate" value="${this.state.endDate}" onchange="globalThis.App.interviewSchedule.applyFilters()">
                `;
                break;
            case 'all':
            default:
                html = `<span style="padding: 0 10px; color: var(--text-secondary);">전체 기간</span>`;
                break;
        }
        container.innerHTML = html;

        if (this.state.dateMode !== 'range' && this.state.dateMode !== 'all') {
             const input = container.querySelector('#scheduleDateValue');
             if (input) input.addEventListener('change', handleInputChange);
        }
    },

    applyFilters() {
        if (!this.app) return;

        this.state.interviewer = document.getElementById('scheduleInterviewerFilter')?.value || 'all';
        this.state.company = document.getElementById('scheduleCompanyFilter')?.value || 'all';
        this.state.route = document.getElementById('scheduleRouteFilter')?.value || 'all';
        this.state.position = document.getElementById('schedulePositionFilter')?.value || 'all';
        this.state.searchTerm = (document.getElementById('scheduleSearch')?.value || '').toLowerCase();
        
        if (this.state.dateMode === 'range') {
            this.state.startDate = document.getElementById('scheduleStartDate')?.value || '';
            this.state.endDate = document.getElementById('scheduleEndDate')?.value || '';
        } else if (this.state.dateMode !== 'all') {
            this.state.dateValue = document.getElementById('scheduleDateValue')?.value || '';
        }

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
        
        // ★★★ 조회 기간 필터 로직 수정 ★★★
        if (this.state.dateMode !== 'all') {
            filtered = filtered.filter(row => {
                const dateStr = row[indices.interviewDate];
                if (!dateStr) return false;

                try {
                    const interviewDate = this.formatDateForInput(new Date(dateStr));
                    
                    switch (this.state.dateMode) {
                        case 'year':
                            return interviewDate.startsWith(this.state.dateValue);
                        case 'month':
                            return interviewDate.substring(0, 7) === this.state.dateValue;
                        case 'day':
                             return interviewDate === this.state.dateValue;
                        case 'range':
                             if (!this.state.startDate || !this.state.endDate) return true;
                             return interviewDate >= this.state.startDate && interviewDate <= this.state.endDate;
                    }
                } catch {
                    return false;
                }
                return true;
            });
        }
        
        if (this.state.interviewer !== 'all') filtered = filtered.filter(row => (row[indices.interviewer] || '').includes(this.state.interviewer));
        if (this.state.company !== 'all') filtered = filtered.filter(row => row[indices.company] === this.state.company);
        if (this.state.route !== 'all') filtered = filtered.filter(row => row[indices.route] === this.state.route);
        if (this.state.position !== 'all') filtered = filtered.filter(row => row[indices.position] === this.state.position);
        if (this.state.searchTerm) {
            filtered = filtered.filter(row => row.some(cell => String(cell).toLowerCase().includes(this.state.searchTerm)));
        }

        this.state.interviews = this.sortData(filtered);
        this.renderTable();
        this.renderInterviewerCounts(filtered, indices.interviewer);
    },

    sortData(data) {
        const { sortBy, sortOrder } = this.state;
        if (!sortBy) return data;

        const { headers } = this.app.state.data;
        const interviewDateIndex = headers.indexOf('면접 날짜') !== -1 ? headers.indexOf('면접 날짜') : headers.indexOf('면접 날자');
        const interviewTimeIndex = headers.indexOf('면접 시간');

        const getSortableValue = (row) => {
            const dateStr = row[interviewDateIndex];
            if (!dateStr) return null;
            
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return null;

                const timeStr = row[interviewTimeIndex] || '';
                const timeMatch = String(timeStr).replace(/'/g, '').trim().match(/(\d{1,2})[시:]?\s*(\d{0,2})/);
                if (timeMatch) {
                    const hour = parseInt(timeMatch[1], 10);
                    const minute = parseInt(timeMatch[2] || '0', 10);
                    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                        date.setHours(hour, minute, 0, 0);
                    }
                }
                return date;
            } catch (e) {
                return null;
            }
        };

        return data.sort((a, b) => {
            const valA = getSortableValue(a);
            const valB = getSortableValue(b);

            if (valA === null) return 1;
            if (valB === null) return -1;

            const order = sortOrder === 'asc' ? 1 : -1;
            return (valA - valB) * order;
        });
    },
    
    setSortBy(header) {
        // 정렬은 항상 면접일+시간 기준으로 하므로 이 함수는 현재 사용되지 않음.
        // 헤더 클릭 시 정렬 방향만 변경하도록 단순화 가능
        this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
        this.applyFilters();
    },
    
    renderTable() {
        const container = document.getElementById('scheduleListContainer');
        if (!container) return;

        if (this.state.interviews.length === 0) {
            container.innerHTML = '<p class="no-results" style="text-align:center; padding: 40px; color: var(--text-secondary);">해당 조건에 맞는 면접 일정이 없습니다.</p>';
            return;
        }

        const { headers } = this.app.state.data;
        const visibleHeaders = Object.keys(this.state.visibleColumns).filter(h => this.state.visibleColumns[h]);

        const createHeaderHtml = (header) => {
            let sortIcon = '';
            // 정렬은 항상 면접일 기준이므로, 해당 컬럼에만 정렬 아이콘 표시
            if (header === '면접일') {
                const iconClass = this.state.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
                sortIcon = `<i class="fas ${iconClass} sort-icon active"></i>`;
            }
            return `<th onclick="globalThis.App.interviewSchedule.setSortBy('${header}')">${header} ${sortIcon}</th>`;
        };

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>${visibleHeaders.map(h => createHeaderHtml(h)).join('')}</tr>
                </thead>
                <tbody>
                    ${this.state.interviews.map(row => this.createRowHtml(row, headers, visibleHeaders)).join('')}
                </tbody>
            </table>
        `;
    },

    createRowHtml(row, headers, visibleHeaders) {
        const getValue = (headerName) => row[headers.indexOf(headerName)] || '-';
        
        const interviewDateIndex = headers.indexOf('면접 날짜') !== -1 ? headers.indexOf('면접 날짜') : headers.indexOf('면접 날자');
        const interviewDateStr = row[interviewDateIndex];

        let dDayContent = '';
        if (interviewDateStr) {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const iDate = new Date(interviewDateStr);
                iDate.setHours(0, 0, 0, 0);
                const diffTime = iDate.getTime() - today.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) {
                    dDayContent = `<span class="status-badge" style="background-color: var(--danger); margin-right: 8px;">D-Day</span>`;
                } else if (diffDays > 0) {
                    const ddayClass = diffDays <= 3 ? "status-면접확정" : "";
                    dDayContent = `<span class="status-badge ${ddayClass}" style="margin-right: 8px;">D-${diffDays}</span>`;
                }
            } catch (e) { /* D-Day 계산 실패 시 아무것도 표시 안함 */ }
        }

        let rowHtml = '';
        visibleHeaders.forEach(header => {
            let cellContent = '-';
            try {
                if (header === '면접일') {
                    cellContent = dDayContent + this.app.utils.formatDate(getValue(header));
                } else if (header === '시간') {
                    cellContent = this.app.utils.formatInterviewTime(getValue(header)).replace(/'/g, '');
                } else if (header === '지원일') {
                     cellContent = this.app.utils.formatDate(getValue(header));
                } else {
                    cellContent = getValue(header);
                }
            } catch (e) {
                cellContent = "오류";
            }
            rowHtml += `<td>${cellContent}</td>`;
        });
        
        const rowDataEncoded = encodeURIComponent(JSON.stringify(row));
        return `<tr onclick="globalThis.App.modal.openDetail(JSON.parse(decodeURIComponent('${rowDataEncoded}')))">${rowHtml}</tr>`;
    },

    renderInterviewerCounts(filteredData, interviewerIndex) {
        const container = document.getElementById('interviewerCountsContainer');
        if (!container || interviewerIndex === -1) return;
        
        container.innerHTML = ''; 
        
        const counts = {};
        let totalCount = 0;
        filteredData.forEach(row => {
            const interviewers = (row[interviewerIndex] || '미정').split(',').map(name => name.trim());
            interviewers.forEach(name => {
                if(name) {
                    counts[name] = (counts[name] || 0) + 1;
                    totalCount++;
                }
            });
        });

        const header = document.createElement('div');
        header.className = 'interviewer-summary-header';
        header.innerHTML = `
            <span><i class="fas fa-user-tie"></i> 면접관별 진행 건수</span>
            <span class="total-count">총 <span class="badge">${totalCount}</span></span>
        `;
        container.appendChild(header);

        const list = document.createElement('div');
        list.className = 'interviewer-summary-list';

        const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

        if (sortedCounts.length > 0) {
            sortedCounts.forEach(([name, count]) => {
                const item = document.createElement('div');
                item.className = 'interviewer-summary-item';
                item.innerHTML = `
                    <span class="interviewer-summary-name">${name}</span>
                    <span class="interviewer-summary-badge">${count}건</span>
                `;
                list.appendChild(item);
            });
        } else {
            list.innerHTML = '<div style="text-align:center; font-size: 0.85rem; color: var(--text-secondary); padding: 10px;">데이터 없음</div>';
        }
        container.appendChild(list);
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

    setupColumnToggles() {
        // ★★★ 컬럼 순서 변경 및 D-Day 컬럼 제거 ★★★
        const allHeaders = ['이름', '지원일', '지원루트', '회사명', '모집분야', '면접관', '면접일', '시간', '비고'];
        
        this.state.visibleColumns = {};
        allHeaders.forEach(h => {
            this.state.visibleColumns[h] = true; // '지원일' 포함 모든 컬럼을 기본으로 보이도록 변경
        }); 
        
        const dropdown = document.getElementById('scheduleColumnToggleDropdown');
        if (!dropdown) return;
        
        dropdown.innerHTML = '';
        allHeaders.forEach(header => {
            const item = document.createElement('div');
            item.className = 'column-toggle-item';
            item.innerHTML = `
                <input type="checkbox" id="toggle-schedule-${header.replace(/\s/g, '-')}" ${this.state.visibleColumns[header] ? 'checked' : ''} />
                <label for="toggle-schedule-${header.replace(/\s/g, '-')}">${header}</label>
            `;
            const input = item.querySelector('input');
            if (input) {
                input.onchange = (e) => this.handleColumnToggle(e, header);
            }
            dropdown.appendChild(item);
        });
    },

    handleColumnToggle(event, columnName) {
        this.state.visibleColumns[columnName] = event.target.checked;
        this.renderTable();
    },

    toggleColumnDropdown() {
        const dropdown = document.getElementById('scheduleColumnToggleDropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    }
};
