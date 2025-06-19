/**
 * 印字機API控制庫 - 測試版本
 * 此版本使用模擬API回應來演示功能
 */
class PrinterAPIMock extends PrinterAPI {
    /**
     * 模擬API調用 - 用於測試和演示
     */
    async callAPI(action) {
        // 模擬網路延遲
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // 模擬成功率 (90%成功率，用於演示錯誤處理)
        const successRate = 0.9;
        const isSuccess = Math.random() < successRate;
        
        if (isSuccess) {
            return { 
                success: true, 
                data: { 
                    action: action,
                    status: 'success',
                    timestamp: new Date().toISOString(),
                    message: `${action} operation completed successfully`
                } 
            };
        } else {
            return { 
                success: false, 
                message: `模擬錯誤: ${action} 操作失敗 (網路超時或設備忙碌中)` 
            };
        }
    }
}

// 覆寫全域函數使用測試版本
window.startPrintingMock = function(options) {
    return new Promise((resolve) => {
        const printer = new PrinterAPIMock();
        printer.start({
            ...options,
            onComplete: (success) => {
                resolve(success);
            }
        });
    });
};

// 提供切換模式的函數
window.useMockAPI = true;

window.startPrinting = function(options) {
    if (window.useMockAPI) {
        return window.startPrintingMock(options);
    } else {
        return new Promise((resolve) => {
            const printer = new PrinterAPI();
            printer.start({
                ...options,
                onComplete: (success) => {
                    resolve(success);
                }
            });
        });
    }
};
