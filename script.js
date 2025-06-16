// =========================
// 모듈 import
// =========================
import { CONFIG } from './js/config.js';
import { createInitialState } from './js/state.js';
import { Utils } from './js/utils.js';

// =========================
// 애플리케이션 메인 객체
// =========================

const App = {
    // =========================
    // 설정 및 상수 (config.js에서 가져옴)
    // =========================
    config: CONFIG,

    // =========================
    // 애플리케이션 상태 (state.js에서 가져옴)
    // =========================
    state: createInitialState(),

    // =========================
    // 애플리케이션 초기화
    // =========================
    init: {
        async start() {
            App.theme.initialize();
            App.init.setupEventListeners();
            App.init.setupDateFilterListeners();
            await App.data.fetch();
            setTimeout(() => {
                App.utils.enhanceAccessibility();
            }, 1000);
        },

        setupEventListeners() {
            document.addEventListener('click', function(event) {
                const dropdownContainer = document.querySelector('.column-toggle-container');
                if (dropdownContainer && !dropdownContainer.contains(event.target)) {
                    document.getElementById('columnToggleDropdown').style.display = 'none';
                }

                if (window.innerWidth <= 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar.classList.contains('mobile-open') &&
                        !sidebar.contains(event.target) &&
                        !event.target.closest('.mobile-menu-btn')) {
                        App.ui.toggleMobileMenu();
                    }
                }
            });
        },

        setupDateFilterListeners() {
            document.getElementById('dateModeToggle').addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    App.state.ui.activeDateMode = e.target.dataset.mode;
                    App.filter.updateDateFilterUI();
                    App.filter.apply();
                }
            });
        }
    },

    // =========================
    // 테마 관련
    // =========================
    theme: {
        initialize() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            App.theme.updateIcon(savedTheme);
        },

        toggle() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            App.theme.updateIcon(newTheme);
        },

        updateIcon(theme) {
            const icon = document.getElementById('themeIcon');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    // =========================
    // 네비게이션 관련
    // =========================
    navigation: {
        switchPage(pageId) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(pageId).classList.add('active');
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.querySelector(`.nav-item[onclick="App.navigation.switchPage('${pageId}')"]`).classList.add('active');

            const titles = { 
                dashboard: '지원자 현황', 
                stats: '채용 통계 분석',
                efficiency: '효율성 분석'
            };
            document.getElementById('pageTitle').textContent = titles[pageId];

            if (pageId === 'stats') {
                setTimeout(() => {
                    if (window.Chart && App.state.data.all.length > 0) {
                        App.charts.initialize();
                        App.stats.update();
                        App.trend.update();
                    }
                }, 100);
            } else if (pageId === 'efficiency') {
                setTimeout(() => {
                    if (window.Chart && App.state.data.all.length > 0) {
                        App.charts.initializeEfficiency();
                        App.efficiency.updateAll();
                    }
                }, 100);
            }

            if (window.innerWidth <= 768 && document.getElementById('sidebar').classList.contains('mobile-open')) {
                App.ui.toggleMobileMenu();
            }
        }
    },

    // =========================
    // UI 관련
    // =========================
    ui: {
        toggleMobileMenu() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            sidebar.classList.toggle('mobile-open');
            overlay.classList.toggle('show');
        },

        toggleColumnDropdown() {
            const dropdown = document.getElementById('columnToggleDropdown');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        },

        handleColumnToggle(event, columnName) {
            App.state.ui.visibleColumns[columnName] = event.target.checked;
            App.filter.apply();
        },

        setupColumnToggles() {
            const dropdown = document.getElementById('columnToggleDropdown');
            dropdown.innerHTML = '';
            App.state.data.headers.forEach(header => {
                const item = document.createElement('div');
                item.className = 'column-toggle-item';
                item.innerHTML = `<input type="checkbox" id="toggle-${header}" ${App.state.ui.visibleColumns[header] ? 'checked' : ''} onchange="App.ui.handleColumnToggle(event, '${header}')"><label for="toggle-${header}">${header}</label>`;
                dropdown.appendChild(item);
            });
        },

        showLoadingState(container) {
            container.innerHTML = `
                <div class="smooth-loading-container">
                    <div class="advanced-loading-spinner"></div>
                    <div class="loading-text">
                        데이터를 불러오는 중입니다
                        <div class="loading-dots">
                            <div class="loading-dot"></div>
                            <div class="loading-dot"></div>
                            <div class="loading-dot"></div>
                        </div>
                    </div>
                    <div class="loading-subtext">잠시만 기다려 주세요...</div>
                    ${App.utils.createProgressBar(25, '연결중...')}
                </div>`;
        },

        updateProgress(container, percentage, text) {
            setTimeout(() => {
                const progressFill = container.querySelector('.progress-fill');
                const progressPercentage = container.querySelector('.progress-percentage');
                const loadingSubtext = container.querySelector('.loading-subtext');

                if (progressFill && progressPercentage) {
                    progressFill.style.width = percentage + '%';
                    progressPercentage.textContent = percentage + '%';
                }

                if (loadingSubtext && text) {
                    loadingSubtext.textContent = text;
                }
            }, 200);
        },

        showErrorState(container, error) {
            const isNetworkError = error.name === 'TypeError' && error.message.includes('fetch');
            const canRetry = isNetworkError || error.message.includes('서버에 일시적인');

            container.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle error-icon"></i>
                    <h3 class="error-title">데이터 로드 실패</h3>
                    <p class="error-message">
                        ${isNetworkError ? '🌐 인터넷 연결을 확인해주세요.' : error.message}
                    </p>
                    <div class="error-actions">
                        ${canRetry ? `
                            <button class="primary-btn" onclick="App.data.fetch()">
                                <i class="fas fa-sync-alt"></i> 다시 시도
                            </button>
                        ` : ''}
                        <button class="secondary-btn" onclick="location.reload()">
                            <i class="fas fa-redo"></i> 페이지 새로고침
                        </button>
                    </div>
                </div>`;
        }
    },

    // =========================
    // 데이터 관련
    // =========================
    data: {
        async fetch() {
            const tableContainer = document.querySelector('.table-container');

            try {
                App.ui.showLoadingState(tableContainer);

                const response = await fetch(`${App.config.APPS_SCRIPT_URL}?action=read`);

                App.ui.updateProgress(tableContainer, 60, '데이터 처리중...');

                if (!response.ok) {
                    throw new Error(App.utils.getErrorMessage(response.status));
                }

                const result = await response.json();

                App.ui.updateProgress(tableContainer, 85, '최종 처리중...');

                if (result.status !== 'success') {
                    throw new Error(result.message || '데이터 처리 중 오류가 발생했습니다.');
                }

                if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
                    throw new Error('데이터가 비어있거나 올바르지 않은 형식입니다.');
                }

                App.state.data.headers = (result.data[0] || []).map(h => String(h || '').trim());
                App.state.data.all = result.data.slice(1)
                    .filter(row => row && Array.isArray(row) && row.some(cell => cell != null && String(cell).trim() !== ''))
                    .map(row => row.map(cell => cell == null ? '' : String(cell)));

                App.data.updateSequenceNumber();
                App.state.ui.visibleColumns = App.utils.generateVisibleColumns(App.state.data.headers);
                App.ui.setupColumnToggles();
                App.filter.populateDropdowns();
                App.sidebar.updateWidgets();
                App.data.updateInterviewSchedule();
                App.filter.reset(true);

                App.ui.updateProgress(tableContainer, 100, '완료!');

                setTimeout(() => {
                    App.sidebar.updateWidgets();
                }, 500);

            } catch (error) {
                console.error("데이터 불러오기 실패:", error);
                App.ui.showErrorState(tableContainer, error);
            }
        },

        updateSequenceNumber() {
            const gubunIndex = App.state.data.headers.indexOf('구분');
            if (gubunIndex !== -1 && App.state.data.all.length > 0) {
                const lastRow = App.state.data.all[App.state.data.all.length - 1];
                const lastGubun = parseInt(lastRow[gubunIndex] || '0', 10);
                App.state.ui.nextSequenceNumber = isNaN(lastGubun) ? App.state.data.all.length + 1 : lastGubun + 1;
            } else {
                App.state.ui.nextSequenceNumber = App.state.data.all.length + 1;
            }
        },

        updateInterviewSchedule() {
            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');

            const interviewTimeIndex = App.state.data.headers.indexOf('면접 시간');
            const nameIndex = App.state.data.headers.indexOf('이름');
            const positionIndex = App.state.data.headers.indexOf('모집분야');
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const recruiterIndex = App.state.data.headers.indexOf('증원자');
            const interviewerIndex = App.state.data.headers.indexOf('면접자');

            if (interviewDateIndex === -1) {
                document.getElementById('interviewScheduleList').innerHTML = '<div class="no-interviews">면접 날짜 컬럼을 찾을 수 없습니다.</div>';
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const threeDaysLater = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));

            const upcomingInterviews = App.state.data.all
                .filter(row => {
                    const interviewDate = row[interviewDateIndex];
                    if (!interviewDate) return false;
                    try {
                        const date = new Date(interviewDate);
                        return date >= today && date <= threeDaysLater;
                    } catch (e) { return false; }
                })
                .sort((a, b) => new Date(a[interviewDateIndex]) - new Date(b[interviewDateIndex]))
                .slice(0, 7);

            const scheduleContainer = document.getElementById('interviewScheduleList');

            if (upcomingInterviews.length === 0) {
                scheduleContainer.innerHTML = '<div class="no-interviews">3일 이내 예정된 면접이 없습니다.</div>';
                return;
            }

            let tableHtml = `
                <table class="interview-schedule-table">
                    <thead>
                        <tr>
                            <th>이름</th><th>지원루트</th><th>증원자</th><th>모집분야</th><th>면접자</th><th>면접날짜</th><th>면접시간</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            upcomingInterviews.forEach(row => {
                const interviewDate = row[interviewDateIndex];
                let dateDisplay = '';

                const formattedTime = App.utils.formatInterviewTime(row[interviewTimeIndex]);

                try {
                    const date = new Date(interviewDate);
                    date.setHours(0, 0, 0, 0);
                    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
                    const weekday = weekdays[date.getDay()];

                    const diffTime = date.getTime() - today.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                    let dayDiff = `D-${diffDays}`;
                    let ddayClass = '';
                    if (diffDays === 0) { dayDiff = 'D-Day'; ddayClass = 'today'; }

                    const dateText = `${date.getMonth() + 1}/${date.getDate()}(${weekday})`;
                    dateDisplay = `<span class="interview-dday ${ddayClass}">${dayDiff}</span><span class="interview-date-text">${dateText}</span>`;
                } catch (e) { dateDisplay = '날짜 오류'; }

                tableHtml += `
                    <tr onclick="App.data.showInterviewDetails('${row[nameIndex] || ''}', '${row[routeIndex] || ''}')" style="cursor: pointer;">
                        <td class="interview-name-cell" title="${row[nameIndex] || ''}">${row[nameIndex] || '-'}</td>
                        <td class="interview-route-cell" title="${row[routeIndex] || ''}">${row[routeIndex] || '-'}</td>
                        <td class="interview-recruiter-cell" title="${row[recruiterIndex] || ''}">${row[recruiterIndex] || '-'}</td>
                        <td class="interview-position-cell" title="${row[positionIndex] || ''}">${row[positionIndex] || '-'}</td>
                        <td class="interview-interviewer-cell" title="${row[interviewerIndex] || ''}">${row[interviewerIndex] || '-'}</td>
                        <td class="interview-date-cell" title="${dateDisplay.replace(/<[^>]*>/g, '')}">${dateDisplay}</td>
                        <td class="interview-time-cell" title="${formattedTime}">${formattedTime}</td>
                    </tr>
                `;
            });

            tableHtml += `</tbody></table>`;
            scheduleContainer.innerHTML = tableHtml;
        },

        showInterviewDetails(name, route) {
            const nameIndex = App.state.data.headers.indexOf('이름');
            const routeIndex = App.state.data.headers.indexOf('지원루트');

            const targetRow = App.state.data.all.find(row => {
                const nameMatch = String(row[nameIndex] || '') === name;
                const routeMatch = String(row[routeIndex] || '') === route;
                return nameMatch && routeMatch;
            });

            if (targetRow) {
                App.modal.openDetail(targetRow);
            }
        },

        async save(data, isUpdate = false, gubun = null) {
            const action = isUpdate ? 'update' : 'create';
            const payload = isUpdate ? { action, gubun, data } : { action, data };

            const response = await fetch(App.config.APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || '저장에 실패했습니다.');
            }

            return result;
        },

        async delete(gubun) {
            const response = await fetch(App.config.APPS_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({
                    action: 'delete',
                    gubun: gubun
                })
            });

            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || '삭제에 실패했습니다.');
            }

            return result;
        }
    },

    // =========================
    // 검색 관련
    // =========================
    search: {
        handle() {
            if (App.state.ui.searchTimeout) {
                clearTimeout(App.state.ui.searchTimeout);
            }

            App.state.ui.searchTimeout = setTimeout(() => {
                App.state.ui.searchTerm = String(document.getElementById('globalSearch').value || '').toLowerCase();
                App.state.ui.currentPage = 1;
                App.filter.apply();
            }, 300);
        }
    },

    // =========================
    // 필터 관련
    // =========================
    filter: {
        apply() {
            let data = [...App.state.data.all];
            console.log('필터 적용 시작 - 원본 데이터:', data.length);

            const routeFilter = document.getElementById('routeFilter').value;
            const positionFilter = document.getElementById('positionFilter').value;
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            if (App.state.ui.searchTerm) {
                data = data.filter(row => row.some(cell => String(cell || '').toLowerCase().includes(App.state.ui.searchTerm)));
            }

            if (routeFilter !== 'all' && routeIndex !== -1) {
                data = data.filter(row => String(row[routeIndex] || '') === routeFilter);
            }

            if (positionFilter !== 'all' && positionIndex !== -1) {
                data = data.filter(row => String(row[positionIndex] || '') === positionFilter);
            }

            if (applyDateIndex !== -1 && App.state.ui.activeDateMode !== 'all') {
                data = App.filter.applyDateFilter(data, applyDateIndex);
            }

            App.state.data.filtered = App.utils.sortData(data);
            console.log('필터 적용 완료 - 필터링된 데이터:', App.state.data.filtered.length);

            App.pagination.updateTotal();
            App.filter.updateSummary();

            const pageData = App.pagination.getCurrentPageData();
            console.log('렌더링할 페이지 데이터:', pageData.length);

            if (App.state.ui.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }

            App.pagination.updateUI();
        },

        applyDateFilter(data, applyDateIndex) {
            try {
                if (App.state.ui.activeDateMode === 'year') {
                    const year = document.getElementById('dateInput')?.value;
                    if(year) return data.filter(row => row[applyDateIndex] && new Date(row[applyDateIndex]).getFullYear() == year);
                } else if (App.state.ui.activeDateMode === 'month') {
                    const month = document.getElementById('dateInput')?.value;
                    if(month) return data.filter(row => String(row[applyDateIndex] || '').slice(0, 7) === month);
                } else if (App.state.ui.activeDateMode === 'day') {
                    const day = document.getElementById('dateInput')?.value;
                    if(day) return data.filter(row => String(row[applyDateIndex] || '').slice(0, 10) === day);
                } else if (App.state.ui.activeDateMode === 'range') {
                    const startDate = document.getElementById('startDateInput')?.value;
                    const endDate = document.getElementById('endDateInput')?.value;
                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        return data.filter(row => {
                            if(!row[applyDateIndex]) return false;
                            const applyDate = new Date(row[applyDateIndex]);
                            return applyDate >= start && applyDate <= end;
                        });
                    }
                }
            } catch(e) {
                console.error("날짜 필터링 오류", e);
            }
            return data;
        },

        reset(runApplyFilters = true) {
            document.querySelectorAll('.filter-bar select').forEach(select => select.value = 'all');
            document.getElementById('globalSearch').value = '';
            App.state.ui.searchTerm = '';
            App.state.ui.activeDateMode = 'all';
            App.state.ui.currentPage = 1;
            App.filter.updateDateFilterUI();
            if (runApplyFilters) {
                console.log('필터 리셋 중 - 전체 데이터 개수:', App.state.data.all.length);
                App.filter.apply();
            }
        },

        updateSummary() {
            const filteredCount = App.state.data.filtered.length;
            const searchText = App.state.ui.searchTerm ? ` (검색: "${App.state.ui.searchTerm}")` : '';
            const pageInfo = filteredCount > App.config.ITEMS_PER_PAGE ? ` - ${App.state.ui.currentPage}/${App.state.ui.totalPages} 페이지` : '';
            document.getElementById('filterSummary').innerHTML = `<strong>지원자:</strong> ${filteredCount}명${searchText}${pageInfo}`;
        },

        populateDropdowns() {
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            if (routeIndex !== -1) {
                const routes = [...new Set(App.state.data.all.map(row => String(row[routeIndex] || '').trim()).filter(Boolean))];
                const routeFilter = document.getElementById('routeFilter');
                routeFilter.innerHTML = '<option value="all">전체</option>';
                routes.sort().forEach(route => routeFilter.innerHTML += `<option value="${route}">${route}</option>`);
            }

            if (positionIndex !== -1) {
                const positions = [...new Set(App.state.data.all.map(row => String(row[positionIndex] || '').trim()).filter(Boolean))];
                const positionFilter = document.getElementById('positionFilter');
                positionFilter.innerHTML = '<option value="all">전체</option>';
                positions.sort().forEach(pos => positionFilter.innerHTML += `<option value="${pos}">${pos}</option>`);
            }
        },

        updateDateFilterUI() {
            document.querySelectorAll('.date-mode-btn').forEach(btn =>
                btn.classList.toggle('active', btn.dataset.mode === App.state.ui.activeDateMode)
            );

            const container = document.getElementById('dateInputsContainer');
            let html = '';
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');

            if (App.state.ui.activeDateMode === 'all') {
                html = `<span style="color: var(--text-secondary); font-size: 0.9rem; padding: 0 10px;">모든 데이터 표시</span>`;
            } else if (App.state.ui.activeDateMode === 'year') {
                html = `<input type="number" id="dateInput" value="${year}" onchange="App.filter.apply()">`;
            } else if (App.state.ui.activeDateMode === 'month') {
                html = `<button class="date-nav-btn" onclick="App.filter.navigateDate(-1)">&lt;</button><input type="month" id="dateInput" value="${year}-${month}" onchange="App.filter.apply()"><button class="date-nav-btn" onclick="App.filter.navigateDate(1)">&gt;</button>`;
            } else if (App.state.ui.activeDateMode === 'day') {
                html = `<button class="date-nav-btn" onclick="App.filter.navigateDate(-1)">&lt;</button><input type="date" id="dateInput" value="${year}-${month}-${day}" onchange="App.filter.apply()"><button class="date-nav-btn" onclick="App.filter.navigateDate(1)">&gt;</button>`;
            } else if (App.state.ui.activeDateMode === 'range') {
                html = `<input type="date" id="startDateInput" onchange="App.filter.apply()"><span style="margin: 0 5px;">-</span><input type="date" id="endDateInput" onchange="App.filter.apply()">`;
            }
            container.innerHTML = html;
        },

        navigateDate(direction) {
            const input = document.getElementById('dateInput');
            if (!input) return;

            if (App.state.ui.activeDateMode === 'year') {
                input.value = Number(input.value) + direction;
            } else {
                let currentDate = (App.state.ui.activeDateMode === 'month') ? new Date(input.value + '-02') : new Date(input.value);
                if(App.state.ui.activeDateMode === 'month') currentDate.setMonth(currentDate.getMonth() + direction);
                else if (App.state.ui.activeDateMode === 'day') currentDate.setDate(currentDate.getDate() + direction);
                input.value = currentDate.toISOString().slice(0, App.state.ui.activeDateMode === 'month' ? 7 : 10);
            }
            App.filter.apply();
        }
    },

    // =========================
    // 페이지네이션 관련
    // =========================
    pagination: {
        updateTotal() {
            App.state.ui.totalPages = Math.ceil(App.state.data.filtered.length / App.config.ITEMS_PER_PAGE);
            if (App.state.ui.currentPage > App.state.ui.totalPages && App.state.ui.totalPages > 0) {
                App.state.ui.currentPage = App.state.ui.totalPages;
            } else if (App.state.ui.totalPages === 0) {
                App.state.ui.currentPage = 1;
            }
        },

        getCurrentPageData() {
            const startIndex = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + App.config.ITEMS_PER_PAGE, App.state.data.filtered.length);
            return App.state.data.filtered.slice(startIndex, endIndex);
        },

        goToPage(page) {
            if (page >= 1 && page <= App.state.ui.totalPages) {
                App.state.ui.currentPage = page;
                const pageData = App.pagination.getCurrentPageData();
                if (App.state.ui.currentView === 'table') {
                    App.render.table(pageData);
                } else {
                    App.render.cards(pageData);
                }
                App.pagination.updateUI();
            }
        },

        goToPrevPage() {
            App.pagination.goToPage(App.state.ui.currentPage - 1);
        },

        goToNextPage() {
            App.pagination.goToPage(App.state.ui.currentPage + 1);
        },

        goToLastPage() {
            App.pagination.goToPage(App.state.ui.totalPages);
        },

        updateUI() {
            const paginationContainer = document.getElementById('paginationContainer');
            const paginationInfo = document.getElementById('paginationInfo');
            const paginationNumbers = document.getElementById('paginationNumbers');
            const firstPageBtn = document.getElementById('firstPageBtn');
            const prevPageBtn = document.getElementById('prevPageBtn');
            const nextPageBtn = document.getElementById('nextPageBtn');
            const lastPageBtn = document.getElementById('lastPageBtn');

            if (App.state.data.filtered.length === 0) {
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';

            const startItem = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + 1;
            const endItem = Math.min(App.state.ui.currentPage * App.config.ITEMS_PER_PAGE, App.state.data.filtered.length);
            paginationInfo.textContent = `${startItem}-${endItem} / ${App.state.data.filtered.length}명`;

            firstPageBtn.disabled = App.state.ui.currentPage === 1;
            prevPageBtn.disabled = App.state.ui.currentPage === 1;
            nextPageBtn.disabled = App.state.ui.currentPage === App.state.ui.totalPages;
            lastPageBtn.disabled = App.state.ui.currentPage === App.state.ui.totalPages;

            App.pagination.renderPageNumbers(paginationNumbers);
        },

        renderPageNumbers(container) {
            container.innerHTML = '';
            const maxVisiblePages = 5;
            let startPage = Math.max(1, App.state.ui.currentPage - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(App.state.ui.totalPages, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            if (startPage > 1) {
                const firstPageNum = document.createElement('button');
                firstPageNum.className = 'pagination-number';
                firstPageNum.textContent = '1';
                firstPageNum.onclick = () => App.pagination.goToPage(1);
                container.appendChild(firstPageNum);

                if (startPage > 2) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    container.appendChild(ellipsis);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                const pageNum = document.createElement('button');
                pageNum.className = `pagination-number ${i === App.state.ui.currentPage ? 'active' : ''}`;
                pageNum.textContent = i;
                pageNum.onclick = () => App.pagination.goToPage(i);
                container.appendChild(pageNum);
            }

            if (endPage < App.state.ui.totalPages) {
                if (endPage < App.state.ui.totalPages - 1) {
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    container.appendChild(ellipsis);
                }

                const lastPageNum = document.createElement('button');
                lastPageNum.className = 'pagination-number';
                lastPageNum.textContent = App.state.ui.totalPages;
                lastPageNum.onclick = () => App.pagination.goToPage(App.state.ui.totalPages);
                container.appendChild(lastPageNum);
            }
        }
    },

    // =========================
    // 뷰 관련 (테이블/카드)
    // =========================
    view: {
        switch(viewType) {
            App.state.ui.currentView = viewType;
            const tableView = document.getElementById('tableView');
            const cardsView = document.getElementById('cardsView');
            const viewBtns = document.querySelectorAll('.view-btn');

            viewBtns.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.view-btn[onclick="App.view.switch('${viewType}')"]`).classList.add('active');

            const pageData = App.pagination.getCurrentPageData();

            if (viewType === 'table') {
                tableView.style.display = 'block';
                cardsView.classList.remove('active');
                App.render.table(pageData);
            } else {
                tableView.style.display = 'none';
                cardsView.classList.add('active');
                App.render.cards(pageData);
            }
        }
    },

    // =========================
    // 렌더링 관련
    // =========================
    render: {
        currentView() {
            const pageData = App.pagination.getCurrentPageData();
            if (App.state.ui.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }
        },

        table(dataToRender) {
            const tableContainer = document.querySelector('.table-container');

            if (!dataToRender && App.state.data.all.length === 0) {
                tableContainer.innerHTML = App.utils.createSkeletonTable();
                return;
            }

            const renderData = dataToRender || [];

            tableContainer.innerHTML = '';
            const table = document.createElement('table');
            table.className = 'data-table';
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', '지원자 목록 테이블');

            App.render.tableHeader(table);
            App.render.tableBody(table, renderData);

            tableContainer.appendChild(table);
        },

        tableHeader(table) {
            const thead = table.createTHead();
            const headerRow = thead.insertRow();

            App.state.data.headers.forEach(header => {
                if (App.state.ui.visibleColumns[header]) {
                    const th = document.createElement('th');
                    th.className = 'sortable-header';
                    th.setAttribute('role', 'columnheader');
                    th.setAttribute('tabindex', '0');
                    th.setAttribute('aria-sort', 'none');
                    th.onclick = () => App.table.sort(header);

                    th.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            th.click();
                        }
                    });

                    let sortIcon = 'fa-sort';
                    if (App.state.ui.currentSortColumn === header && App.state.ui.currentSortDirection) {
                        sortIcon = App.state.ui.currentSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
                    }

                    th.innerHTML = `${header} <i class="fas ${sortIcon} sort-icon ${App.state.ui.currentSortColumn === header ? 'active' : ''}"></i>`;
                    headerRow.appendChild(th);
                }
            });
        },

        tableBody(table, dataToRender) {
            const tbody = table.createTBody();

            if (!dataToRender || dataToRender.length === 0) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = Object.values(App.state.ui.visibleColumns).filter(Boolean).length || 1;
                cell.textContent = '표시할 데이터가 없습니다.';
                cell.style.textAlign = 'center';
                cell.style.padding = '40px';
                return;
            }

            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');

            dataToRender.forEach((rowData, index) => {
                const row = tbody.insertRow();
                row.id = `row-${index}`;

                row.onclick = (event) => {
                    if (event.target.tagName !== 'A') {
                        App.modal.openDetail(rowData);
                    }
                };

                if (interviewDateIndex !== -1) {
                    const urgency = App.utils.getInterviewUrgency(rowData[interviewDateIndex]);
                    if (urgency >= 0) row.classList.add(`urgent-interview-${urgency}`);
                }

                App.render.tableCells(row, rowData, index);
            });
        },

        tableCells(row, rowData, index) {
            App.state.data.headers.forEach((header, cellIndex) => {
                if (App.state.ui.visibleColumns[header]) {
                    const cell = row.insertCell();
                    let cellData = rowData[cellIndex];

                    if (header === '구분') {
                        const displaySequence = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;
                        cellData = displaySequence;
                    }

                    const statusClass = App.utils.getStatusClass(header, cellData);
                    if (statusClass) {
                        cell.innerHTML = `<span class="status-badge ${statusClass}">${String(cellData || '')}</span>`;
                    } else if (header === '연락처' && cellData) {
                        cell.innerHTML = `<a href="tel:${String(cellData).replace(/\D/g, '')}">${cellData}</a>`;
                    } else if (header === '면접 시간' && cellData) {
                        cell.textContent = App.utils.formatInterviewTime(cellData);
                    } else if ((header.includes('날짜') || header.includes('날자') || header.includes('지원일') || header.includes('입과일')) && cellData) {
                        cell.textContent = App.utils.formatDate(cellData);
                    } else {
                        cell.textContent = String(cellData || '');
                    }
                }
            });
        },

        cards(dataToRender) {
            const cardsContainer = document.getElementById('cardsView');
            cardsContainer.innerHTML = '';

            if (!dataToRender || dataToRender.length === 0) {
                cardsContainer.innerHTML = '<p style="text-align:center; padding: 40px; grid-column: 1/-1;">표시할 데이터가 없습니다.</p>';
                return;
            }

            let interviewDateIndex = App.state.data.headers.indexOf('면접 날짜');
            if (interviewDateIndex === -1) interviewDateIndex = App.state.data.headers.indexOf('면접 날자');

            dataToRender.forEach((rowData, index) => {
                const card = document.createElement('div');
                card.className = 'applicant-card';
                card.onclick = () => App.modal.openDetail(rowData);

                if (interviewDateIndex !== -1) {
                    const urgency = App.utils.getInterviewUrgency(rowData[interviewDateIndex]);
                    if (urgency >= 0) card.classList.add(`urgent-card-${urgency}`);
                }

                const getVal = (header) => String(rowData[App.state.data.headers.indexOf(header)] || '-');
                const name = getVal('이름');
                const phone = getVal('연락처');
                const route = getVal('지원루트');
                const position = getVal('모집분야');
                let date = getVal('지원일');

                if(date !== '-') {
                    try {
                        date = new Date(date).toLocaleDateString('ko-KR');
                    } catch(e) {}
                }

                const displaySequence = (App.state.ui.currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;

                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-name">${name}</div>
                        <div class="card-sequence">#${displaySequence}</div>
                    </div>
                    <div class="card-info">
                        <div><span class="card-label">연락처:</span> ${phone}</div>
                        <div><span class="card-label">지원루트:</span> ${route}</div>
                        <div><span class="card-label">모집분야:</span> ${position}</div>
                    </div>
                    <div class="card-footer">
                        <span>지원일: ${date}</span>
                        ${phone !== '-' ? `<a href="tel:${phone.replace(/\D/g, '')}" onclick="event.stopPropagation()"><i class="fas fa-phone"></i></a>` : ''}
                    </div>`;
                cardsContainer.appendChild(card);
            });
        }
    },

    // =========================
    // 테이블 관련
    // =========================
    table: {
        sort(columnName) {
            if (App.state.ui.currentSortColumn === columnName) {
                App.state.ui.currentSortDirection = App.state.ui.currentSortDirection === 'asc' ? 'desc' : '';
                if (App.state.ui.currentSortDirection === '') {
                    App.state.ui.currentSortColumn = '지원일';
                    App.state.ui.currentSortDirection = 'desc';
                }
            } else {
                App.state.ui.currentSortColumn = columnName;
                App.state.ui.currentSortDirection = 'asc';
            }
            App.filter.apply();
        }
    },

    // =========================
    // 모달 관련
    // =========================
    modal: {
        get element() {
            return document.getElementById('applicantModal');
        },

        openNew() {
            document.querySelector('#applicantModal .modal-title').textContent = '신규 지원자 등록';
            App.modal.buildForm();
            document.querySelector('#applicantModal .modal-footer').innerHTML = `<button class="primary-btn" onclick="App.modal.saveNew()">저장하기</button>`;
            App.modal.element.style.display = 'flex';
        },

        openDetail(rowData) {
            document.querySelector('#applicantModal .modal-title').textContent = '지원자 상세 정보';
            App.modal.buildForm(rowData, true);

            document.querySelector('#applicantModal .modal-footer').innerHTML = `
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="modal-close-btn" onclick="App.modal.close()">
                        <i class="fas fa-times"></i> 닫기
                    </button>
                    <button class="modal-edit-btn" onclick="App.modal.openEdit()">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button class="modal-delete-btn" onclick="App.modal.delete()">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            `;

            App.state.ui.currentEditingData = [...rowData];
            App.modal.element.style.display = 'flex';
        },

        openEdit() {
            if (!App.state.ui.currentEditingData) {
                alert('편집할 데이터가 없습니다.');
                return;
            }

            document.querySelector('#applicantModal .modal-title').textContent = '지원자 정보 수정';
            App.modal.buildForm(App.state.ui.currentEditingData, false);

            document.querySelector('#applicantModal .modal-footer').innerHTML = `
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="modal-close-btn" onclick="App.modal.close()">
                        <i class="fas fa-times"></i> 취소
                    </button>
                    <button class="modal-edit-btn" onclick="App.modal.saveEdit()">
                        <i class="fas fa-save"></i> 저장
                    </button>
                </div>
            `;
        },

        close() {
            App.modal.element.style.display = 'none';
            document.getElementById('applicantForm').innerHTML = '';
            App.state.ui.currentEditingData = null;
        },

        buildForm(data = null, isReadOnly = false) {
            const form = document.getElementById('applicantForm');
            form.innerHTML = '';

            App.state.data.headers.forEach((header, index) => {
                const formGroup = document.createElement('div');
                formGroup.className = `form-group ${header === '비고' || header === '면접리뷰' ? 'full-width' : ''}`;

                const isRequired = App.config.REQUIRED_FIELDS.includes(header) && !isReadOnly;

                let value = '';
                if (data) {
                    value = String(data[index] || '');
                } else {
                    if (header === '구분') value = App.state.ui.nextSequenceNumber;
                    else if (header === '지원일') {
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, '0');
                        const day = String(now.getDate()).padStart(2, '0');
                        value = `${year}-${month}-${day}`;
                    }
                }

                if ((App.config.DATE_FIELDS.includes(header) || header === '지원일') && value && value !== '-') {
                    value = App.utils.formatDateForInput(value);
                }

                const inputHtml = App.modal.createInput(header, value, isRequired, isReadOnly);
                formGroup.innerHTML = `<label for="modal-form-${header}">${header}${isRequired ? ' *' : ''}</label>${inputHtml}`;
                form.appendChild(formGroup);
            });
        },

        createInput(header, value, isRequired, isDisabled) {
            const isDisabledOrReadOnly = isDisabled || header === '구분';

            if (header === '연락처') {
                return `<input type="tel" id="modal-form-${header}" value="${value}" oninput="App.utils.formatPhoneNumber(this)" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
            } else if (App.config.DATE_FIELDS.includes(header) || header === '지원일') {
                return `<input type="date" id="modal-form-${header}" value="${value}" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
            } else if (App.config.TIME_FIELDS.includes(header)) {
                return `<input type="text" id="modal-form-${header}" value="${value}" placeholder="예: 14시 30분" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
            } else if (App.config.DROPDOWN_OPTIONS[header]) {
                return App.modal.createDropdownInput(header, value, isRequired, isDisabledOrReadOnly);
            } else if (header === '비고' || header === '면접리뷰') {
                return `<textarea id="modal-form-${header}" rows="3" ${isDisabledOrReadOnly ? 'disabled' : ''}>${value}</textarea>`;
            } else {
                return `<input type="text" id="modal-form-${header}" value="${value}" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''} ${header === '구분' ? 'style="background-color: #f1f5f9;"' : ''}>`;
            }
        },

        createDropdownInput(header, value, isRequired, isDisabled) {
            const options = App.config.DROPDOWN_OPTIONS[header];
            const hasDirectInput = options.includes('직접입력');
            let customValue = '';
            let selectValue = value;

            if (hasDirectInput && !options.includes(value) && value) {
                selectValue = '직접입력';
                customValue = value;
            }

            let html = `<select id="modal-form-${header}" ${hasDirectInput ? `onchange="App.modal.handleDropdownChange(this, '${header}')"` : ''} ${isRequired ? 'required' : ''} ${isDisabled ? 'disabled' : ''}>
                            <option value="">선택해주세요</option>
                            ${options.map(option => `<option value="${option}" ${selectValue === option ? 'selected' : ''}>${option}</option>`).join('')}
                        </select>`;

            if(hasDirectInput) {
                html += `<input type="text" id="modal-form-${header}-custom" value="${customValue}" placeholder="직접 입력하세요" style="display:${selectValue === '직접입력' ? 'block' : 'none'}; margin-top:5px;" ${isDisabled ? 'disabled' : ''}>`;
            }

            return html;
        },

        handleDropdownChange(selectElement, fieldName) {
            const customInput = document.getElementById(`modal-form-${fieldName}-custom`);
            const isDirectInput = selectElement.value === '직접입력';

            customInput.style.display = isDirectInput ? 'block' : 'none';
            if(isDirectInput) customInput.focus();

            const isRequired = document.querySelector(`label[for="modal-form-${fieldName}"]`).textContent.includes('*');
            if(isRequired){
                if(isDirectInput){
                    selectElement.removeAttribute('required');
                    customInput.setAttribute('required', '');
                } else {
                    customInput.removeAttribute('required');
                    selectElement.setAttribute('required', '');
                }
            }
        },

        async saveNew() {
            const saveBtn = document.querySelector('#applicantModal .modal-footer .primary-btn');
            const originalText = saveBtn.innerHTML;

            try {
                const applicantData = App.modal.collectFormData();

                if (!App.modal.validateFormData(applicantData)) {
                    alert('필수 항목을 모두 입력해주세요.');
                    return;
                }

                if (App.state.data.headers.includes('구분')) {
                    applicantData['구분'] = App.state.ui.nextSequenceNumber.toString();
                }
                if (App.state.data.headers.includes('지원일')) {
                    applicantData['지원일'] = new Date().toISOString().split('T')[0];
                }

                App.modal.prepareTimeData(applicantData);

                saveBtn.disabled = true;
                saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

                await App.data.save(applicantData);

                App.modal.close();
                App.data.fetch();

            } catch (error) {
                console.error("데이터 저장 실패:", error);
                alert("데이터 저장 중 오류 발생: " + error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        },

        async saveEdit() {
            const saveBtn = document.querySelector('#applicantModal .modal-footer .modal-edit-btn');
            const originalText = saveBtn.innerHTML;

            try {
                const updatedData = App.modal.collectFormData();

                if (!App.modal.validateFormData(updatedData)) {
                    alert('필수 항목을 모두 입력해주세요.');
                    return;
                }

                App.modal.prepareTimeData(updatedData);

                const gubunIndex = App.state.data.headers.indexOf('구분');
                if (gubunIndex === -1 || !App.state.ui.currentEditingData) {
                    alert('편집 정보를 찾을 수 없습니다.');
                    return;
                }

                const gubunValue = App.state.ui.currentEditingData[gubunIndex];
                if (!gubunValue) {
                    alert('구분값을 찾을 수 없습니다.');
                    return;
                }

                saveBtn.disabled = true;
                saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

                await App.data.save(updatedData, true, gubunValue);

                alert('정보가 성공적으로 수정되었습니다.');
                App.modal.close();
                App.data.fetch();

            } catch (error) {
                console.error("데이터 수정 실패:", error);
                alert("데이터 수정 중 오류 발생: " + error.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        },

        async delete() {
            if (!App.state.ui.currentEditingData) {
                alert('삭제할 데이터가 없습니다.');
                return;
            }

            const gubunIndex = App.state.data.headers.indexOf('구분');
            const nameIndex = App.state.data.headers.indexOf('이름');

            if (gubunIndex === -1) {
                alert('삭제를 위한 고유 식별자(구분)를 찾을 수 없습니다.');
                return;
            }

            const gubunValue = App.state.ui.currentEditingData[gubunIndex];
            const applicantName = App.state.ui.currentEditingData[nameIndex] || '해당 지원자';

            if (!confirm(`정말로 '${applicantName}' 님의 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                return;
            }

            const deleteBtn = document.querySelector('.modal-delete-btn');
            const originalText = deleteBtn.innerHTML;

            try {
                deleteBtn.disabled = true;
                deleteBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 삭제 중...';

                await App.data.delete(gubunValue);

                alert(`'${applicantName}' 님의 정보가 성공적으로 삭제되었습니다.`);
                App.modal.close();
                App.data.fetch();

            } catch (error) {
                console.error("데이터 삭제 실패:", error);
                alert("데이터 삭제 중 오류가 발생했습니다: " + error.message);
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = originalText;
            }
        },

        collectFormData() {
            const applicantData = {};
            App.state.data.headers.forEach(header => {
                const input = document.getElementById(`modal-form-${header}`);
                const customInput = document.getElementById(`modal-form-${header}-custom`);
                if (input) {
                    let value = (customInput && customInput.style.display !== 'none') ? customInput.value : input.value;
                    applicantData[header] = value;
                }
            });
            return applicantData;
        },

        validateFormData(data) {
            return App.config.REQUIRED_FIELDS.every(field => data[field] && data[field].trim() !== '');
        },

        prepareTimeData(data) {
            const timeHeader = '면접 시간';
            if (data[timeHeader]) {
                data[timeHeader] = "'" + data[timeHeader];
            }
        }
    },

    // =========================
    // 사이드바 관련
    // =========================
    sidebar: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter').value;
            const customRange = document.getElementById('sidebarCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'block';
            } else {
                customRange.style.display = 'none';
                App.sidebar.updateWidgets();
            }
        },

        updateWidgets() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter')?.value || 'all';
            const applyDateIndex = App.state.data.headers.indexOf('지원일');

            let filteredApplicants = [...App.state.data.all];
            let periodLabel = '전체 기간';

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                const result = App.sidebar.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                filteredApplicants = result.data;
                periodLabel = result.label;
            }

            const stats = App.sidebar.calculateStats(filteredApplicants);
            App.sidebar.updateUI(stats, periodLabel);

            if (document.getElementById('stats').classList.contains('active')) {
                App.stats.update();
            }
        },

        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            const now = new Date();
            let filteredData = [...data];
            let label = '전체 기간';

            if (selectedPeriod === 'custom') {
                const startDate = document.getElementById('sidebarStartDate')?.value;
                const endDate = document.getElementById('sidebarEndDate')?.value;

                if (startDate && endDate) {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);

                    filteredData = data.filter(row => {
                        try {
                            const dateValue = row[applyDateIndex];
                            if (!dateValue) return false;
                            const date = new Date(dateValue);
                            return date >= start && date <= end;
                        } catch (e) { return false; }
                    });

                    label = `${startDate} ~ ${endDate}`;
                }
            } else {
                const result = App.utils.filterDataByPeriod(data, selectedPeriod, applyDateIndex, now);
                filteredData = result.data;
                label = result.label;
            }

            return { data: filteredData, label };
        },

        calculateStats(filteredApplicants) {
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');

            const totalCount = filteredApplicants.length;

            let interviewPendingCount = 0;
            if (contactResultIndex !== -1) {
                interviewPendingCount = filteredApplicants.filter(row => {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    return contactResult === '면접확정';
                }).length;
            }

            let successRate = 0;
            if (contactResultIndex !== -1 && interviewResultIndex !== -1) {
                const interviewConfirmed = filteredApplicants.filter(row => {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    return contactResult === '면접확정';
                });

                const passed = interviewConfirmed.filter(row => {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    return interviewResult === '합격';
                });

                successRate = interviewConfirmed.length > 0 ? Math.round((passed.length / interviewConfirmed.length) * 100) : 0;
            }

            let joinRate = 0;
            if (interviewResultIndex !== -1 && joinDateIndex !== -1) {
                const passedApplicants = filteredApplicants.filter(row => {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    return interviewResult === '합격';
                });

                const joinedApplicants = passedApplicants.filter(row => {
                    const joinDate = String(row[joinDateIndex] || '').trim();
                    return joinDate !== '' && joinDate !== '-';
                });

                joinRate = passedApplicants.length > 0 ? Math.round((joinedApplicants.length / passedApplicants.length) * 100) : 0;
            }

            return { totalCount, interviewPendingCount, successRate, joinRate };
        },

        updateUI(stats, periodLabel) {
            document.getElementById('sidebarTotalApplicants').textContent = stats.totalCount;
            document.getElementById('sidebarPeriodLabel').textContent = periodLabel;
            document.getElementById('sidebarInterviewPending').textContent = stats.interviewPendingCount;
            document.getElementById('sidebarSuccessRate').textContent = stats.successRate + '%';
            document.getElementById('sidebarJoinRate').textContent = stats.joinRate + '%';
        }
    },

    // =========================
    // 통계 관련
    // =========================
    stats: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('statsPeriodFilter').value;
            const customRange = document.getElementById('statsCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                App.stats.update();
            }
        },

        update() {
            if (!App.state.data.all || App.state.data.all.length === 0) {
                console.log('데이터가 없어서 통계 업데이트 불가');
                return;
            }

            try {
                const selectedPeriod = document.getElementById('statsPeriodFilter')?.value || 'all';
                const applyDateIndex = App.state.data.headers.indexOf('지원일');

                let filteredApplicants = [...App.state.data.all];
                let periodLabel = '전체 기간';

                if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                    const result = App.stats.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                    filteredApplicants = result.data;
                    periodLabel = result.label;
                }

                const stats = App.sidebar.calculateStats(filteredApplicants);
                App.stats.updateStatCards(stats, periodLabel);

                if (window.Chart && Object.keys(App.state.charts.instances).length > 0) {
                    App.charts.updateData(filteredApplicants);
                }

                App.trend.update(filteredApplicants, applyDateIndex);

            } catch (error) {
                console.error('❌ 통계 데이터 업데이트 실패:', error);
            }
        },

        filterByPeriod(data, selectedPeriod, applyDateIndex) {
            return App.sidebar.filterByPeriod(data, selectedPeriod, applyDateIndex);
        },

        updateStatCards(stats, periodLabel) {
            App.utils.updateElement('totalApplicantsChart', stats.totalCount);
            App.utils.updateElement('statsTimePeriod', periodLabel);
            App.utils.updateElement('pendingInterviewChart', stats.interviewPendingCount);
            App.utils.updateElement('successRateChart', stats.successRate + '%');
            App.utils.updateElement('joinRateChart', stats.joinRate + '%');
        }
    },

    // =========================
    // 차트 관련
    // =========================
    charts: {
        initialize() {
            if (!window.Chart) {
                console.error('Chart.js가 로드되지 않았습니다.');
                return;
            }

            try {
                App.charts.createRouteChart();
                App.charts.createPositionChart();
                App.charts.createTrendChart();
                App.charts.createRegionChart();
                App.charts.createGenderChart();
                App.charts.createAgeChart();

                console.log('📊 기본 차트 초기화 완료');

            } catch (error) {
                console.error('기본 차트 초기화 실패:', error);
            }
        },

        initializeEfficiency() {
            if (!window.Chart) {
                console.error('Chart.js가 로드되지 않았습니다.');
                return;
            }

            try {
                App.charts.createRadarChart();
                App.charts.createScatterChart();

                console.log('📈 효율성 차트 초기화 완료');

            } catch (error) {
                console.error('효율성 차트 초기화 실패:', error);
            }
        },

        createRouteChart() {
            const routeCtx = document.getElementById('routeChart');
            if (routeCtx && !App.state.charts.instances.route) {
                App.state.charts.instances.route = new Chart(routeCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.primary,
                            borderColor: App.config.CHART_COLORS.primary,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        }
                    }
                });
            }
        },

        createPositionChart() {
            const positionCtx = document.getElementById('positionChart');
            if (positionCtx && !App.state.charts.instances.position) {
                App.state.charts.instances.position = new Chart(positionCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.success,
                            borderColor: App.config.CHART_COLORS.success,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        }
                    }
                });
            }
        },

        createTrendChart() {
            const trendCtx = document.getElementById('trendChart');
            if (trendCtx && !App.state.charts.instances.trend) {
                App.state.charts.instances.trend = new Chart(trendCtx, {
                    type: 'line',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            label: '지원자 수',
                            data: [0],
                            borderColor: App.config.CHART_COLORS.primary,
                            backgroundColor: App.config.CHART_COLORS.primary + '20',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { stepSize: 1 }
                            }
                        }
                    }
                });
            }
        },

        createRegionChart() {
            const regionCtx = document.getElementById('regionChart');
            if (regionCtx && !App.state.charts.instances.region) {
                App.state.charts.instances.region = new Chart(regionCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: [
                                App.config.CHART_COLORS.primary,
                                App.config.CHART_COLORS.success,
                                App.config.CHART_COLORS.warning,
                                App.config.CHART_COLORS.danger,
                                App.config.CHART_COLORS.orange
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }
        },

        createGenderChart() {
            const genderCtx = document.getElementById('genderChart');
            if (genderCtx && !App.state.charts.instances.gender) {
                App.state.charts.instances.gender = new Chart(genderCtx, {
                    type: 'pie',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: [App.config.CHART_COLORS.primary, App.config.CHART_COLORS.warning]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }
        },

        createAgeChart() {
            const ageCtx = document.getElementById('ageChart');
            if (ageCtx && !App.state.charts.instances.age) {
                App.state.charts.instances.age = new Chart(ageCtx, {
                    type: 'bar',
                    data: {
                        labels: ['데이터 로딩 중...'],
                        datasets: [{
                            data: [1],
                            backgroundColor: App.config.CHART_COLORS.success,
                            borderColor: App.config.CHART_COLORS.success,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        },

        createRadarChart() {
            const radarCtx = document.getElementById('radarChart');
            if (radarCtx && !App.state.charts.instances.radar) {
                App.state.charts.instances.radar = new Chart(radarCtx, {
                    type: 'radar',
                    data: {
                        labels: ['지원자 수', '면접확정률', '합격률', '입과율'],
                        datasets: [{
                            label: '데이터 로딩 중...',
                            data: [1, 1, 1, 1],
                            borderColor: App.config.CHART_COLORS.primary,
                            backgroundColor: App.config.CHART_COLORS.primary + '30',
                            pointBackgroundColor: App.config.CHART_COLORS.primary,
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: App.config.CHART_COLORS.primary
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        elements: {
                            line: {
                                borderWidth: 3
                            }
                        },
                        scales: {
                            r: {
                                angleLines: {
                                    display: false
                                },
                                suggestedMin: 0,
                                suggestedMax: 100
                            }
                        }
                    }
                });
            }
        },

        createScatterChart() {
            const scatterCtx = document.getElementById('scatterChart');
            if (scatterCtx && !App.state.charts.instances.scatter) {
                App.state.charts.instances.scatter = new Chart(scatterCtx, {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: '나이-합격률 관계',
                            data: [{ x: 25, y: 50 }],
                            backgroundColor: App.config.CHART_COLORS.orange,
                            borderColor: App.config.CHART_COLORS.orange,
                            pointRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                type: 'linear',
                                position: 'bottom',
                                title: {
                                    display: true,
                                    text: '나이'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: '합격률 (%)'
                                },
                                min: 0,
                                max: 100
                            }
                        }
                    }
                });
            }
        },

        updateData(filteredData) {
            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const positionIndex = App.state.data.headers.indexOf('모집분야');

            App.charts.updateRouteChart(filteredData, routeIndex);
            App.charts.updatePositionChart(filteredData, positionIndex);
            App.charts.updateRegionChart(filteredData);
            App.charts.updateGenderChart(filteredData);
            App.charts.updateAgeChart(filteredData);
        },

        updateEfficiencyCharts(filteredData) {
            App.charts.updateRadarChart(filteredData);
            App.charts.updateScatterChart(filteredData);
        },

        updateRouteChart(filteredData, routeIndex) {
            if (routeIndex !== -1 && App.state.charts.instances.route) {
                const routeData = {};
                filteredData.forEach(row => {
                    const route = String(row[routeIndex] || '').trim();
                    if (route) {
                        routeData[route] = (routeData[route] || 0) + 1;
                    }
                });

                App.state.charts.instances.route.data.labels = Object.keys(routeData);
                App.state.charts.instances.route.data.datasets[0].data = Object.values(routeData);
                App.state.charts.instances.route.update();
            }
        },

        updatePositionChart(filteredData, positionIndex) {
            if (positionIndex !== -1 && App.state.charts.instances.position) {
                const positionData = {};
                filteredData.forEach(row => {
                    const position = String(row[positionIndex] || '').trim();
                    if (position) {
                        positionData[position] = (positionData[position] || 0) + 1;
                    }
                });

                App.state.charts.instances.position.data.labels = Object.keys(positionData);
                App.state.charts.instances.position.data.datasets[0].data = Object.values(positionData);
                App.state.charts.instances.position.update();
            }
        },

        updateRegionChart(filteredData) {
            const addressIndex = App.state.data.headers.indexOf('지역');

            if (addressIndex === -1 || !App.state.charts.instances.region) return;

            const regionData = {};

            filteredData.forEach(row => {
                const address = String(row[addressIndex] || '').trim();
                if (!address || address === '-') return;

                let region = App.utils.extractRegion(address);
                regionData[region] = (regionData[region] || 0) + 1;
            });

            if (Object.keys(regionData).length === 0) {
                App.state.charts.instances.region.data.labels = ['데이터 없음'];
                App.state.charts.instances.region.data.datasets[0].data = [1];
            } else {
                App.state.charts.instances.region.data.labels = Object.keys(regionData);
                App.state.charts.instances.region.data.datasets[0].data = Object.values(regionData);
            }

            App.state.charts.instances.region.update();
        },

        updateGenderChart(filteredData) {
            const genderIndex = App.state.data.headers.indexOf('성별');

            if (genderIndex === -1 || !App.state.charts.instances.gender) return;

            const genderData = {};

            filteredData.forEach(row => {
                const gender = String(row[genderIndex] || '').trim();
                if (!gender || gender === '-') return;

                genderData[gender] = (genderData[gender] || 0) + 1;
            });

            if (Object.keys(genderData).length === 0) {
                App.state.charts.instances.gender.data.labels = ['데이터 없음'];
                App.state.charts.instances.gender.data.datasets[0].data = [1];
            } else {
                App.state.charts.instances.gender.data.labels = Object.keys(genderData);
                App.state.charts.instances.gender.data.datasets[0].data = Object.values(genderData);
            }

            App.state.charts.instances.gender.update();
        },

        updateAgeChart(filteredData) {
            const ageIndex = App.state.data.headers.indexOf('나이');

            if (ageIndex === -1 || !App.state.charts.instances.age) return;

            const ageGroupData = {
                '20대 이하': 0,
                '30대': 0,
                '40대': 0,
                '50대': 0,
                '60대 이상': 0
            };

            filteredData.forEach(row => {
                const ageStr = String(row[ageIndex] || '').trim();
                if (!ageStr || ageStr === '-') return;

                const age = parseInt(ageStr, 10);
                if (isNaN(age)) return;

                if (age <= 29) ageGroupData['20대 이하']++;
                else if (age <= 39) ageGroupData['30대']++;
                else if (age <= 49) ageGroupData['40대']++;
                else if (age <= 59) ageGroupData['50대']++;
                else ageGroupData['60대 이상']++;
            });

            App.state.charts.instances.age.data.labels = Object.keys(ageGroupData);
            App.state.charts.instances.age.data.datasets[0].data = Object.values(ageGroupData);
            App.state.charts.instances.age.update();
        },

        updateRadarChart(filteredData) {
            if (!App.state.charts.instances.radar) return;

            const routeIndex = App.state.data.headers.indexOf('지원루트');
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');

            if (routeIndex === -1) return;

            const routes = [...new Set(filteredData.map(row => String(row[routeIndex] || '').trim()).filter(Boolean))];
            const colors = [
                App.config.CHART_COLORS.primary,
                App.config.CHART_COLORS.success,
                App.config.CHART_COLORS.warning,
                App.config.CHART_COLORS.danger,
                App.config.CHART_COLORS.orange
            ];

            const datasets = routes.slice(0, 5).map((route, index) => {
                const routeData = filteredData.filter(row => String(row[routeIndex] || '').trim() === route);
                const totalApplicants = routeData.length;

                let interviewConfirmRate = 0;
                if (contactResultIndex !== -1) {
                    const confirmed = routeData.filter(row => String(row[contactResultIndex] || '').trim() === '면접확정').length;
                    interviewConfirmRate = totalApplicants > 0 ? (confirmed / totalApplicants) * 100 : 0;
                }

                let passRate = 0;
                if (interviewResultIndex !== -1 && contactResultIndex !== -1) {
                    const confirmed = routeData.filter(row => String(row[contactResultIndex] || '').trim() === '면접확정');
                    const passed = confirmed.filter(row => String(row[interviewResultIndex] || '').trim() === '합격');
                    passRate = confirmed.length > 0 ? (passed.length / confirmed.length) * 100 : 0;
                }

                let joinRate = 0;
                if (joinDateIndex !== -1) {
                    const joined = routeData.filter(row => {
                        const joinDate = String(row[joinDateIndex] || '').trim();
                        return joinDate !== '' && joinDate !== '-';
                    }).length;
                    joinRate = totalApplicants > 0 ? (joined / totalApplicants) * 100 : 0;
                }

                const maxApplicants = Math.max(...routes.slice(0, 5).map(r => 
                    filteredData.filter(row => String(row[routeIndex] || '').trim() === r).length
                ));
                const normalizedApplicants = maxApplicants > 0 ? (totalApplicants / maxApplicants) * 100 : 0;

                return {
                    label: route,
                    data: [normalizedApplicants, interviewConfirmRate, passRate, joinRate],
                    borderColor: colors[index],
                    backgroundColor: colors[index] + '30',
                    pointBackgroundColor: colors[index],
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: colors[index]
                };
            });

            App.state.charts.instances.radar.data.datasets = datasets;
            App.state.charts.instances.radar.update();
        },

        updateScatterChart(filteredData) {
            if (!App.state.charts.instances.scatter) return;

            const ageIndex = App.state.data.headers.indexOf('나이');
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');

            if (ageIndex === -1 || contactResultIndex === -1 || interviewResultIndex === -1) return;

            const ageGroups = {};
            
            filteredData.forEach(row => {
                const ageStr = String(row[ageIndex] || '').trim();
                const contactResult = String(row[contactResultIndex] || '').trim();
                const interviewResult = String(row[interviewResultIndex] || '').trim();

                if (!ageStr || ageStr === '-' || contactResult !== '면접확정') return;

                const age = parseInt(ageStr, 10);
                if (isNaN(age)) return;

                if (!ageGroups[age]) {
                    ageGroups[age] = { total: 0, passed: 0 };
                }

                ageGroups[age].total++;
                if (interviewResult === '합격') {
                    ageGroups[age].passed++;
                }
            });

            const scatterData = Object.entries(ageGroups)
                .filter(([age, data]) => data.total >= 2)
                .map(([age, data]) => ({
                    x: parseInt(age),
                    y: Math.round((data.passed / data.total) * 100)
                }));

            if (scatterData.length === 0) {
                scatterData.push({ x: 25, y: 0 }, { x: 35, y: 0 }, { x: 45, y: 0 });
            }

            App.state.charts.instances.scatter.data.datasets[0].data = scatterData;
            App.state.charts.instances.scatter.update();
        }
    },

    // =========================
    // 효율성 분석 관련
    // =========================
    efficiency: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('efficiencyPeriodFilter').value;
            const customRange = document.getElementById('efficiencyCustomDateRange');

            if (selectedPeriod === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                App.efficiency.updateAll();
            }
        },

        updateAll() {
            const selectedPeriod = document.getElementById('efficiencyPeriodFilter')?.value || 'all';
            const filteredData = App.efficiency.getFilteredData(selectedPeriod);
            
            App.efficiency.update(filteredData);
            if (App.state.charts.instances.radar || App.state.charts.instances.scatter) {
                App.charts.updateEfficiencyCharts(filteredData);
            }
        },

        getFilteredData(selectedPeriod) {
            const applyDateIndex = App.state.data.headers.indexOf('지원일');
            let filteredData = [...App.state.data.all];

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                if (selectedPeriod === 'custom') {
                    const startDate = document.getElementById('efficiencyStartDate')?.value;
                    const endDate = document.getElementById('efficiencyEndDate')?.value;

                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);

                        filteredData = App.state.data.all.filter(row => {
                            try {
                                const dateValue = row[applyDateIndex];
                                if (!dateValue) return false;
                                const date = new Date(dateValue);
                                return date >= start && date <= end;
                            } catch (e) { return false; }
                        });
                    }
                } else {
                    const now = new Date();
                    const result = App.utils.filterDataByPeriod(App.state.data.all, selectedPeriod, applyDateIndex, now);
                    filteredData = result.data;
                }
            }

            return filteredData;
        },

        switchTab(tabName) {
            App.state.charts.currentEfficiencyTab = tabName;

            document.querySelectorAll('.efficiency-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabName);
            });

            App.efficiency.update();
        },

        update(filteredData = null) {
            if (!filteredData) {
                const selectedPeriod = document.getElementById('efficiencyPeriodFilter')?.value || 'all';
                filteredData = App.efficiency.getFilteredData(selectedPeriod);
            }

            const contentDiv = document.getElementById('efficiencyTabContent');

            if (App.state.charts.currentEfficiencyTab === 'route') {
                App.efficiency.updateRoute(filteredData);
            } else if (App.state.charts.currentEfficiencyTab === 'recruiter') {
                App.efficiency.updateRecruiter(filteredData);
            } else if (App.state.charts.currentEfficiencyTab === 'interviewer') {
                App.efficiency.updateInterviewer(filteredData);
            }
        },

        updateRoute(filteredData) {
            try {
                const routeIndex = App.state.data.headers.indexOf('지원루트');

                if (routeIndex === -1) {
                    document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">지원루트 데이터를 찾을 수 없습니다.</p>';
                    return;
                }

                const routeStats = App.efficiency.calculateStats(filteredData, routeIndex);
                App.efficiency.renderTable(routeStats, '지원루트');

            } catch (error) {
                console.error('지원루트 효율성 분석 업데이트 실패:', error);
                document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
            }
        },

        updateRecruiter(filteredData) {
            try {
                const recruiterIndex = App.state.data.headers.indexOf('증원자');

                if (recruiterIndex === -1) {
                    document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">증원자 데이터를 찾을 수 없습니다.</p>';
                    return;
                }

                const recruiterStats = App.efficiency.calculateStats(filteredData, recruiterIndex);
                App.efficiency.renderTable(recruiterStats, '증원자');

            } catch (error) {
                console.error('증원자별 효율성 분석 업데이트 실패:', error);
                document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
            }
        },

        updateInterviewer(filteredData) {
            try {
                const interviewerIndex = App.state.data.headers.indexOf('면접자');

                if (interviewerIndex === -1) {
                    document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">면접자 데이터를 찾을 수 없습니다.</p>';
                    return;
                }

                const interviewerStats = App.efficiency.calculateStats(filteredData, interviewerIndex);
                App.efficiency.renderTable(interviewerStats, '면접자');

            } catch (error) {
                console.error('면접관별 효율성 분석 업데이트 실패:', error);
                document.getElementById('efficiencyTabContent').innerHTML = '<p style="text-align: center; padding: 20px; color: var(--danger);">분석 중 오류가 발생했습니다.</p>';
            }
        },

        calculateStats(filteredData, categoryIndex) {
            const contactResultIndex = App.state.data.headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = App.state.data.headers.indexOf('면접결과');
            const joinDateIndex = App.state.data.headers.indexOf('입과일');

            const stats = {};

            filteredData.forEach(row => {
                const category = String(row[categoryIndex] || '').trim();
                if (!category || category === '-') return;

                if (!stats[category]) {
                    stats[category] = {
                        total: 0,
                        contacted: 0,
                        interviewConfirmed: 0,
                        passed: 0,
                        joined: 0
                    };
                }

                stats[category].total++;

                if (contactResultIndex !== -1) {
                    const contactResult = String(row[contactResultIndex] || '').trim();
                    if (contactResult !== '' && contactResult !== '-') {
                        stats[category].contacted++;
                    }

                    if (contactResult === '면접확정') {
                        stats[category].interviewConfirmed++;
                    }
                }

                if (interviewResultIndex !== -1) {
                    const interviewResult = String(row[interviewResultIndex] || '').trim();
                    if (interviewResult === '합격') {
                        stats[category].passed++;
                    }
                }

                if (joinDateIndex !== -1) {
                    const joinDate = String(row[joinDateIndex] || '').trim();
                    if (joinDate !== '' && joinDate !== '-') {
                        stats[category].joined++;
                    }
                }
            });

            return stats;
        },

        renderTable(stats, categoryName) {
            const dataArray = Object.entries(stats).map(([name, data]) => {
                const interviewConfirmRate = data.total > 0 ? (data.interviewConfirmed / data.total) * 100 : 0;
                const passRate = data.interviewConfirmed > 0 ? (data.passed / data.interviewConfirmed) * 100 : 0;
                const joinRate = data.total > 0 ? (data.joined / data.total) * 100 : 0;
                const volumeWeight = Math.min(data.total / Math.max(...Object.values(stats).map(s => s.total)), 1) * 100;

                const efficiencyScore = (joinRate * 0.4) + (passRate * 0.3) + (interviewConfirmRate * 0.2) + (volumeWeight * 0.1);

                return {
                    name,
                    ...data,
                    interviewConfirmRate: Math.round(interviewConfirmRate),
                    passRate: Math.round(passRate),
                    joinRate: Math.round(joinRate),
                    efficiencyScore: Math.round(efficiencyScore * 10) / 10
                };
            }).sort((a, b) => b.efficiencyScore - a.efficiencyScore);

            let tableHtml = `
                <div style="overflow-x: auto;">
                    <table class="efficiency-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                        <thead>
                            <tr style="background: var(--main-bg);">
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid var(--border-color); font-weight: 600;">${categoryName}</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">총 지원자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">면접확정</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">합격자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">입과자</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">면접확정률</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">합격률</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600; color: var(--accent-orange);">최종 입과율</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid var(--border-color); font-weight: 600;">효율성 점수</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            dataArray.forEach((item, index) => {
                const rankColor = index === 0 ? 'var(--success)' : index === 1 ? 'var(--warning)' : index === 2 ? 'var(--accent-orange)' : 'var(--text-primary)';
                const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                const rankClass = index === 0 ? 'efficiency-rank-1' : index === 1 ? 'efficiency-rank-2' : index === 2 ? 'efficiency-rank-3' : '';

                tableHtml += `
                    <tr class="${rankClass}" style="border-bottom: 1px solid var(--border-color); transition: all 0.2s ease;" onmouseover="this.style.transform='translateX(2px)'" onmouseout="this.style.transform='translateX(0)'">
                        <td style="padding: 12px; font-weight: 600; color: ${rankColor};">${rankIcon} ${item.name}</td>
                        <td style="padding: 12px; text-align: center; font-weight: 500;">${item.total.toLocaleString()}</td>
                        <td style="padding: 12px; text-align: center;">${item.interviewConfirmed}</td>
                        <td style="padding: 12px; text-align: center;">${item.passed}</td>
                        <td style="padding: 12px; text-align: center;">${item.joined}</td>
                        <td style="padding: 12px; text-align: center;">${item.interviewConfirmRate}%</td>
                        <td style="padding: 12px; text-align: center;">${item.passRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: var(--accent-orange);">${item.joinRate}%</td>
                        <td style="padding: 12px; text-align: center; font-weight: bold; color: ${rankColor}; font-size: 1.1rem;">${item.efficiencyScore}</td>
                    </tr>
                `;
            });

            tableHtml += `
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 15px; padding: 15px; background: var(--main-bg); border-radius: 8px; font-size: 0.85rem; color: var(--text-secondary);">
                    <strong>📊 효율성 점수 계산법:</strong> (입과율 × 0.4) + (합격률 × 0.3) + (면접확정률 × 0.2) + (총지원자수 가중치 × 0.1)
                </div>
            `;

            document.getElementById('efficiencyTabContent').innerHTML = tableHtml;
        }
    },

    // =========================
    // 추이 분석 관련
    // =========================
    trend: {
        switchTab(period) {
            App.state.charts.currentTrendTab = period;

            document.querySelectorAll('.trend-tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.period === period);
            });

            App.trend.update();
        },

        update(filteredData = null, applyDateIndex = null) {
            if (!applyDateIndex) {
                applyDateIndex = App.state.data.headers.indexOf('지원일');
            }

            if (applyDateIndex === -1 || !App.state.charts.instances.trend) return;

            let trendData = {};
            let labels = [];

            if (App.state.charts.currentTrendTab === 'all') {
                const result = App.trend.getAllTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            } else if (App.state.charts.currentTrendTab === 'year') {
                const result = App.trend.getYearTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            } else if (App.state.charts.currentTrendTab === 'month') {
                const result = App.trend.getMonthTrendData(applyDateIndex);
                trendData = result.data;
                labels = result.labels;
            }

            App.state.charts.instances.trend.data.labels = labels;
            App.state.charts.instances.trend.data.datasets[0].data = Object.values(trendData);
            App.state.charts.instances.trend.update();
        },

        getAllTrendData(applyDateIndex) {
            const trendData = {};

            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                trendData[key] = 0;
            }

            App.state.data.all.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    if (trendData.hasOwnProperty(key)) {
                        trendData[key]++;
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(key => {
                const [year, month] = key.split('-');
                return `${year}.${month}`;
            });

            return { data: trendData, labels };
        },

        getYearTrendData(applyDateIndex) {
            const trendData = {};
            const currentYear = new Date().getFullYear();

            for (let i = 4; i >= 0; i--) {
                const year = currentYear - i;
                trendData[year] = 0;
            }

            App.state.data.all.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    const year = date.getFullYear();
                    if (trendData.hasOwnProperty(year)) {
                        trendData[year]++;
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(year => `${year}년`);

            return { data: trendData, labels };
        },

        getMonthTrendData(applyDateIndex) {
            const trendData = {};
            const currentYear = new Date().getFullYear();

            for (let i = 1; i <= 12; i++) {
                const key = `${currentYear}-${i.toString().padStart(2, '0')}`;
                trendData[key] = 0;
            }

            App.state.data.all.forEach(row => {
                if (!row[applyDateIndex]) return;
                try {
                    const date = new Date(row[applyDateIndex]);
                    if (date.getFullYear() === currentYear) {
                        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                        if (trendData.hasOwnProperty(key)) {
                            trendData[key]++;
                        }
                    }
                } catch (e) {}
            });

            const labels = Object.keys(trendData).map(key => {
                const [year, month] = key.split('-');
                return `${month}월`;
            });

            return { data: trendData, labels };
        }
    },

    // =========================
    // 유틸리티 함수들 (utils.js에서 가져옴)
    // =========================
    utils: Utils
};

// =========================
// 🔥 핵심: 전역 객체로 노출
// =========================
window.App = App;

// =========================
// 전역에서 사용되는 함수들 (하위 호환성)
// =========================

// 모달 관련
window.onclick = function(event) {
    if (event.target == App.modal.element) App.modal.close();
}

// =========================
// 애플리케이션 시작
// =========================

document.addEventListener('DOMContentLoaded', () => {
    App.init.start();
});
