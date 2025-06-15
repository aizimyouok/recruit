// js/main.js

import { EventBus } from './core/EventBus.js';
import { StateManager } from './core/StateManager.js';
import { DataService } from './services/DataService.js';

// =========================
// 애플리케이션 메인 객체
// =========================
const App = {
    // =========================
    // 설정 및 상수
    // =========================
    config: {
        APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby3-nGn2KZCc49NIELYgr3_Wp_vUElARftdXuIEk-V2dh3Fb9p2yqe3fN4JhIVqpZR2/exec',
        ITEMS_PER_PAGE: 30,
        DEFAULT_HIDDEN_COLUMNS: ['비고', '부재', '거절', '보류', '면접확정', '면접 날짜', '면접 시간', '미참석', '불합격/보류', '입과/출근', '입과일', '지점배치', '면접리뷰'],
        REQUIRED_FIELDS: ['이름', '연락처', '지원루트', '모집분야'],
        DROPDOWN_OPTIONS: {
            '지원루트': ['사람인', '잡코리아', '인크루트', '아웃바운드', '배우공고', '당근', 'Instagram', 'Threads', '직접입력'],
            '모집분야': ['영업', '강사', '상조', '직접입력'],
            '성별': ['남', '여'],
            '증원자': ['회사', '이성진', '김영빈', '최혜진', '직접입력'],
            '1차 컨택 결과': ['부재1회', '부재2회', '보류', '거절', '파기', '면접확정'],
            '면접자': ['이성진', '김영빈', '최혜진', '직접입력'],
            '면접결과': ['미참석', '불합격', '보류', '합격']
        },
        DATE_FIELDS: ['면접 날짜', '면접 날자', '입과일'],
        TIME_FIELDS: ['면접 시간'],
        CHART_COLORS: {
            primary: '#818cf8',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            orange: '#fb923c'
        }
    },

    // =========================
    // 내부 모듈 인스턴스들
    // =========================
    _modules: {
        eventBus: null,
        stateManager: null,
        dataService: null
    },

    // =========================
    // 애플리케이션 상태 접근자
    // =========================
    get state() {
        return this._modules.stateManager?.state || {
            data: { all: [], filtered: [], headers: [] },
            ui: { 
                currentPage: 1, 
                totalPages: 1, 
                visibleColumns: {}, 
                nextSequenceNumber: 1,
                currentSortColumn: '지원일',
                currentSortDirection: 'desc',
                activeDateMode: 'all',
                currentView: 'table',
                searchTerm: '',
                currentEditingData: null
            },
            charts: { instances: {}, currentEfficiencyTab: 'route', currentTrendTab: 'all' }
        };
    },

// =========================
    // 사이드바 관련 (추가됨)
    // =========================
    sidebar: {
        handlePeriodChange() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter')?.value || 'all';
            const customRange = document.getElementById('sidebarCustomDateRange');

            if (selectedPeriod === 'custom') {
                if (customRange) customRange.style.display = 'block';
            } else {
                if (customRange) customRange.style.display = 'none';
                App.sidebar.updateWidgets();
            }
        },

        updateWidgets() {
            const selectedPeriod = document.getElementById('sidebarPeriodFilter')?.value || 'all';
            const applyDateIndex = App.state.data?.headers?.indexOf('지원일') ?? -1;

            let filteredApplicants = [...(App.state.data?.all || [])];
            let periodLabel = '전체 기간';

            if (applyDateIndex !== -1 && selectedPeriod !== 'all') {
                const result = App.sidebar.filterByPeriod(filteredApplicants, selectedPeriod, applyDateIndex);
                filteredApplicants = result.data;
                periodLabel = result.label;
            }

            const stats = App.sidebar.calculateStats(filteredApplicants);
            App.sidebar.updateUI(stats, periodLabel);

            // 통계 페이지가 활성화되어 있으면 업데이트
            if (document.getElementById('stats')?.classList.contains('active')) {
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
            const headers = App.state.data?.headers || [];
            const contactResultIndex = headers.indexOf('1차 컨택 결과');
            const interviewResultIndex = headers.indexOf('면접결과');
            const joinDateIndex = headers.indexOf('입과일');

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
            App.utils.updateElement('sidebarTotalApplicants', stats.totalCount);
            App.utils.updateElement('sidebarPeriodLabel', periodLabel);
            App.utils.updateElement('sidebarInterviewPending', stats.interviewPendingCount);
            App.utils.updateElement('sidebarSuccessRate', stats.successRate + '%');
            App.utils.updateElement('sidebarJoinRate', stats.joinRate + '%');
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

            if (!App.state.data?.headers) return;

            App.state.data.headers.forEach((header, index) => {
                const formGroup = document.createElement('div');
                formGroup.className = `form-group ${header === '비고' || header === '면접리뷰' ? 'full-width' : ''}`;

                const isRequired = App.config.REQUIRED_FIELDS.includes(header) && !isReadOnly;

                let value = '';
                if (data) {
                    value = String(data[index] || '');
                } else {
                    if (header === '구분') value = App.state.ui?.nextSequenceNumber || 1;
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
            if (!customInput) return;
            
            const isDirectInput = selectElement.value === '직접입력';

            customInput.style.display = isDirectInput ? 'block' : 'none';
            if(isDirectInput) customInput.focus();

            const isRequired = document.querySelector(`label[for="modal-form-${fieldName}"]`)?.textContent.includes('*');
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
            if (!saveBtn) return;
            
            const originalText = saveBtn.innerHTML;

            try {
                const applicantData = App.modal.collectFormData();

                if (!App.modal.validateFormData(applicantData)) {
                    alert('필수 항목을 모두 입력해주세요.');
                    return;
                }

                if (App.state.data?.headers?.includes('구분')) {
                    applicantData['구분'] = String(App.state.ui?.nextSequenceNumber || 1);
                }
                if (App.state.data?.headers?.includes('지원일')) {
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
            if (!saveBtn) return;
            
            const originalText = saveBtn.innerHTML;

            try {
                const updatedData = App.modal.collectFormData();

                if (!App.modal.validateFormData(updatedData)) {
                    alert('필수 항목을 모두 입력해주세요.');
                    return;
                }

                App.modal.prepareTimeData(updatedData);

                const gubunIndex = App.state.data?.headers?.indexOf('구분') ?? -1;
                if (gubunIndex === -1 || !App.state.ui?.currentEditingData) {
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
            if (!App.state.ui?.currentEditingData) {
                alert('삭제할 데이터가 없습니다.');
                return;
            }

            const gubunIndex = App.state.data?.headers?.indexOf('구분') ?? -1;
            const nameIndex = App.state.data?.headers?.indexOf('이름') ?? -1;

            if (gubunIndex === -1) {
                alert('삭제를 위한 고유 식별자(구분)를 찾을 수 없습니다.');
                return;
            }

            const gubunValue = App.state.ui.currentEditingData[gubunIndex];
            const applicantName = nameIndex !== -1 ? App.state.ui.currentEditingData[nameIndex] || '해당 지원자' : '해당 지원자';

            if (!confirm(`정말로 '${applicantName}' 님의 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                return;
            }

            const deleteBtn = document.querySelector('.modal-delete-btn');
            if (!deleteBtn) return;
            
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
            if (!App.state.data?.headers) return applicantData;
            
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
            return data;
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
            const navItem = document.querySelector(`.nav-item[onclick="App.navigation.switchPage('${pageId}')"]`);
            if (navItem) navItem.classList.add('active');

            const titles = { dashboard: '지원자 현황', stats: '통계 분석' };
            const titleElement = document.getElementById('pageTitle');
            if (titleElement) titleElement.textContent = titles[pageId] || pageId;

            // 모바일에서 페이지 전환 시 사이드바 닫기
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
            if (sidebar) sidebar.classList.toggle('mobile-open');
            if (overlay) overlay.classList.toggle('show');
        },

        toggleColumnDropdown() {
            const dropdown = document.getElementById('columnToggleDropdown');
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            }
        },

        handleColumnToggle(event, columnName) {
            if (App.state.ui?.visibleColumns) {
                App.state.ui.visibleColumns[columnName] = event.target.checked;
                App.filter.apply();
            }
        },

        setupColumnToggles() {
            const dropdown = document.getElementById('columnToggleDropdown');
            if (!dropdown || !App.state.data?.headers) return;
            
            dropdown.innerHTML = '';
            App.state.data.headers.forEach(header => {
                const item = document.createElement('div');
                item.className = 'column-toggle-item';
                const isChecked = App.state.ui?.visibleColumns?.[header] ? 'checked' : '';
                item.innerHTML = `<input type="checkbox" id="toggle-${header}" ${isChecked} onchange="App.ui.handleColumnToggle(event, '${header}')"><label for="toggle-${header}">${header}</label>`;
                dropdown.appendChild(item);
            });
        }
    },

    // =========================
    // 검색 관련
    // =========================
    search: {
        handle() {
            if (App.state.ui?.searchTimeout) {
                clearTimeout(App.state.ui.searchTimeout);
            }

            const searchTimeout = setTimeout(() => {
                const searchInput = document.getElementById('globalSearch');
                if (searchInput && App.state.ui) {
                    App.state.ui.searchTerm = String(searchInput.value || '').toLowerCase();
                    App.state.ui.currentPage = 1;
                    App.filter.apply();
                }
            }, 300);

            if (App.state.ui) {
                App.state.ui.searchTimeout = searchTimeout;
            }
        }
    },

    // =========================
    // 필터 관련
    // =========================
    filter: {
        apply() {
            let data = [...(App.state.data?.all || [])];
            
            const routeFilter = document.getElementById('routeFilter')?.value || 'all';
            const positionFilter = document.getElementById('positionFilter')?.value || 'all';
            const applyDateIndex = App.state.data?.headers?.indexOf('지원일') ?? -1;
            const routeIndex = App.state.data?.headers?.indexOf('지원루트') ?? -1;
            const positionIndex = App.state.data?.headers?.indexOf('모집분야') ?? -1;

            // 검색어 필터
            if (App.state.ui?.searchTerm) {
                data = data.filter(row => row.some(cell => String(cell || '').toLowerCase().includes(App.state.ui.searchTerm)));
            }

            // 지원루트 필터
            if (routeFilter !== 'all' && routeIndex !== -1) {
                data = data.filter(row => String(row[routeIndex] || '') === routeFilter);
            }

            // 모집분야 필터
            if (positionFilter !== 'all' && positionIndex !== -1) {
                data = data.filter(row => String(row[positionIndex] || '') === positionFilter);
            }

            // 날짜 필터
            if (applyDateIndex !== -1 && App.state.ui?.activeDateMode !== 'all') {
                data = App.filter.applyDateFilter(data, applyDateIndex);
            }

            // 정렬 적용
            data = App.utils.sortData(data);

            // 상태 업데이트
            if (App.state.data) {
                App.state.data.filtered = data;
            }

            // 페이지네이션 업데이트
            App.pagination.updateTotal();
            App.filter.updateSummary();

            // 렌더링
            const pageData = App.pagination.getCurrentPageData();
            if (App.state.ui?.currentView === 'table') {
                App.render.table(pageData);
            } else {
                App.render.cards(pageData);
            }

            App.pagination.updateUI();
        },

        applyDateFilter(data, applyDateIndex) {
            // 간단한 날짜 필터 구현
            return data;
        },

        reset(runApplyFilters = true) {
            document.querySelectorAll('.filter-bar select').forEach(select => select.value = 'all');
            const globalSearch = document.getElementById('globalSearch');
            if (globalSearch) globalSearch.value = '';
            
            if (App.state.ui) {
                App.state.ui.searchTerm = '';
                App.state.ui.activeDateMode = 'all';
                App.state.ui.currentPage = 1;
            }
            
            App.filter.updateDateFilterUI();
            if (runApplyFilters) {
                App.filter.apply();
            }
        },

        updateSummary() {
            const filteredCount = App.state.data?.filtered?.length || 0;
            const searchText = App.state.ui?.searchTerm ? ` (검색: "${App.state.ui.searchTerm}")` : '';
            const pageInfo = filteredCount > App.config.ITEMS_PER_PAGE ? ` - ${App.state.ui?.currentPage || 1}/${App.state.ui?.totalPages || 1} 페이지` : '';
            
            const summaryElement = document.getElementById('filterSummary');
            if (summaryElement) {
                summaryElement.innerHTML = `<strong>지원자:</strong> ${filteredCount}명${searchText}${pageInfo}`;
            }
        },

        populateDropdowns() {
            const routeIndex = App.state.data?.headers?.indexOf('지원루트') ?? -1;
            const positionIndex = App.state.data?.headers?.indexOf('모집분야') ?? -1;

            if (routeIndex !== -1 && App.state.data?.all) {
                const routes = [...new Set(App.state.data.all.map(row => String(row[routeIndex] || '').trim()).filter(Boolean))];
                const routeFilter = document.getElementById('routeFilter');
                if (routeFilter) {
                    routeFilter.innerHTML = '<option value="all">전체</option>';
                    routes.sort().forEach(route => routeFilter.innerHTML += `<option value="${route}">${route}</option>`);
                }
            }

            if (positionIndex !== -1 && App.state.data?.all) {
                const positions = [...new Set(App.state.data.all.map(row => String(row[positionIndex] || '').trim()).filter(Boolean))];
                const positionFilter = document.getElementById('positionFilter');
                if (positionFilter) {
                    positionFilter.innerHTML = '<option value="all">전체</option>';
                    positions.sort().forEach(pos => positionFilter.innerHTML += `<option value="${pos}">${pos}</option>`);
                }
            }
        },

        updateDateFilterUI() {
            document.querySelectorAll('.date-mode-btn').forEach(btn =>
                btn.classList.toggle('active', btn.dataset.mode === (App.state.ui?.activeDateMode || 'all'))
            );

            const container = document.getElementById('dateInputsContainer');
            if (container) {
                if ((App.state.ui?.activeDateMode || 'all') === 'all') {
                    container.innerHTML = `<span style="color: var(--text-secondary); font-size: 0.9rem; padding: 0 10px;">모든 데이터 표시</span>`;
                } else {
                    container.innerHTML = '';
                }
            }
        }
    },

    // =========================
    // 페이지네이션 관련
    // =========================
    pagination: {
        updateTotal() {
            const filteredLength = App.state.data?.filtered?.length || 0;
            const totalPages = Math.ceil(filteredLength / App.config.ITEMS_PER_PAGE);
            
            if (App.state.ui) {
                App.state.ui.totalPages = totalPages;
                if (App.state.ui.currentPage > totalPages && totalPages > 0) {
                    App.state.ui.currentPage = totalPages;
                } else if (totalPages === 0) {
                    App.state.ui.currentPage = 1;
                }
            }
        },

        getCurrentPageData() {
            const filtered = App.state.data?.filtered || [];
            const currentPage = App.state.ui?.currentPage || 1;
            const startIndex = (currentPage - 1) * App.config.ITEMS_PER_PAGE;
            const endIndex = Math.min(startIndex + App.config.ITEMS_PER_PAGE, filtered.length);
            return filtered.slice(startIndex, endIndex);
        },

        goToPage(page) {
            const totalPages = App.state.ui?.totalPages || 1;
            if (page >= 1 && page <= totalPages && App.state.ui) {
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
            const currentPage = App.state.ui?.currentPage || 1;
            App.pagination.goToPage(currentPage - 1);
        },

        goToNextPage() {
            const currentPage = App.state.ui?.currentPage || 1;
            App.pagination.goToPage(currentPage + 1);
        },

        goToLastPage() {
            const totalPages = App.state.ui?.totalPages || 1;
            App.pagination.goToPage(totalPages);
        },

        updateUI() {
            const paginationContainer = document.getElementById('paginationContainer');
            const paginationInfo = document.getElementById('paginationInfo');
            
            if (!paginationContainer || !paginationInfo) return;

            const filteredLength = App.state.data?.filtered?.length || 0;
            
            if (filteredLength === 0) {
                paginationContainer.style.display = 'none';
                return;
            }

            paginationContainer.style.display = 'flex';

            const currentPage = App.state.ui?.currentPage || 1;
            const totalPages = App.state.ui?.totalPages || 1;
            const startItem = (currentPage - 1) * App.config.ITEMS_PER_PAGE + 1;
            const endItem = Math.min(currentPage * App.config.ITEMS_PER_PAGE, filteredLength);
            
            paginationInfo.textContent = `${startItem}-${endItem} / ${filteredLength}명`;

            // 버튼 상태 업데이트
            const firstPageBtn = document.getElementById('firstPageBtn');
            const prevPageBtn = document.getElementById('prevPageBtn');
            const nextPageBtn = document.getElementById('nextPageBtn');
            const lastPageBtn = document.getElementById('lastPageBtn');

            if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
            if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
            if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
            if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
        }
    },

    // =========================
    // 뷰 관련
    // =========================
    view: {
        switch(viewType) {
            if (App.state.ui) {
                App.state.ui.currentView = viewType;
            }
            
            const tableView = document.getElementById('tableView');
            const cardsView = document.getElementById('cardsView');
            const viewBtns = document.querySelectorAll('.view-btn');

            viewBtns.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`.view-btn[onclick="App.view.switch('${viewType}')"]`);
            if (activeBtn) activeBtn.classList.add('active');

            const pageData = App.pagination.getCurrentPageData();

            if (viewType === 'table') {
                if (tableView) tableView.style.display = 'block';
                if (cardsView) cardsView.classList.remove('active');
                App.render.table(pageData);
            } else {
                if (tableView) tableView.style.display = 'none';
                if (cardsView) cardsView.classList.add('active');
                App.render.cards(pageData);
            }
        }
    },

    // =========================
    // 렌더링 관련
    // =========================
    render: {
        table(dataToRender) {
            const tableContainer = document.querySelector('.table-container');
            if (!tableContainer) return;

            if (!dataToRender && (!App.state.data?.all || App.state.data.all.length === 0)) {
                tableContainer.innerHTML = '<div style="text-align: center; padding: 40px;">데이터를 불러오는 중...</div>';
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
            const headers = App.state.data?.headers || [];
            const visibleColumns = App.state.ui?.visibleColumns || {};

            headers.forEach(header => {
                if (visibleColumns[header]) {
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
                    const currentSortColumn = App.state.ui?.currentSortColumn;
                    const currentSortDirection = App.state.ui?.currentSortDirection;
                    
                    if (currentSortColumn === header && currentSortDirection) {
                        sortIcon = currentSortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
                    }

                    th.innerHTML = `${header} <i class="fas ${sortIcon} sort-icon ${currentSortColumn === header ? 'active' : ''}"></i>`;
                    headerRow.appendChild(th);
                }
            });
        },

        tableBody(table, dataToRender) {
            const tbody = table.createTBody();
            const headers = App.state.data?.headers || [];
            const visibleColumns = App.state.ui?.visibleColumns || {};

            if (!dataToRender || dataToRender.length === 0) {
                const row = tbody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = Object.values(visibleColumns).filter(Boolean).length || 1;
                cell.textContent = '표시할 데이터가 없습니다.';
                cell.style.textAlign = 'center';
                cell.style.padding = '40px';
                return;
            }

            dataToRender.forEach((rowData, index) => {
                const row = tbody.insertRow();
                row.id = `row-${index}`;

                row.onclick = (event) => {
                    if (event.target.tagName !== 'A') {
                        App.modal.openDetail(rowData);
                    }
                };

                App.render.tableCells(row, rowData, index);
            });
        },

        tableCells(row, rowData, index) {
            const headers = App.state.data?.headers || [];
            const visibleColumns = App.state.ui?.visibleColumns || {};
            const currentPage = App.state.ui?.currentPage || 1;

            headers.forEach((header, cellIndex) => {
                if (visibleColumns[header]) {
                    const cell = row.insertCell();
                    let cellData = rowData[cellIndex];

                    if (header === '구분') {
                        const displaySequence = (currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;
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
            if (!cardsContainer) return;
            
            cardsContainer.innerHTML = '';

            if (!dataToRender || dataToRender.length === 0) {
                cardsContainer.innerHTML = '<p style="text-align:center; padding: 40px; grid-column: 1/-1;">표시할 데이터가 없습니다.</p>';
                return;
            }

            const headers = App.state.data?.headers || [];
            const currentPage = App.state.ui?.currentPage || 1;

            dataToRender.forEach((rowData, index) => {
                const card = document.createElement('div');
                card.className = 'applicant-card';
                card.onclick = () => App.modal.openDetail(rowData);

                const getVal = (header) => String(rowData[headers.indexOf(header)] || '-');
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

                const displaySequence = (currentPage - 1) * App.config.ITEMS_PER_PAGE + index + 1;

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
            if (!App.state.ui) return;
            
            const currentSortColumn = App.state.ui.currentSortColumn;
            const currentSortDirection = App.state.ui.currentSortDirection;

            if (currentSortColumn === columnName) {
                App.state.ui.currentSortDirection = currentSortDirection === 'asc' ? 'desc' : '';
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
    // 데이터 관련
    // =========================
    data: {
        async fetch() {
            if (App._modules.dataService) {
                return await App._modules.dataService.fetch();
            } else {
                console.error('DataService가 초기화되지 않았습니다.');
                return null;
            }
        },

        updateSequenceNumber() {
            if (App._modules.dataService) {
                return App._modules.dataService.updateSequenceNumber();
            }
        },

        updateInterviewSchedule() {
            if (App._modules.dataService) {
                return App._modules.dataService.updateInterviewSchedule();
            }
        },

        showInterviewDetails(name, route) {
            if (App._modules.dataService) {
                return App._modules.dataService.showInterviewDetails(name, route);
            }
        },

        async save(data, isUpdate = false, gubun = null) {
            if (App._modules.dataService) {
                return await App._modules.dataService.save(data, isUpdate, gubun);
            } else {
                throw new Error('DataService가 초기화되지 않았습니다.');
            }
        },

        async delete(gubun) {
            if (App._modules.dataService) {
                return await App._modules.dataService.delete(gubun);
            } else {
                throw new Error('DataService가 초기화되지 않았습니다.');
            }
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
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    },

    // =========================
    // 유틸리티
    // =========================
    utils: {
        formatDateForInput(dateValue) {
            try {
                const date = new Date(dateValue);
                if (!isNaN(date.getTime())) {
                    const tzOffset = date.getTimezoneOffset() * 60000;
                    const localDate = new Date(date.getTime() - tzOffset);
                    return localDate.toISOString().split('T')[0];
                }
            } catch (e) {
                console.log('날짜 변환 실패:', dateValue);
            }
            return dateValue;
        },

        formatPhoneNumber(input) {
            let value = input.value.replace(/\D/g, '').slice(0, 11);
            if (value.length > 7) {
                input.value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
            } else if (value.length > 3) {
                input.value = `${value.slice(0, 3)}-${value.slice(3)}`;
            } else {
                input.value = value;
            }
        },

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
        },

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
        },

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
        },

        sortData(data) {
            if (!App.state.ui?.currentSortColumn || !App.state.ui?.currentSortDirection) {
                return data;
            }

            const headers = App.state.data?.headers || [];
            const sortIndex = headers.indexOf(App.state.ui.currentSortColumn);
            
            if (sortIndex === -1) return data;

            return data.sort((a, b) => {
                let valA = a[sortIndex];
                let valB = b[sortIndex];

                if (App.state.ui.currentSortColumn === '지원일' ||
                    App.state.ui.currentSortColumn.includes('날짜') ||
                    App.state.ui.currentSortColumn.includes('날자') ||
                    App.state.ui.currentSortColumn.includes('입과일')) {
                    valA = new Date(valA || '1970-01-01');
                    valB = new Date(valB || '1970-01-01');
                } else if (['나이', '구분'].includes(App.state.ui.currentSortColumn)) {
                    valA = Number(valA) || 0;
                    valB = Number(valB) || 0;
                } else {
                    valA = String(valA || '').toLowerCase();
                    valB = String(valB || '').toLowerCase();
                }

                if (valA < valB) return App.state.ui.currentSortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return App.state.ui.currentSortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        },

        enhanceAccessibility() {
            try {
                const header = document.querySelector('.main-header');
                if (header) {
                    header.setAttribute('role', 'banner');
                    header.setAttribute('aria-label', '메인 헤더 영역');
                }

                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.setAttribute('role', 'navigation');
                    sidebar.setAttribute('aria-label', '주 메뉴 네비게이션');
                }

                const mainContent = document.querySelector('.content-area');
                if (mainContent) {
                    mainContent.setAttribute('role', 'main');
                    mainContent.setAttribute('aria-label', '메인 콘텐츠 영역');
                }

                console.log('♿ 접근성 개선 완료');

            } catch (error) {
                console.error('접근성 개선 실패:', error);
            }
        }
    },

    // =========================
    // 애플리케이션 초기화
    // =========================
    init: {
        async start() {
            try {
                console.log('🚀 애플리케이션 초기화 시작...');
                
                // 내부 모듈들 초기화
                App._modules.eventBus = new EventBus();
                App._modules.stateManager = new StateManager(App._modules.eventBus);
                App._modules.dataService = new DataService(App._modules.eventBus, App._modules.stateManager, App.config);

                // 이벤트 리스너 설정
                App.init.setupEventListeners();
                App.init.setupDateFilterListeners();
                App.init.setupModuleEventListeners();

                // 테마 초기화
                App.theme.initialize();
                
                // 데이터 fetch
                await App.data.fetch();
                
                // 접근성 개선
                setTimeout(() => {
                    App.utils.enhanceAccessibility();
                }, 1000);

                console.log('✅ 애플리케이션 초기화 완료');
                
            } catch (error) {
                console.error('❌ 애플리케이션 초기화 실패:', error);
                alert('애플리케이션 초기화 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
            }
        },

        setupEventListeners() {
            document.addEventListener('click', function(event) {
                const dropdownContainer = document.querySelector('.column-toggle-container');
                if (dropdownContainer && !dropdownContainer.contains(event.target)) {
                    const dropdown = document.getElementById('columnToggleDropdown');
                    if (dropdown) dropdown.style.display = 'none';
                }

                if (window.innerWidth <= 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar && sidebar.classList.contains('mobile-open') &&
                        !sidebar.contains(event.target) &&
                        !event.target.closest('.mobile-menu-btn')) {
                        App.ui.toggleMobileMenu();
                    }
                }
            });
        },

        setupDateFilterListeners() {
            const dateModeToggle = document.getElementById('dateModeToggle');
            if (dateModeToggle) {
                dateModeToggle.addEventListener('click', (e) => {
                    if (e.target.tagName === 'BUTTON' && App.state.ui) {
                        App.state.ui.activeDateMode = e.target.dataset.mode;
                        App.filter.updateDateFilterUI();
                        App.filter.apply();
                    }
                });
            }
        },

        setupModuleEventListeners() {
            const eventBus = App._modules.eventBus;

            // 데이터 업데이트 시 UI 갱신
            eventBus.on('data:fetch:success', () => {
                App.filter.populateDropdowns();
                App.data.updateInterviewSchedule();
                App.filter.reset(true);
                
                // visibleColumns 초기화
                const headers = App.state.data?.headers || [];
                const visibleColumns = {};
                headers.forEach(header => {
                    visibleColumns[header] = !App.config.DEFAULT_HIDDEN_COLUMNS.includes(header);
                });
                if (App.state.ui) {
                    App.state.ui.visibleColumns = visibleColumns;
                }
                
                App.ui.setupColumnToggles();
            });

            // 상태 변경 시 사이드바 업데이트 (필요시 구현)
            eventBus.on('state:changed:data.all', () => {
                // App.sidebar.updateWidgets();
            });
        }
    }
};

// =========================
// 전역 객체 노출 및 모달 이벤트 처리
// =========================
window.App = App;

// 모달 외부 클릭시 닫기
window.onclick = function(event) {
    if (event.target === App.modal?.element) {
        App.modal.close();
    }
};

// =========================
// 애플리케이션 시작
// =========================
document.addEventListener('DOMContentLoaded', () => {
    App.init.start();
});
