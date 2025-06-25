// =================================
// js/interviewSchedule.js - 면접 일정 페이지 모듈 (오류 수정 버전)
// =================================

export const InterviewScheduleModule = {
    // 페이지 상태 관리
    state: {
        interviewer: 'all',
        company: 'all',
        startDate: '',
        endDate: '',
        sortBy: 'interviewDate',
        sortOrder: 'asc',
        interviews: []
    },

    // 페이지 초기화
    initialize(appInstance) {
        console.log('📅 면접일정 페이지 초기화 시작');
        this.app = appInstance; // App 인스턴스 참조 저장
        this.populateFilters();
        this.setInitialDateRange();
        this.applyFilters();
    },

    // 필터 옵션 채우기 (면접관, 회사명)
    populateFilters() {
        if (!this.app || !this.app.state.data.all.length) {
            console.warn('데이터가 없어 필터를 채울 수 없습니다.');
            return;
        }

        const { headers, all } = this.app.state.data;
        const interviewerIndex = headers.indexOf('면접관');
        const companyIndex = headers.indexOf('회사명');

        if (interviewerIndex === -1) console.warn('면접관 컬럼을 찾을 수 없습니다.');
        if (companyIndex === -1) console.warn('회사명 컬럼을 찾을 수 없습니다.');

        const interviewers = [...new Set(all.map(row => row[interviewerIndex]).filter(Boolean))];
        const companies = [...new Set(all.map(row => row[companyIndex]).filter(Boolean))];

        const interviewerFilter = document.getElementById('scheduleInterviewerFilter');
        const companyFilter = document.getElementById('scheduleCompanyFilter');

        if (!interviewerFilter || !companyFilter) return;

        interviewerFilter.innerHTML = '<option value="all">전체 면접관</option>';
        companyFilter.innerHTML = '<option value="all">전체 회사</option>';

        interviewers.sort().forEach(name => {
            interviewerFilter.innerHTML += `<option value="${name}">${name}</option>`;
        });
        companies.sort().forEach(name => {
            companyFilter.innerHTML += `<option value="${name}">${name}</option>`;
        });
    },
    
    // 초기 날짜 범위 설정 (오늘 ~ 한달 뒤)
    setInitialDateRange() {
        const startDateInput = document.getElementById('scheduleStartDate');
        const endDateInput = document.getElementById('scheduleEndDate');
        
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        this.state.startDate = formatDate(today);
        this.state.endDate = formatDate(oneMonthLater);

        if (startDateInput) startDateInput.value = this.state.startDate;
        if (endDateInput) endDateInput.value = this.state.endDate;
    },

    // 모든 필터를 적용하여 데이터 처리 및 렌더링
    applyFilters() {
        if (!this.app) return;

        this.state.interviewer = document.getElementById('scheduleInterviewerFilter').value;
        this.state.company = document.getElementById('scheduleCompanyFilter').value;
        this.state.startDate = document.getElementById('scheduleStartDate').value;
        this.state.endDate = document.getElementById('scheduleEndDate').value;

        const { headers, all } = this.app.state.data;
        const contactResultIndex = headers.indexOf('1차 컨택 결과');
        let interviewDateIndex = headers.indexOf('면접 날짜');
        if (interviewDateIndex === -1) interviewDateIndex = headers.indexOf('면접 날자');

        if (contactResultIndex === -1 || interviewDateIndex === -1) {
            console.error("'1차 컨택 결과' 또는 '면접 날짜' 컬럼이 시트에 없습니다.");
            this.renderTable();
            return;
        }

        let filteredInterviews = all.filter(row => {
            const contactResult = (row[contactResultIndex] || '').trim();
            const interviewDate = (row[interviewDateIndex] || '').trim();
            return contactResult === '면접확정' && interviewDate;
        });

        if (this.state.startDate && this.state.endDate) {
            try {
                const start = new Date(this.state.startDate);
                const end = new Date(this.state.endDate);
                if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new Error("Invalid Date");
                
                end.setHours(23, 59, 59, 999);

                filteredInterviews = filteredInterviews.filter(row => {
                    try {
                        const date = new Date(row[interviewDateIndex]);
                        if(isNaN(date.getTime())) return false;
                        return date >= start && date <= end;
                    } catch {
                        return false;
                    }
                });
            } catch (e) {
                console.error("날짜 필터링 오류:", e);
            }
        }
        
        if (this.state.interviewer !== 'all') {
            const interviewerIndex = headers.indexOf('면접관');
            filteredInterviews = filteredInterviews.filter(row => (row[interviewerIndex] || '').includes(this.state.interviewer));
        }

        if (this.state.company !== 'all') {
            const companyIndex = headers.indexOf('회사명');
            filteredInterviews = filteredInterviews.filter(row => row[companyIndex] === this.state.company);
        }

        this.state.interviews = this.sortData(filteredInterviews);
        this.renderTable();
    },

    // 데이터 정렬
    sortData(data) {
        const { headers } = this.app.state.data;
        let sortKeyIndex = headers.indexOf(this.state.sortBy === 'interviewDate' ? '면접 날짜' : this.state.sortBy);
        if (sortKeyIndex === -1) sortKeyIndex = headers.indexOf('면접 날자');
        
        const timeIndex = headers.indexOf('면접 시간');

        return data.sort((a, b) => {
            let valA = a[sortKeyIndex];
            let valB = b[sortKeyIndex];

            if (this.state.sortBy === 'interviewDate') {
                const dateA = new Date(valA || '9999-12-31');
                const dateB = new Date(valB || '9999-12-31');

                const timeA = String(a[timeIndex] || '').match(/(\d+)/);
                const timeB = String(b[timeIndex] || '').match(/(\d+)/);

                if (timeA) dateA.setHours(parseInt(timeA[0], 10), parseInt(String(a[timeIndex] || '').slice(-2),10) || 0);
                if (timeB) dateB.setHours(parseInt(timeB[0], 10), parseInt(String(b[timeIndex] || '').slice(-2),10) || 0);
                
                valA = dateA;
                valB = dateB;
            }

            if (valA < valB) return this.state.sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return this.state.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    },
    
    // 테이블 렌더링
    renderTable() {
        const container = document.getElementById('scheduleListContainer');
        if (!container) return;

        if (!this.state.interviews || this.state.interviews.length === 0) {
            container.innerHTML = '<p class="no-results">해당 조건에 맞는 면접 일정이 없습니다.</p>';
            return;
        }

        const { headers } = this.app.state.data;
        const visibleHeaders = ['면접일시', 'D-Day', '지원자', '모집분야', '지원루트', '회사명', '면접관'];

        let tableHtml = `
            <table class="data-table">
                <thead>
                    <tr>
                        ${visibleHeaders.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${this.state.interviews.map(row => this.createRowHtml(row, headers)).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = tableHtml;
    },

    // 테이블 행 HTML 생성
    createRowHtml(row, headers) {
        const getValue = (headerName) => row[headers.indexOf(headerName)] || '-';

        let interviewDateStr = getValue('면접 날짜') || getValue('면접 날자');
        const interviewTimeStr = getValue('면접 시간');
        const applicantName = getValue('이름');
        
        const date = new Date(interviewDateStr);
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}(${weekdays[date.getDay()]})`;
        const formattedDateTime = `${formattedDate} ${interviewTimeStr}`;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const interviewDay = new Date(interviewDateStr);
        interviewDay.setHours(0, 0, 0, 0);
        const diffTime = interviewDay.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let dDayBadge;
        if (diffDays < 0) {
            dDayBadge = `<span class="d-day-badge d-past">종료</span>`;
        } else if (diffDays === 0) {
            dDayBadge = `<span class="d-day-badge d-day">D-Day</span>`;
        } else if (diffDays === 1) {
            dDayBadge = `<span class="d-day-badge d-1">D-1</span>`;
        } else {
            dDayBadge = `<span class="d-day-badge d-future">D-${diffDays}</span>`;
        }
        
        const interviewers = getValue('면접관').split(',').map(name => name.trim()).filter(Boolean);
        const interviewerTags = interviewers.map(name => `<span class="interviewer-tag">${name}</span>`).join('');

        // 행 클릭 시 상세 모달을 열기 위해 row 데이터를 인코딩하여 저장
        const rowDataEncoded = encodeURIComponent(JSON.stringify(row));

        return `
            <tr onclick="globalThis.App.modal.openDetail(JSON.parse(decodeURIComponent('${rowDataEncoded}')))">
                <td>${formattedDateTime}</td>
                <td>${dDayBadge}</td>
                <td>${applicantName}</td>
                <td>${getValue('모집분야')}</td>
                <td>${getValue('지원루트')}</td>
                <td>${getValue('회사명')}</td>
                <td class="interviewer-cell">${interviewerTags}</td>
            </tr>
        `;
    },
    
    // 필터 초기화
    resetFilters() {
        document.getElementById('scheduleInterviewerFilter').value = 'all';
        document.getElementById('scheduleCompanyFilter').value = 'all';
        this.setInitialDateRange();
        this.applyFilters();
    },
    
    // 페이지 새로고침(데이터 업데이트)
    refresh() {
        this.populateFilters();
        this.applyFilters();
    }
};
