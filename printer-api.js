/**
 * 印字機API控制庫
 * 提供統一的印字機操作介面與現代化UI
 */
class PrinterAPI {
    constructor() {
        this.baseURL = 'https://127.0.0.1:443';
        this.modal = null;
        this.currentStep = 0;
        this.steps = [
            { name: 'Lock', action: 'lock', message: '占用' },
            { name: 'Status', action: 'status', message: '紙張放入' },
            { name: 'Insert', action: 'insert', message: '吸入' },
            { name: 'Print', action: 'print', message: '列印' },
            { name: 'Eject', action: 'eject', message: '排出' },
            { name: 'Unlock', action: 'unlock', message: '解除' }
        ];
        this.apiKey = '';
        this.printContent = '';
        this.onComplete = null;
    }

    /**
     * 初始化印字機操作
     * @param {Object} options - 配置選項
     * @param {string} options.systemName - 系統名稱
     * @param {string} options.displayMessage - 顯示訊息
     * @param {string} options.apiKey - API金鑰
     * @param {string} options.printContent - 列印內容
     * @param {Function} options.onComplete - 完成回調函數
     */
    async start(options) {
        const { systemName, displayMessage, apiKey, printContent, onComplete } = options;
        
        this.apiKey = apiKey;
        this.printContent = printContent;
        this.onComplete = onComplete;
        this.currentStep = 0;

        // 創建並顯示Modal
        this.createModal(systemName, displayMessage);
        this.showModal();

        // 開始執行流程
        await this.executeSteps();
    }

    /**
     * 創建Bootstrap Modal
     */
    createModal(systemName, displayMessage) {
        // 移除既有的modal
        const existingModal = document.getElementById('printerModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal fade" id="printerModal" tabindex="-1" aria-labelledby="printerModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="printerModalLabel">
                                <i class="fas fa-print me-2"></i>${systemName}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-12">
                                    <div class="alert alert-info" role="alert">
                                        <i class="fas fa-info-circle me-2"></i>
                                        ${displayMessage}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-12">
                                    <h6 class="mb-3">執行狀態：</h6>
                                    <div id="stepsList" class="list-group">
                                        ${this.steps.map((step, index) => `
                                            <div class="list-group-item d-flex justify-content-between align-items-center" id="step-${index}">
                                                <div>
                                                    <i class="fas fa-clock text-muted me-2" id="icon-${index}"></i>
                                                    <span>${step.message}</span>
                                                </div>
                                                <span class="badge bg-secondary" id="status-${index}">等待中</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <div class="row mt-4" id="errorSection" style="display: none;">
                                <div class="col-12">
                                    <div class="alert alert-danger" role="alert" id="errorMessage">
                                        <i class="fas fa-exclamation-triangle me-2"></i>
                                        <span id="errorText"></span>
                                    </div>
                                </div>
                            </div>

                            <div class="row mt-3">
                                <div class="col-12">
                                    <div class="progress" style="height: 10px;">
                                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                             role="progressbar" 
                                             style="width: 0%" 
                                             id="progressBar">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-danger" id="endButton" style="display: none;">
                                <i class="fas fa-times me-2"></i>結束
                            </button>
                            <button type="button" class="btn btn-success" id="completeButton" style="display: none;">
                                <i class="fas fa-check me-2"></i>完成
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 綁定事件
        document.getElementById('endButton').addEventListener('click', () => {
            this.handleEnd(false);
        });

        document.getElementById('completeButton').addEventListener('click', () => {
            this.handleEnd(true);
        });
    }

    /**
     * 顯示Modal
     */
    showModal() {
        this.modal = new bootstrap.Modal(document.getElementById('printerModal'), {
            backdrop: 'static',
            keyboard: false
        });
        this.modal.show();
    }

    /**
     * 執行所有步驟
     */
    async executeSteps() {
        for (let i = 0; i < this.steps.length; i++) {
            this.updateProgress(i);
            this.updateStepStatus(i, 'processing', '執行中...');

            try {
                const result = await this.callAPI(this.steps[i].action);
                if (result.success) {
                    this.updateStepStatus(i, 'success', '成功');
                } else {
                    this.updateStepStatus(i, 'error', '失敗');
                    this.showError(`${this.steps[i].message}失敗: ${result.message}`);
                    this.showEndButton();
                    return;
                }
            } catch (error) {
                this.updateStepStatus(i, 'error', '失敗');
                this.showError(`${this.steps[i].message}失敗: ${error.message}`);
                this.showEndButton();
                return;
            }

            this.currentStep = i + 1;
        }

        // 所有步驟完成
        this.updateProgress(this.steps.length);
        this.showCompleteButton();
    }

    /**
     * 調用API
     */
    async callAPI(action) {
        const url = `${this.baseURL}/${action}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
        };

        let body = {};
        if (action === 'print') {
            body.content = this.printContent;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * 更新步驟狀態
     */
    updateStepStatus(stepIndex, status, message) {
        const iconElement = document.getElementById(`icon-${stepIndex}`);
        const statusElement = document.getElementById(`status-${stepIndex}`);
        const stepElement = document.getElementById(`step-${stepIndex}`);

        // 更新圖標
        iconElement.className = '';
        switch (status) {
            case 'processing':
                iconElement.className = 'fas fa-spinner fa-spin text-primary me-2';
                statusElement.className = 'badge bg-primary';
                stepElement.className = 'list-group-item d-flex justify-content-between align-items-center active';
                break;
            case 'success':
                iconElement.className = 'fas fa-check-circle text-success me-2';
                statusElement.className = 'badge bg-success';
                stepElement.className = 'list-group-item d-flex justify-content-between align-items-center';
                break;
            case 'error':
                iconElement.className = 'fas fa-times-circle text-danger me-2';
                statusElement.className = 'badge bg-danger';
                stepElement.className = 'list-group-item d-flex justify-content-between align-items-center';
                break;
        }

        statusElement.textContent = message;
    }

    /**
     * 更新進度條
     */
    updateProgress(completedSteps) {
        const progressBar = document.getElementById('progressBar');
        const percentage = (completedSteps / this.steps.length) * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);

        if (percentage === 100) {
            progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
            progressBar.classList.add('bg-success');
        }
    }

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorSection.style.display = 'block';
    }

    /**
     * 顯示結束按鈕
     */
    showEndButton() {
        document.getElementById('endButton').style.display = 'inline-block';
    }

    /**
     * 顯示完成按鈕
     */
    showCompleteButton() {
        document.getElementById('completeButton').style.display = 'inline-block';
    }

    /**
     * 處理結束
     */
    handleEnd(success) {
        this.modal.hide();
        
        // 移除modal元素
        setTimeout(() => {
            const modalElement = document.getElementById('printerModal');
            if (modalElement) {
                modalElement.remove();
            }
        }, 500);

        if (this.onComplete) {
            this.onComplete(success);
        }
    }
}

// 全域函數，方便使用
window.PrinterAPI = PrinterAPI;

/**
 * 快捷函數
 * @param {Object} options - 配置選項
 * @param {string} options.systemName - 系統名稱
 * @param {string} options.displayMessage - 顯示訊息
 * @param {string} options.apiKey - API金鑰
 * @param {string} options.printContent - 列印內容
 * @returns {Promise<boolean>} - 是否成功
 */
window.startPrinting = function(options) {
    return new Promise((resolve) => {
        const printer = new PrinterAPI();
        printer.start({
            ...options,
            onComplete: (success) => {
                resolve(success);
            }
        });
    });
};
