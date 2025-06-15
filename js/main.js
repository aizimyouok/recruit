// js/main.js

// 모듈화된 부분만 import (실제 사용하는 것만)
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
    }, // ← 여기가 중요! config 객체를 제대로 닫아야 함

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
        return this._modules.stateManager?.state || {};
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
    // UI 관련
    // =========================
    ui: {
        toggleMobileMenu() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.querySelector('.mobile-overlay');
            if (sidebar) sidebar.classList.toggle('mobile-open');
            if (overlay) overlay.classList.toggle('show');
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
                // 모바일 메뉴 처리
                if (window.innerWidth <= 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar && sidebar.classList.contains('mobile-open') &&
                        !sidebar.contains(event.target) &&
                        !event.target.closest('.mobile-menu-btn')) {
                        App.ui.toggleMobileMenu();
                    }
                }
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
