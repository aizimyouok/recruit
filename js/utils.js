// =========================
// utils.js - 순수 유틸리티 함수들만 (순환 참조 없음)
// =========================

export const Utils = {
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

    getInterviewUrgency(interviewDate) {
        if (!interviewDate) return -1;
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const date = new Date(interviewDate);
            date.setHours(0, 0, 0, 0);
            const diffTime = date.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 2) return diffDays;
            return -1;
        } catch (e) {
            return -1;
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

    extractRegion(address) {
        if (address.includes('서울')) return '서울';
        else if (address.includes('경기')) return '경기';
        else if (address.includes('인천')) return '인천';
        else if (address.includes('부산')) return '부산';
        else if (address.includes('대구')) return '대구';
        else if (address.includes('대전')) return '대전';
        else if (address.includes('광주')) return '광주';
        else if (address.includes('울산')) return '울산';
        else if (address.includes('세종')) return '세종';
        else if (address.includes('강원')) return '강원';
        else if (address.includes('충북') || address.includes('충청북')) return '충북';
        else if (address.includes('충남') || address.includes('충청남')) return '충남';
        else if (address.includes('전북') || address.includes('전라북')) return '전북';
        else if (address.includes('전남') || address.includes('전라남')) return '전남';
        else if (address.includes('경북') || address.includes('경상북')) return '경북';
        else if (address.includes('경남') || address.includes('경상남')) return '경남';
        else if (address.includes('제주')) return '제주';
        else return '기타';
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

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    },

    getErrorMessage(status) {
        if (status === 404) {
            return '데이터를 찾을 수 없습니다. 관리자에게 문의하세요.';
        } else if (status === 500) {
            return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else if (status === 403) {
            return '데이터에 접근할 권한이 없습니다.';
        } else {
            return `서버 오류 (${status})`;
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

            document.querySelectorAll('button').forEach(button => {
                if (!button.getAttribute('aria-label') && button.title) {
                    button.setAttribute('aria-label', button.title);
                }
            });

            const filterBar = document.querySelector('.filter-bar');
            if (filterBar) {
                filterBar.setAttribute('role', 'search');
                filterBar.setAttribute('aria-label', '지원자 필터링 도구');
            }

            console.log('♿ 접근성 개선 완료');

        } catch (error) {
            console.error('접근성 개선 실패:', error);
        }
    },

    createProgressBar(percentage = 0, text = '로딩 중...') {
        return `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="progress-text">
                    <span class="progress-percentage">${percentage}%</span> ${text}
                </div>
            </div>
        `;
    },

    createSkeletonTable() {
        const skeletonRows = Array.from({length: 8}, (_, i) => `
            <tr class="skeleton-row">
                <td><div class="skeleton-cell short"></div></td>
                <td><div class="skeleton-cell medium"></div></td>
                <td><div class="skeleton-cell long"></div></td>
                <td><div class="skeleton-cell short"></div></td>
                <td><div class="skeleton-cell medium"></div></td>
                <td><div class="skeleton-cell long"></div></td>
                <td><div class="skeleton-cell medium"></div></td>
            </tr>
        `).join('');

        return `
            <div class="skeleton-container">
                <table class="skeleton-table">
                    <thead>
                        <tr>
                            <th>구분</th><th>이름</th><th>연락처</th><th>지원루트</th><th>모집분야</th><th>지원일</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${skeletonRows}
                    </tbody>
                </table>
            </div>
        `;
    }
};
