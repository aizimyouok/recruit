// js/interviewSchedule.js 파일의 전체 코드입니다.
// createRowHtml 함수 부분이 수정되었습니다.

const InterviewScheduleModule = {
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
        sortBy: '면접일',
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
        this.renderAdmissionSchedule(headers); // 전체 데이터에서 별도로 필터링
    },

    sortData(data) {
        const { sortOrder } = this.state;
        const { headers } = this.app.state.data;
        const interviewDateIndex = headers.indexOf('면접 날짜') !== -1 ? headers.indexOf('면접 날짜') : headers.indexOf('면접 날자');
        const interviewTimeIndex = headers.indexOf('면접 시간');

        return data.sort((a, b) => {
            const dateA = new Date(a[interviewDateIndex]);
            const dateB = new Date(b[interviewDateIndex]);

            // 유효하지 않은 날짜를 뒤로 보내는 처리
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;

            const timeAStr = a[interviewTimeIndex] || '00:00';
            const timeBStr = b[interviewTimeIndex] || '00:00';

            const timeAMatch = String(timeAStr).match(/(\d{1,2})/);
            const timeBMatch = String(timeBStr).match(/(\d{1,2})/);

            const hourA = timeAMatch ? parseInt(timeAMatch[1], 10) : 0;
            const hourB = timeBMatch ? parseInt(timeBMatch[1], 10) : 0;

            dateA.setHours(hourA, 0, 0, 0);
            dateB.setHours(hourB, 0, 0, 0);
            
            // sortOrder가 'asc'일 때 오름차순(임박한 순), 'desc'일 때 내림차순(오래된 순) 정렬
            if (sortOrder === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });
    },

    setSortBy(header) {
        if(header === '면접일' || header === '면접 시간') {
            this.state.sortBy = '면접일';
            this.state.sortOrder = this.state.sortOrder === 'asc' ? 'desc' : 'asc';
            this.applyFilters();
        }
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

    // ▼▼▼▼▼ [수정된 함수] ▼▼▼▼▼
    createRowHtml(row, headers, visibleHeaders) {
        const getValue = (headerName) => row[headers.indexOf(headerName)] || '-';

        const interviewDateIndex = headers.indexOf('면접 날짜') !== -1 ? headers.indexOf('면접 날짜') : headers.indexOf('면접 날자');
        const interviewDateStr = row[interviewDateIndex];

        let dDayHtml = '';
        let dateDisplayHtml = '';

        if (interviewDateStr) {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const iDate = new Date(interviewDateStr);

                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                const weekday = weekdays[iDate.getDay()];
                dateDisplayHtml = `${iDate.getMonth() + 1}/${iDate.getDate()}(${weekday})`;

                const iDateForDiff = new Date(interviewDateStr);
                iDateForDiff.setHours(0, 0, 0, 0);

                const diffTime = iDateForDiff.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    dDayHtml = `<span class="status-badge d-day">D-Day</span>`;
                } else if (diffDays > 0) {
                    dDayHtml = `<span class="status-badge d-upcoming">D-${diffDays}</span>`;
                }
            } catch (e) {
                dateDisplayHtml = getValue(headers[interviewDateIndex]);
            }
        }

        let rowHtml = '';
        visibleHeaders.forEach(header => {
            let cellContent = '-';
            const originalValue = getValue(header);
            
            // '비고'와 '면접리뷰' 컬럼에만 특정 클래스를 추가하기 위한 변수
            let tdClass = '';
            if (header === '비고' || header === '면접리뷰') {
                tdClass = 'class="wrap-text"';
            }

            if (header === '면접결과') {
                const value = (originalValue || '').trim();
                let statusClass = '';

                if (value === '합격') statusClass = 'interview-pass';
                else if (value === '불합격') statusClass = 'interview-fail';
                else if (value === '미참석') statusClass = 'interview-noshow';
                else if (value && value !== '-') statusClass = 'interview-other';
                
                cellContent = statusClass ? `<span class="status-badge ${statusClass}">${value}</span>` : (value || '-');

            } else {
                try {
                    if (header === '면접일') {
                        cellContent = `${dDayHtml} ${dateDisplayHtml || originalValue}`;
                    } else if (header === '지원일') {
                        if (originalValue && originalValue !== '-') {
                            const date = new Date(originalValue);
                            cellContent = `${date.getFullYear().toString().slice(-2)}/${date.getMonth() + 1}/${date.getDate()}`;
                        } else {
                            cellContent = '-';
                        }
                    } else if (header === '면접 시간') {
                        cellContent = this.app.utils.formatInterviewTime(originalValue);
                    } else {
                        cellContent = originalValue;
                    }
                } catch (e) {
                    cellContent = originalValue;
                }
            }
            // td 태그에 클래스를 포함하여 생성
            rowHtml += `<td ${tdClass} title="${String(originalValue || '').replace(/<[^>]*>/g, '')}">${cellContent}</td>`;
        });

        const rowDataEncoded = encodeURIComponent(JSON.stringify(row));
        return `<tr onclick="globalThis.App.modal.openDetail(JSON.parse(decodeURIComponent('${rowDataEncoded}')))">${rowHtml}</tr>`;
    },
    // ▲▲▲▲▲ [수정된 함수] ▲▲▲▲▲

    renderAdmissionSchedule(headers) {
        const container = document.getElementById('admissionScheduleContainer');
        if (!container) return;

        container.innerHTML = '';

        const { all } = this.app.state.data;
        const indices = {
            name: headers.indexOf('이름'),
            interviewResult: headers.indexOf('면접결과'),
            admissionDate: headers.indexOf('입과일'),
            interviewer: headers.indexOf('면접관'),
            company: headers.indexOf('회사명'),
            route: headers.indexOf('지원루트'),
            position: headers.indexOf('모집분야')
        };

        // 전체 데이터에서 면접결과가 '합격'이고 입과일이 있는 사람들 필터링
        let admissionCandidates = all.filter(row => {
            const interviewResult = (row[indices.interviewResult] || '').trim();
            const admissionDate = (row[indices.admissionDate] || '').trim();
            return interviewResult === '합격' && admissionDate;
        });

        // 입과일 기준으로 날짜 필터링 적용
        if (this.state.dateMode !== 'all') {
            admissionCandidates = admissionCandidates.filter(row => {
                const admissionDateStr = row[indices.admissionDate];
                if (!admissionDateStr) return false;

                try {
                    const admissionDate = this.formatDateForInput(new Date(admissionDateStr));

                    switch (this.state.dateMode) {
                        case 'year':
                            return admissionDate.startsWith(this.state.dateValue);
                        case 'month':
                            return admissionDate.substring(0, 7) === this.state.dateValue;
                        case 'day':
                             return admissionDate === this.state.dateValue;
                        case 'range':
                             if (!this.state.startDate || !this.state.endDate) return true;
                             return admissionDate >= this.state.startDate && admissionDate <= this.state.endDate;
                    }
                } catch {
                    return false;
                }
                return true;
            });
        }

        // 다른 필터 조건들 적용 (면접관, 회사명, 지원루트, 모집분야, 검색어)
        if (this.state.interviewer !== 'all') admissionCandidates = admissionCandidates.filter(row => (row[indices.interviewer] || '').includes(this.state.interviewer));
        if (this.state.company !== 'all') admissionCandidates = admissionCandidates.filter(row => row[indices.company] === this.state.company);
        if (this.state.route !== 'all') admissionCandidates = admissionCandidates.filter(row => row[indices.route] === this.state.route);
        if (this.state.position !== 'all') admissionCandidates = admissionCandidates.filter(row => row[indices.position] === this.state.position);
        if (this.state.searchTerm) {
            admissionCandidates = admissionCandidates.filter(row => row.some(cell => String(cell).toLowerCase().includes(this.state.searchTerm)));
        }

        // 입과일별로 그룹핑
        const admissionGroups = {};
        let totalCount = 0;

        admissionCandidates.forEach(row => {
            const admissionDate = row[indices.admissionDate];
            const name = row[indices.name] || '이름 없음';
            
            if (admissionDate) {
                if (!admissionGroups[admissionDate]) {
                    admissionGroups[admissionDate] = [];
                }
                admissionGroups[admissionDate].push(name);
                totalCount++;
            }
        });

        // 헤더 생성
        const header = document.createElement('div');
        header.className = 'admission-summary-header';
        header.innerHTML = `
            <span><i class="fas fa-graduation-cap"></i> 입과 일정</span>
            <span class="total-count">총 <span class="badge">${totalCount}명</span></span>
        `;
        container.appendChild(header);

        // 입과일별 그룹 생성
        const list = document.createElement('div');
        list.className = 'admission-summary-list';

        if (Object.keys(admissionGroups).length > 0) {
            // 날짜 정렬 (오름차순)
            const sortedDates = Object.keys(admissionGroups).sort((a, b) => {
                try {
                    return new Date(a) - new Date(b);
                } catch {
                    return a.localeCompare(b);
                }
            });

            sortedDates.forEach(date => {
                const names = admissionGroups[date];
                const count = names.length;
                
                // 날짜 포맷팅
                let formattedDate = date;
                try {
                    const dateObj = new Date(date);
                    const month = dateObj.getMonth() + 1;
                    const day = dateObj.getDate();
                    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                    const weekday = weekdays[dateObj.getDay()];
                    formattedDate = `${month}/${day}(${weekday})`;
                } catch {
                    // 날짜 파싱 실패 시 원래 값 사용
                }

                const group = document.createElement('div');
                group.className = 'admission-date-group';
                group.innerHTML = `
                    <div class="admission-date-header">
                        <div class="admission-date-title">
                            <i class="fas fa-calendar-day" style="color: #3b82f6;"></i>
                            ${formattedDate}
                        </div>
                        <span class="admission-count-badge">${count}명</span>
                    </div>
                    <div class="admission-names-list">${names.join(', ')}</div>
                `;
                list.appendChild(group);
            });
        } else {
            list.innerHTML = '<div style="text-align:center; font-size: 0.9rem; color: var(--text-secondary); padding: 20px; width: 100%;">입과 예정자가 없습니다</div>';
        }

        container.appendChild(list);
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
            <span><i class="fas fa-user-tie"></i> 면접 일정</span>
            <span class="total-count">총 <span class="badge">${totalCount}건</span></span>
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
            list.innerHTML = '<div style="text-align:center; font-size: 0.9rem; color: var(--text-secondary); padding: 10px;">데이터 없음</div>';
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
        const allHeaders = ['이름', '지원일', '지원루트', '회사명', '모집분야', '증원자', '면접관', '면접일', '면접 시간', '비고', '면접결과', '면접리뷰'];
        
        this.state.visibleColumns = {};
        allHeaders.forEach(h => {
            this.state.visibleColumns[h] = true;
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
