// =================================
// js/interviewSchedule.js - 면접 일정 페이지 모듈
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
        this.app = appInstance;
        this.populateFilters();
        this.setInitialDateRange();
        this.applyFilters();
    },

    // 필터 옵션 채우기 (면접관, 회사명)
    populateFilters() {
        const { headers, all } = this.app.state.data;
        const interviewerIndex = headers.indexOf('면접관');
        const companyIndex = headers.indexOf('회사명');

        if (interviewerIndex === -1 || companyIndex === -1) {
            console.warn('면접관 또는 회사명 컬럼을 찾을 수 없습니다.');
            return;
        }

        // 중복 없이 면접관, 회사명 목록 추출
        const interviewers = [...new Set(all.map(row => row[interviewerIndex]).filter(Boolean))];
        const companies = [...new Set(all.map(row => row[companyIndex]).filter(Boolean))];

        const interviewerFilter = document.getElementById('scheduleInterviewerFilter');
        const companyFilter = document.getElementById('scheduleCompanyFilter');

        // 기존 옵션 초기화 후 '전체' 옵션 추가
        interviewerFilter.innerHTML = '<option value="all">전체 면접관</option>';
        companyFilter.innerHTML = '<option value="all">전체 회사</option>';

        // 옵션 추가
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

        // yyyy-mm-dd 형식으로 변환
        const formatDate = (date) => date.toISOString().split('T')[0];

        this.state.startDate = formatDate(today);
        this.state.endDate = formatDate(oneMonthLater);

        if (startDateInput) startDateInput.value = this.state.startDate;
        if (endDateInput) endDateInput.value = this.state.endDate;
    },

    // 모든 필터를 적용하여 데이터 처리 및 렌더링
    applyFilters() {
        // 1. 현재 필터 상태 업데이트
        this.state.interviewer = document.getElementById('scheduleInterviewerFilter').value;
        this.state.company = document.getElementById('scheduleCompanyFilter').value;
        this.state.startDate = document.getElementById('scheduleStartDate').value;
        this.state.endDate = document.getElementById('scheduleEndDate').value;

        // 2. 원본 데이터에서 면접 확정 건만 필터링
        const { headers, all } = this.app.state.data;
        const contactResultIndex = headers.indexOf('1차 컨택 결과');
        let interviewDateIndex = headers.indexOf('면접 날짜');
        if (interviewDateIndex === -1) interviewDateIndex = headers.indexOf('면접 날자');

        let filteredInterviews = all.filter(row => {
            const contactResult = row[contactResultIndex];
            const interviewDate = row[interviewDateIndex];
            return contactResult === '면접확정' && interviewDate;
        });

        // 3. 각 필터 조건 적용
        // 기간 필터
        if (this.state.startDate && this.state.endDate) {
            const start = new Date(this.state.startDate);
            const end = new Date(this.state.endDate);
            end.setHours(23, 59, 59, 999); // 종료일을 포함시키기 위해

            filteredInterviews = filteredInterviews.filter(row => {
                const date = new Date(row[interviewDateIndex]);
                return date >= start && date <= end;
            });
        }
        
        // 면접관 필터
        if (this.state.interviewer !== 'all') {
            const interviewerIndex = headers.indexOf('면접관');
            filteredInterviews = filteredInterviews.filter(row => row[interviewerIndex] === this.state.interviewer);
        }

        // 회사명 필터
        if (this.state.company !== 'all') {
            const companyIndex = headers.indexOf('회사명');
            filteredInterviews = filteredInterviews.filter(row => row[companyIndex] === this.state.company);
        }

        // 4. 정렬
        this.state.interviews = this.sortData(filteredInterviews);
        
        // 5. 화면 렌더링
        this.renderTable();
    },

    // 데이터 정렬
    sortData(data) {
        const { headers } = this.app.state.data;
        let sortKeyIndex;
        
        if (this.state.sortBy === 'interviewDate') {
            sortKeyIndex = headers.indexOf('면접 날짜');
            if (sortKeyIndex === -1) sortKeyIndex = headers.indexOf('면접 날자');
        } else {
            sortKeyIndex = headers.indexOf(this.state.sortBy);
        }
        
        const timeIndex = headers.indexOf('면접 시간');

        return data.sort((a, b) => {
            let valA = a[sortKeyIndex];
            let valB = b[sortKeyIndex];

            // 면접 날짜 정렬 시 시간까지 고려
            if (this.state.sortBy === 'interviewDate') {
                const dateA = new Date(valA);
                const dateB = new Date(valB);

                const timeA = String(a[timeIndex] || '').match(/(\d+)/);
                const timeB = String(b[timeIndex] || '').match(/(\d+)/);

                if (timeA) dateA.setHours(parseInt(timeA[0], 10));
                if (timeB) dateB.setHours(parseInt(timeB[0], 10));
                
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

        if (this.state.interviews.length === 0) {
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
        const formattedDate = `${date.getMonth() + 1}.${date.getDate()}(${weekdays[date.getDay()]})`;
        const formattedDateTime = `${formattedDate} ${interviewTimeStr}`;

        // D-Day 계산
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
        
        // 면접관 태그
        const interviewers = getValue('면접관').split(',').map(name => name.trim()).filter(Boolean);
        const interviewerTags = interviewers.map(name => `<span class="interviewer-tag">${name}</span>`).join('');

        return `
            <tr onclick="globalThis.App.modal.openDetail(JSON.parse(decodeURIComponent('${encodeURIComponent(JSON.stringify(row))}')))">
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
