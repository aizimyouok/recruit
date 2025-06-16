// =========================
// modal.js - 모달 관련 모듈 (완전한 통합 버전)
// =========================

export const ModalModule = {
    get element() {
        return document.getElementById('applicantModal');
    },

    openNew(appInstance) {
        document.querySelector('#applicantModal .modal-title').textContent = '신규 지원자 등록';
        ModalModule.buildForm(appInstance);
        document.querySelector('#applicantModal .modal-footer').innerHTML = `<button class="primary-btn" onclick="globalThis.App.modal.saveNew()">저장하기</button>`;
        ModalModule.element.style.display = 'flex';
    },

    openDetail(appInstance, rowData) {
        document.querySelector('#applicantModal .modal-title').textContent = '지원자 상세 정보';
        ModalModule.buildForm(appInstance, rowData, true);

        document.querySelector('#applicantModal .modal-footer').innerHTML = `
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="modal-close-btn" onclick="globalThis.App.modal.close()">
                    <i class="fas fa-times"></i> 닫기
                </button>
                <button class="modal-edit-btn" onclick="globalThis.App.modal.openEdit()">
                    <i class="fas fa-edit"></i> 수정
                </button>
                <button class="modal-delete-btn" onclick="globalThis.App.modal.delete()">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        `;

        appInstance.state.ui.currentEditingData = [...rowData];
        ModalModule.element.style.display = 'flex';
    },

    openEdit(appInstance) {
        if (!appInstance.state.ui.currentEditingData) {
            alert('편집할 데이터가 없습니다.');
            return;
        }

        document.querySelector('#applicantModal .modal-title').textContent = '지원자 정보 수정';
        ModalModule.buildForm(appInstance, appInstance.state.ui.currentEditingData, false);

        document.querySelector('#applicantModal .modal-footer').innerHTML = `
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="modal-close-btn" onclick="globalThis.App.modal.close()">
                    <i class="fas fa-times"></i> 취소
                </button>
                <button class="modal-edit-btn" onclick="globalThis.App.modal.saveEdit()">
                    <i class="fas fa-save"></i> 저장
                </button>
            </div>
        `;
    },

    close(appInstance) {
        ModalModule.element.style.display = 'none';
        document.getElementById('applicantForm').innerHTML = '';
        if (appInstance) {
            appInstance.state.ui.currentEditingData = null;
        }
    },

    buildForm(appInstance, data = null, isReadOnly = false) {
        const form = document.getElementById('applicantForm');
        form.innerHTML = '';

        appInstance.state.data.headers.forEach((header, index) => {
            const formGroup = document.createElement('div');
            formGroup.className = `form-group ${header === '비고' || header === '면접리뷰' ? 'full-width' : ''}`;

            const isRequired = appInstance.config.REQUIRED_FIELDS.includes(header) && !isReadOnly;

            let value = '';
            if (data) {
                value = String(data[index] || '');
            } else {
                if (header === '구분') value = appInstance.state.ui.nextSequenceNumber;
                else if (header === '지원일') {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    value = `${year}-${month}-${day}`;
                }
            }

            if ((appInstance.config.DATE_FIELDS.includes(header) || header === '지원일') && value && value !== '-') {
                value = appInstance.utils.formatDateForInput(value);
            }

            const inputHtml = ModalModule.createInput(appInstance, header, value, isRequired, isReadOnly);
            formGroup.innerHTML = `<label for="modal-form-${header}">${header}${isRequired ? ' *' : ''}</label>${inputHtml}`;
            form.appendChild(formGroup);
        });
    },

    createInput(appInstance, header, value, isRequired, isDisabled) {
        const isDisabledOrReadOnly = isDisabled || header === '구분';

        if (header === '연락처') {
            return `<input type="tel" id="modal-form-${header}" value="${value}" oninput="globalThis.App.utils.formatPhoneNumber(this)" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (appInstance.config.DATE_FIELDS.includes(header) || header === '지원일') {
            return `<input type="date" id="modal-form-${header}" value="${value}" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (appInstance.config.TIME_FIELDS.includes(header)) {
            return `<input type="text" id="modal-form-${header}" value="${value}" placeholder="예: 14시 30분" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''}>`;
        } else if (appInstance.config.DROPDOWN_OPTIONS[header]) {
            return ModalModule.createDropdownInput(appInstance, header, value, isRequired, isDisabledOrReadOnly);
        } else if (header === '비고' || header === '면접리뷰') {
            return `<textarea id="modal-form-${header}" rows="3" ${isDisabledOrReadOnly ? 'disabled' : ''}>${value}</textarea>`;
        } else {
            return `<input type="text" id="modal-form-${header}" value="${value}" ${isRequired ? 'required' : ''} ${isDisabledOrReadOnly ? 'disabled' : ''} ${header === '구분' ? 'style="background-color: #f1f5f9;"' : ''}>`;
        }
    },

    createDropdownInput(appInstance, header, value, isRequired, isDisabled) {
        const options = appInstance.config.DROPDOWN_OPTIONS[header];
        const hasDirectInput = options.includes('직접입력');
        let customValue = '';
        let selectValue = value;

        if (hasDirectInput && !options.includes(value) && value) {
            selectValue = '직접입력';
            customValue = value;
        }

        let html = `<select id="modal-form-${header}" ${hasDirectInput ? `onchange="globalThis.App.modal.handleDropdownChange(this, '${header}')"` : ''} ${isRequired ? 'required' : ''} ${isDisabled ? 'disabled' : ''}>
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

        if (customInput) {
            customInput.style.display = isDirectInput ? 'block' : 'none';
            if(isDirectInput) customInput.focus();
        }

        const isRequired = document.querySelector(`label[for="modal-form-${fieldName}"]`).textContent.includes('*');
        if(isRequired){
            if(isDirectInput){
                selectElement.removeAttribute('required');
                if (customInput) customInput.setAttribute('required', '');
            } else {
                if (customInput) customInput.removeAttribute('required');
                selectElement.setAttribute('required', '');
            }
        }
    },

    async saveNew(appInstance) {
        const saveBtn = document.querySelector('#applicantModal .modal-footer .primary-btn');
        const originalText = saveBtn.innerHTML;

        try {
            const applicantData = ModalModule.collectFormData(appInstance);

            if (!ModalModule.validateFormData(appInstance, applicantData)) {
                alert('필수 항목을 모두 입력해주세요.');
                return;
            }

            if (appInstance.state.data.headers.includes('구분')) {
                applicantData['구분'] = appInstance.state.ui.nextSequenceNumber.toString();
            }
            if (appInstance.state.data.headers.includes('지원일')) {
                applicantData['지원일'] = new Date().toISOString().split('T')[0];
            }

            ModalModule.prepareTimeData(applicantData);

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

            await appInstance.data.save(applicantData);

            ModalModule.close(appInstance);
            appInstance.data.fetch();

        } catch (error) {
            console.error("데이터 저장 실패:", error);
            alert("데이터 저장 중 오류 발생: " + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    async saveEdit(appInstance) {
        const saveBtn = document.querySelector('#applicantModal .modal-footer .modal-edit-btn');
        const originalText = saveBtn.innerHTML;

        try {
            const updatedData = ModalModule.collectFormData(appInstance);

            if (!ModalModule.validateFormData(appInstance, updatedData)) {
                alert('필수 항목을 모두 입력해주세요.');
                return;
            }

            ModalModule.prepareTimeData(updatedData);

            const gubunIndex = appInstance.state.data.headers.indexOf('구분');
            if (gubunIndex === -1 || !appInstance.state.ui.currentEditingData) {
                alert('편집 정보를 찾을 수 없습니다.');
                return;
            }

            const gubunValue = appInstance.state.ui.currentEditingData[gubunIndex];
            if (!gubunValue) {
                alert('구분값을 찾을 수 없습니다.');
                return;
            }

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 저장 중...';

            await appInstance.data.save(updatedData, true, gubunValue);

            alert('정보가 성공적으로 수정되었습니다.');
            ModalModule.close(appInstance);
            appInstance.data.fetch();

        } catch (error) {
            console.error("데이터 수정 실패:", error);
            alert("데이터 수정 중 오류 발생: " + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    },

    async delete(appInstance) {
        if (!appInstance.state.ui.currentEditingData) {
            alert('삭제할 데이터가 없습니다.');
            return;
        }

        const gubunIndex = appInstance.state.data.headers.indexOf('구분');
        const nameIndex = appInstance.state.data.headers.indexOf('이름');

        if (gubunIndex === -1) {
            alert('삭제를 위한 고유 식별자(구분)를 찾을 수 없습니다.');
            return;
        }

        const gubunValue = appInstance.state.ui.currentEditingData[gubunIndex];
        const applicantName = appInstance.state.ui.currentEditingData[nameIndex] || '해당 지원자';

        if (!confirm(`정말로 '${applicantName}' 님의 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        const deleteBtn = document.querySelector('.modal-delete-btn');
        const originalText = deleteBtn.innerHTML;

        try {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<div class="advanced-loading-spinner" style="width: 20px; height: 20px; margin: 0;"></div> 삭제 중...';

            await appInstance.data.delete(gubunValue);

            alert(`'${applicantName}' 님의 정보가 성공적으로 삭제되었습니다.`);
            ModalModule.close(appInstance);
            appInstance.data.fetch();

        } catch (error) {
            console.error("데이터 삭제 실패:", error);
            alert("데이터 삭제 중 오류가 발생했습니다: " + error.message);
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = originalText;
        }
    },

    collectFormData(appInstance) {
        const applicantData = {};
        appInstance.state.data.headers.forEach(header => {
            const input = document.getElementById(`modal-form-${header}`);
            const customInput = document.getElementById(`modal-form-${header}-custom`);
            if (input) {
                let value = (customInput && customInput.style.display !== 'none') ? customInput.value : input.value;
                applicantData[header] = value;
            }
        });
        return applicantData;
    },

    validateFormData(appInstance, data) {
        return appInstance.config.REQUIRED_FIELDS.every(field => data[field] && data[field].trim() !== '');
    },

    prepareTimeData(data) {
        const timeHeader = '면접 시간';
        if (data[timeHeader]) {
            data[timeHeader] = "'" + data[timeHeader];
        }
    }
};