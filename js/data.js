// =========================
// data.js - 데이터 관련 모듈 (리포트 페이지 연동 최종 버전)
// =========================

const DataModule = {
    async fetch(appInstance) {
        if (appInstance.dataCache) {
            const loadedFromCache = await appInstance.dataCache.loadFromCache(appInstance);
            if (loadedFromCache) {
                console.log('✅ 캐시에서 로딩 완료 - 서버 호출 생략');
                // ▼▼▼▼▼ [수정된 부분] 캐시 로딩 후에도 리포트 필터 채우기 ▼▼▼▼▼
                if (appInstance.navigation.getCurrentPage() === 'report' && appInstance.report) {
                    appInstance.report.populateFilters();
                }
                // ▲▲▲▲▲ [수정된 부분] 끝 ▲▲▲▲▲
                return;
            }
        }
        const tableContainer = document.querySelector('#dashboard .table-container');

        try {
            if (tableContainer) {
                appInstance.ui.showLoadingState(tableContainer);
            }

            const response = await fetch(`${appInstance.config.APPS_SCRIPT_URL}?action=read`);

            if (tableContainer) {
                appInstance.ui.updateProgress(tableContainer, 60, '데이터 처리중...');
            }

            if (!response.ok) {
                throw new Error(appInstance.utils.getErrorMessage(response.status));
            }

            const result = await response.json();

            if (tableContainer) {
                appInstance.ui.updateProgress(tableContainer, 85, '최종 처리중...');
            }

            if (result.status !== 'success') {
                throw new Error(result.message || '데이터 처리 중 오류가 발생했습니다.');
            }

            if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
                throw new Error('데이터가 비어있거나 올바르지 않은 형식입니다.');
            }

            appInstance.state.data.headers = (result.data[0] || []).map(h => String(h || '').trim());
            appInstance.state.data.all = result.data.slice(1)
                .filter(row => row && Array.isArray(row) && row.some(cell => cell != null && String(cell).trim() !== ''))
                .map(row => row.map(cell => cell == null ? '' : String(cell)));
 
            if (appInstance.dataCache) {
                appInstance.dataCache.saveToCache(appInstance.state.data.headers, appInstance.state.data.all);
            }

            DataModule.updateSequenceNumber(appInstance);
            appInstance.state.ui.visibleColumns = appInstance.utils.generateVisibleColumns(appInstance.state.data.headers);

            if (appInstance.filter && appInstance.filter.populateDropdowns) {
                appInstance.filter.populateDropdowns();
            }

            if (appInstance.sidebar && appInstance.sidebar.updateWidgets) {
                appInstance.sidebar.updateWidgets();
            }

            DataModule.updateInterviewSchedule(appInstance);

            if (appInstance.filter && appInstance.filter.reset) {
                appInstance.filter.reset(true);
            }

            setTimeout(() => {
                if (appInstance.ui && appInstance.ui.setupColumnToggles) {
                    appInstance.ui.setupColumnToggles();
                }
                
                if (appInstance.render && appInstance.state.data.all.length > 0) {
                    appInstance.render.currentView();
                }
            }, 50);

            if (tableContainer) {
                appInstance.ui.updateProgress(tableContainer, 100, '완료!');
            }

            setTimeout(() => {
                if (appInstance.sidebar && appInstance.sidebar.updateWidgets) {
                    appInstance.sidebar.updateWidgets();
                }
            }, 500);

            if (appInstance.cache) {
                appInstance.cache.invalidate();
                console.log('🔄 새 데이터 로드 - 캐시 초기화됨');
            }

            // ▼▼▼▼▼ [수정된 부분] fetch 성공 후, 리포트 페이지 필터 채우기 로직 추가 ▼▼▼▼▼
            // 데이터 로드가 성공적으로 완료된 후, 현재 페이지가 리포트 페이지인지 확인합니다.
            if (appInstance.navigation.getCurrentPage() === 'report' && appInstance.report) {
                console.log('🔄 Data loaded. Populating report filters now.');
                // ReportModule의 populateFilters 함수를 호출하여 필터 UI를 채웁니다.
                appInstance.report.populateFilters();
            }
            // ▲▲▲▲▲ [수정된 부분] 끝 ▲▲▲▲▲

        } catch (error) {
            console.error("데이터 불러오기 실패:", error);
            if (tableContainer && appInstance.ui && appInstance.ui.showErrorState) {
                appInstance.ui.showErrorState(tableContainer, error);
            }
        }
    },

    updateSequenceNumber(appInstance) {
        const gubunIndex = appInstance.state.data.headers.indexOf('구분');
        if (gubunIndex !== -1 && appInstance.state.data.all.length > 0) {
            const lastRow = appInstance.state.data.all[appInstance.state.data.all.length - 1];
            const lastGubun = parseInt(lastRow[gubunIndex] || '0', 10);
            appInstance.state.ui.nextSequenceNumber = isNaN(lastGubun) ? appInstance.state.data.all.length + 1 : lastGubun + 1;
        } else {
            appInstance.state.ui.nextSequenceNumber = appInstance.state.data.all.length + 1;
        }
    },

    updateInterviewSchedule(appInstance) {
        let interviewDateIndex = appInstance.state.data.headers.indexOf('면접 날짜');
        if (interviewDateIndex === -1) interviewDateIndex = appInstance.state.data.headers.indexOf('면접 날자');
        const interviewTimeIndex = appInstance.state.data.headers.indexOf('면접 시간');
        const nameIndex = appInstance.state.data.headers.indexOf('이름');
        const positionIndex = appInstance.state.data.headers.indexOf('모집분야');
        const routeIndex = appInstance.state.data.headers.indexOf('지원루트');
        const companyIndex = appInstance.state.data.headers.indexOf('회사명');
        const recruiterIndex = appInstance.state.data.headers.indexOf('증원자');
        const interviewerIndex = appInstance.state.data.headers.indexOf('면접관');
        const scheduleContainer = document.getElementById('interviewScheduleList');
        
        if (!scheduleContainer) return;
        if (interviewDateIndex === -1) {
            scheduleContainer.innerHTML = '<div class="no-interviews">면접 날짜 컬럼을 찾을 수 없습니다.</div>';
            return;
        }
        const today = new Date();
        const threeDaysLater = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
        
        const upcomingInterviews = appInstance.state.data.all
            .filter(row => {
                const interviewDate = row[interviewDateIndex];
                const interviewTime = row[interviewTimeIndex];
                if (!interviewDate) return false;
                try {
                    const date = new Date(interviewDate);
                    if (interviewTime) {
                        const timeStr = String(interviewTime).replace(/'/g, '').trim();
                        const timeMatch = timeStr.match(/(\d{1,2})[시:]?\s*(\d{0,2})/);
                        if (timeMatch) {
                            const hour = parseInt(timeMatch[1]);
                            const minute = parseInt(timeMatch[2] || '0');
                            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) date.setHours(hour, minute, 0, 0);
                            else date.setHours(23, 59, 59, 999);
                        } else date.setHours(23, 59, 59, 999);
                    } else date.setHours(23, 59, 59, 999);
                    return date >= today && date <= threeDaysLater;
                } catch (e) { return false; }
            })
            .sort((a, b) => {
                try {
                    const dateA = new Date(a[interviewDateIndex]);
                    const dateB = new Date(b[interviewDateIndex]);
                    const timeA = a[interviewTimeIndex];
                    if (timeA) {
                        const timeStrA = String(timeA).replace(/'/g, '').trim();
                        const timeMatchA = timeStrA.match(/(\d{1,2})[시:]?\s*(\d{0,2})/);
                        if (timeMatchA) {
                            const hourA = parseInt(timeMatchA[1]);
                            const minuteA = parseInt(timeMatchA[2] || '0');
                            if (hourA >= 0 && hourA <= 23 && minuteA >= 0 && minuteA <= 59) dateA.setHours(hourA, minuteA, 0, 0);
                        }
                    }
                    const timeB = b[interviewTimeIndex];
                    if (timeB) {
                        const timeStrB = String(timeB).replace(/'/g, '').trim();
                        const timeMatchB = timeStrB.match(/(\d{1,2})[시:]?\s*(\d{0,2})/);
                        if (timeMatchB) {
                            const hourB = parseInt(timeMatchB[1]);
                            const minuteB = parseInt(timeMatchB[2] || '0');
                            if (hourB >= 0 && hourB <= 23 && minuteB >= 0 && minuteB <= 59) dateB.setHours(hourB, minuteB, 0, 0);
                        }
                    }
                    return dateA - dateB;
                } catch (e) { return 0; }
            })
            .slice(0, 7);

        if (upcomingInterviews.length === 0) {
            scheduleContainer.innerHTML = '<div class="no-interviews">3일 이내 예정된 면접이 없습니다.</div>';
            return;
        }

        let tableHtml = `
            <table class="interview-schedule-table">
                <thead>
                    <tr><th>이름</th><th>지원루트</th>${companyIndex !== -1 ? '<th>회사명</th>' : ''}<th>증원자</th><th>모집분야</th><th>면접관</th><th>면접날짜</th><th>면접시간</th></tr>
                </thead>
                <tbody>
        `;

        upcomingInterviews.forEach((row, index) => {
            const interviewDate = row[interviewDateIndex];
            let dateDisplay = '';
            const formattedTime = appInstance.utils.formatInterviewTime(row[interviewTimeIndex]);
            try {
                const date = new Date(interviewDate);
                const dateForDday = new Date(interviewDate);
                dateForDday.setHours(0, 0, 0, 0);
                const todayForDday = new Date(today);
                todayForDday.setHours(0, 0, 0, 0);
                const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                const weekday = weekdays[date.getDay()];
                const diffTime = dateForDday.getTime() - todayForDday.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                let dayDiff = `D-${diffDays}`;
                let ddayClass = '';
                if (diffDays === 0) { dayDiff = 'D-Day'; ddayClass = 'today'; }
                const dateText = `${date.getMonth() + 1}/${date.getDate()}(${weekday})`;
                dateDisplay = `<span class="interview-dday ${ddayClass}">${dayDiff}</span><span class="interview-date-text">${dateText}</span>`;
            } catch (e) { dateDisplay = '날짜 오류'; }

            const name = String(row[nameIndex] || '');
            const route = String(row[routeIndex] || '');
            const companyName = companyIndex !== -1 ? (row[companyIndex] || '-') : '';

            tableHtml += `<tr class="interview-row" data-name="${name}" data-route="${route}" style="cursor: pointer;"><td class="interview-name-cell" title="${name}">${name || '-'}</td><td class="interview-route-cell" title="${route}">${route || '-'}</td>${companyIndex !== -1 ? `<td class="interview-company-cell" title="${companyName}">${companyName}</td>` : ''}<td class="interview-recruiter-cell" title="${row[recruiterIndex] || ''}">${row[recruiterIndex] || '-'}</td><td class="interview-position-cell" title="${row[positionIndex] || ''}">${row[positionIndex] || '-'}</td><td class="interview-interviewer-cell" title="${row[interviewerIndex] || ''}">${row[interviewerIndex] || '-'}</td><td class="interview-date-cell" title="${dateDisplay.replace(/<[^>]*>/g, '')}">${dateDisplay}</td><td class="interview-time-cell" title="${formattedTime}">${formattedTime}</td></tr>`;
        });

        tableHtml += `</tbody></table>`;
        scheduleContainer.innerHTML = tableHtml;
        
        const scheduleTable = scheduleContainer.querySelector('.interview-schedule-table');
        if (scheduleTable) {
            scheduleTable.removeEventListener('click', DataModule._handleTableClick);
            DataModule._handleTableClick = function(event) {
                const row = event.target.closest('.interview-row');
                if (row) {
                    const name = row.getAttribute('data-name');
                    const route = row.getAttribute('data-route');
                    if (name && route) {
                        const app = typeof globalThis !== 'undefined' ? globalThis.App : window.App;
                        if(app) DataModule.showInterviewDetails(app, name, route);
                    }
                }
            };
            scheduleTable.addEventListener('click', DataModule._handleTableClick);
        }
    },

    _handleTableClick: null,

    showInterviewDetails(appInstance, name, route) {
        try {
            const nameIndex = appInstance.state.data.headers.indexOf('이름');
            const routeIndex = appInstance.state.data.headers.indexOf('지원루트');
            const targetRow = appInstance.state.data.all.find(row => String(row[nameIndex] || '') === name && String(row[routeIndex] || '') === route);
            if (targetRow && appInstance.modal) appInstance.modal.openDetail(targetRow);
        } catch (error) {
            console.error('면접 상세 정보 표시 실패:', error);
        }
    },

    async save(appInstance, data, isUpdate = false, gubun = null) {
        const action = isUpdate ? 'update' : 'create';
        const payload = isUpdate ? { action, gubun, data } : { action, data };
        const response = await fetch(appInstance.config.APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message || '저장에 실패했습니다.');
        return result;
    },

    async delete(appInstance, gubun) {
        const response = await fetch(appInstance.config.APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', gubun: gubun }) });
        const result = await response.json();
        if (result.status !== 'success') throw new Error(result.message || '삭제에 실패했습니다.');
        return result;
    }
};
