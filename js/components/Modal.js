// js/components/Modal.js

/**
 * 모달 컴포넌트
 * 기존 App.modal의 모든 기능을 캡슐화하면서 이벤트 기반으로 작동
 */
export class ModalComponent {
    constructor(eventBus, stateManager, config) {
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.config = config;
        this.element = document.getElementById('applicantModal');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupGlobalEventListeners();
    }

    setupEventListeners() {
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        // 모달 외부 클릭시 닫기
        this.element.addEventListener('click', (event) => {
            if (event.target === this.element) {
                this.close();
            }
        });

        // 전역 클릭 이벤트
        window.onclick = (event) => {
            if (event.target === this.element) {
                this.close();
            }
        };
    }

    setupGlobalEventListeners() {
        // 이벤트 버스를 통한 모달 제어
        this.eventBus.on('modal:open:new', () => this.openNew());
        this.eventBus.on('modal:open:detail', (data) => this.openDetail(data));
        this.eventBus.on('modal:open:edit', () => this.openEdit());
        this.eventBus.on('modal:close', () => this.close());
        
        // 데이터 관련 이벤트
        this.eventBus.on('data:save:success', ({ isUpdate }) => {
            if (isUpdate) {
                this.showMessage('정보가 성공적으로 수정되었습니다.', 'success');
            } else {
                this.showMessage('새 지원자가 성공적으로 등록되었습니다.', 'success');
            }
            this.close();
        });

        this.eventBus.on('data:delete:success', ({ gubun }) => {
            this.showMessage('지원자 정보가 성공적으로 삭제되었습니다.', 'success');
            this.close();
        });

        this.eventBus.on('data:save:error', ({ error }) => {
            this.showMessage('데이터 저장 중 오류가 발생했습니다: ' + error.message, 'error');
        });

        this.eventBus.on('data:delete:error', ({ error }) => {
            this.showMessage('데이터 삭제 중 오류가 발생했습니다: ' + error.message, 'error');
        });
    }

    isOpen() {
        return this.element.style.display === 'flex';
    }

    openNew() {
        this.setTitle('신규 지원자 등록');
        this.buildForm();
        this.setFooter(`
            <button class="primary-btn" onclick="App.modal.saveNew()">
                저장하기
            </button>
        `);
        this.show();
        this.eventBus.emit('modal:opened', { type: 'new' });
    }

    openDetail(rowData) {
        this.setTitle('지원자 상세 정보');
        this.buildForm(rowData, true);
        this.setFooter(`
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
        `);
        
        this.stateManager.state.ui.currentEditingData = [...rowData];
        this.show();
        this.eventBus.emit('modal:opened', { type: 'detail', data: rowData });
    }

    openEdit() {
        if (!this.stateManager.state.ui.currentEditingData) {
            this.showMessage('편집할 데이터가 없습니다.', 'warning');
            return;
        }

        this.setTitle('지원자 정보 수정');
        this.buildForm(this.stateManager.state.ui.currentEditingData, false);
        this.setFooter(`
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="modal-close-btn" onclick="App.modal.close()">
                    <i class="fas fa-times"></i> 취소
                </button>
                <button class="modal-edit-btn" onclick="App.modal.saveEdit()">
                    <i class="fas fa-save"></i> 저장
                </button>
            </div>
        `);
        this.eventBus.emit('modal:opened', { type: 'edit', data: this.stateManager.state.ui.currentEditingData });
    }

    close() {
        this.hide();
        this.clearForm();
        this.stateManager.state.ui.currentEditingData = null;
        this.eventBus.emit('modal:closed');
    }

    show() {
        this.element.style.display = 'flex';
        
        // 첫 번째 입력 필드에 포커스
        setTimeout(() => {
            const firstInput = this.element.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled])');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    hide() {
        this.element.style.display = 'none';
    }

    setTitle(title) {
        const titleElement = this.element.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    setFooter(html) {
        const footerElement = this.element.querySelector('.modal-footer');
        if (footerElement) {
            footerElement.innerHTML = html;
        }
    }

    clearForm() {
        const form = document.getElementById('applicantForm');
        if (form) {
            form.innerHTML = '';
        }
    }

    buildForm(data = null, isReadOnly = false) {
        const form = document.getElementById('applicantForm');
        form.innerHTML = '';

        const headers = this.stateManager.state.data.headers;

        headers.forEach((header, index) => {
            const formGroup = document.createElement('div');
            formGroup.className = `form-group ${header === '비고' || header === '면접리뷰' ? 'full-width' : ''}`;

            const isRequired = this.config.REQUIRED_FIELDS.includes(header) && !isReadOnly;

            let value = '';
            if (data) {
                value = String(data[index] || '');
            } else {
                if (header === '구분') {
                    value = this.stateManager.state.ui.nextSequenceNumber;
                } else if (header === '지원일') {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    value = `${year}-${month}-${day}`;
                }
            }

            if ((this.config.DATE_FIELDS.includes(header) || header === '지원일') && value && value !== '-') {
                value = this.formatDateForInput(value);
            }

            const inputHtml = this.createInput(header, value, isRequired, isReadOnly);
            formGroup.innerHTML = `
                <label for="modal-form-${header}">
                    ${header}${isRequired ? ' *' : ''}
                </label>
                ${inputHtml}
            `;
            form.appendChild(formGroup);
        });

        this.eventBus.emit('form:built', { data, isReadOnly });
    }

    createInput(header, value, isRequired, isDisabled) {
        const isDisabledOrReadOnly = isDisabled || header === '구분';

        if (header === '연락처') {
            return `<input type="tel" 
                           id="modal-form-${header}" 
                           value="${value}" 
                           oninput="App.utils.formatPhoneNumber(this)" 
                           ${isRequired ? 'required' : ''} 
                           ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (this.config.DATE_FIELDS.includes(header) || header === '지원일') {
            return `<input type="date" 
                           id="modal-form-${header}" 
                           value="${value}" 
                           ${isRequired ? 'required' : ''} 
                           ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (this.config.TIME_FIELDS.includes(header)) {
            return `<input type="text" 
                           id="modal-form-${header}" 
                           value="${value}" 
                           placeholder="예: 14시 30분" 
                           ${isRequired ? 'required' : ''} 
                           ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (this.config.DROPDOWN_OPTIONS[header]) {
            return this.createDropdownInput(header, value, isRequired, isDisabledOrReadOnly);
        } else if (header === '비고' || header === '면접리뷰') {
            return `<textarea id="modal-form-${header}" 
                             rows="3" 
                             ${isDisabledOrReadOnly ? 'disabled' : ''}>${value}</textarea>`;
        } else {
            return `<input type="text" 
                           id="modal-form-${header}" 
                           value="${value}" 
                           ${isRequired ? 'required' : ''} 
                           ${isDisabledOrReadOnly ? 'disabled' : ''} 
                           ${header === '구분' ? 'style="background-color: #f1f5f9;"' : ''}>`;
        }
    }

    createDropdownInput(header, value, isRequired, isDisabled) {
        const options = this.config.DROPDOWN_OPTIONS[header];
        const hasDirectInput = options.includes('직접입력');
        let customValue = '';
        let selectValue = value;

        if (hasDirectInput && !options.includes(value) && value) {
            selectValue = '직접입력';
            customValue = value;
        }

        let html = `
            <select id="modal-form-${header}" 
                    ${hasDirectInput ? `onchange="App.modal.handleDropdownChange(this, '${header}')"` : ''} 
                    ${isRequired ? 'required' : ''} 
                    ${isDisabled ? 'disabled' : ''}>
                <option value="">선택해주세요</option>
                ${options.map(option => 
                    `<option value="${option}" ${selectValue === option ? 'selected' : ''}>${option}</option>`
                ).join('')}
            </select>
        `;

        if (hasDirectInput) {
            html += `
                <input type="text" 
                       id="modal-form-${header}-custom" 
                       value="${customValue}" 
                       placeholder="직접 입력하세요" 
                       style="display:${selectValue === '직접입력' ? 'block' : 'none'}; margin-top:5px;" 
                       ${isDisabled ? 'disabled' : ''}>
            `;
        }

        return html;
    }

    handleDropdownChange(selectElement, fieldName) {
        const customInput = document.getElementById(`modal-form-${fieldName}-custom`);
        const isDirectInput = selectElement.value === '직접입력';

        if (customInput) {
            customInput.style.display = isDirectInput ? 'block' : 'none';
            if (isDirectInput) customInput.focus();

            const isRequired = document.querySelector(`label[for="modal-form-${fieldName}"]`).textContent.includes('*');
            if (isRequired) {
                if (isDirectInput) {
                    selectElement.removeAttribute('required');
                    customInput.setAttribute('required', '');
                } else {
                    customInput.removeAttribute('required');
                    selectElement.setAttribute('required', '');
                }
            }
        }

        this.eventBus.emit('dropdown:changed', { field: fieldName, value: selectElement.value, isDirectInput });
    }

    collectFormData() {
        const applicantData = {};
        const headers = this.stateManager.state.data.headers;
        
        headers.forEach(header => {
            const input = document.getElementById(`modal-form-${header}`);
            const customInput = document.getElementById(`modal-form-${header}-custom`);
            if (input) {
                let value = (customInput && customInput.style.display !== 'none') ? customInput.value : input.value;
                applicantData[header] = value;
            }
        });
        
        return applicantData;
    }

    validateFormData(data) {
        const missingFields = this.config.REQUIRED_FIELDS.filter(field => !data[field] || data[field].trim() === '');
        
        if (missingFields.length > 0) {
            this.showValidationErrors(missingFields);
            return false;
        }
        
        return true;
    }

    showValidationErrors(missingFields) {
        const message = `다음 필수 항목을 입력해주세요:\n• ${missingFields.join('\n• ')}`;
        this.showMessage(message, 'warning');
        
        // 첫 번째 누락된 필드에 포커스
        const firstMissingField = document.getElementById(`modal-form-${missingFields[0]}`);
        if (firstMissingField) {
            firstMissingField.focus();
            firstMissingField.style.borderColor = 'var(--danger)';
            setTimeout(() => {
                firstMissingField.style.borderColor = '';
            }, 3000);
        }
    }

    prepareTimeData(data) {
        const timeHeader = '면접 시간';
        if (data[timeHeader]) {
            data[timeHeader] = "'" + data[timeHeader];
        }
        return data;
    }

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
    }

    showMessage(message, type = 'info') {
        // 간단한 알림 표시 (실제로는 NotificationManager 사용)
        if (type === 'error' || type === 'warning') {
            alert(message);
        } else {
            console.log(`[Modal ${type.toUpperCase()}]:`, message);
        }
    }

    /**
     * 모달 상태 정보 반환 (디버깅용)
     */
    getStatus() {
        return {
            isOpen: this.isOpen(),
            currentEditingData: this.stateManager.state.ui.currentEditingData !== null,
            formFields: document.querySelectorAll('#applicantForm .form-group').length
        };
    }
}