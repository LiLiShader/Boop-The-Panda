// 配置API基础URL
// 服务器配置
const SERVER_HOST = '119.91.142.92';
const MAIN_SERVER_PORT = 3000; // 修正：后端服务运行在3000端口
const PROTOCOL = 'http';

const API_BASE_URL = `${PROTOCOL}://${SERVER_HOST}:${MAIN_SERVER_PORT}`;

// 全局变量
let currentOrders = []; // 存储当前查询到的订单列表

// 全局变量
let currentAdmin = null; // 当前登录的管理员信息

// 登录界面DOM元素
const loginContainer = document.getElementById('login-container');
const mainContainer = document.getElementById('main-container');
const loginForm = document.getElementById('login-form');
const adminPidInput = document.getElementById('admin-pid');
const adminPasswordInput = document.getElementById('admin-password');
const loginBtn = document.getElementById('login-btn');
const loginMessage = document.getElementById('login-message');
const adminNameSpan = document.getElementById('admin-name');
const logoutBtn = document.getElementById('logout-btn');

// 主界面DOM元素
const userIdInput = document.getElementById('user-id');
const billNoInput = document.getElementById('order-no');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const queryUserBtn = document.getElementById('query-user-btn');
const queryOrderBtn = document.getElementById('query-order-btn');
const queryTimeBtn = document.getElementById('query-time-btn');
const queryAllBtn = document.getElementById('query-all-btn');
const queryAllUsersBtn = document.getElementById('query-all-users-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');
const userInfoDisplay = document.getElementById('user-info');
const usersSection = document.getElementById('users-section');
const usersList = document.getElementById('users-list');
const usersCount = document.getElementById('users-count');
const ordersList = document.getElementById('orders-list');
const resultsCount = document.getElementById('results-count');
const orderDetailModal = document.getElementById('order-detail-modal');
const orderDetailContent = document.getElementById('order-detail-content');
const closeModalBtn = document.querySelector('.close-modal');

// 支付模式管理DOM元素
const currentPaymentMode = document.getElementById('current-payment-mode');
const switchTo2dBtn = document.getElementById('switch-to-2d-btn');
const switchTo3dBtn = document.getElementById('switch-to-3d-btn');
const modeDescription = document.getElementById('mode-description');

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 检查是否已登录
    checkLoginStatus();
    
    // 登录表单提交事件
    loginForm.addEventListener('submit', handleLogin);
    
    // 退出登录事件
    logoutBtn.addEventListener('click', handleLogout);
    
    // 初始化时间选择器默认值
    initDateTimeInputs();
    
    // 初始化支付模式管理
    initPaymentModeManagement();
    
    // 查询按钮点击事件
    queryUserBtn.addEventListener('click', onQueryUser);
    queryOrderBtn.addEventListener('click', onQueryOrder);
    queryTimeBtn.addEventListener('click', onQueryByTimeRange);
    queryAllBtn.addEventListener('click', onQueryAllOrders);
    queryAllUsersBtn.addEventListener('click', onQueryAllUsers);
    
    // 导出Excel按钮点击事件
    exportExcelBtn.addEventListener('click', onExportExcel);
    
    // 支付模式切换按钮点击事件
    switchTo2dBtn.addEventListener('click', () => switchPaymentMode('2D'));
    switchTo3dBtn.addEventListener('click', () => switchPaymentMode('3D'));
    
    // 关闭模态框
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === orderDetailModal) {
            closeModal();
        }
    });
    
    // 输入框回车事件
    userIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            onQueryUser();
        }
    });
    
    billNoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            onQueryOrder();
        }
    });
});

// 初始化时间选择器
function initDateTimeInputs() {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    
    // 起始时间设为一周前的00:00
    const startTime = formatDateForInput(oneWeekAgo, true);
    startTimeInput.value = startTime;
    
    // 结束时间设为今天的23:59
    const endTime = formatDateForInput(now, false);
    endTimeInput.value = endTime;
}

// ==================== 登录管理功能 ====================

// 检查登录状态
function checkLoginStatus() {
    const savedAdmin = localStorage.getItem('adminInfo');
    if (savedAdmin) {
        try {
            currentAdmin = JSON.parse(savedAdmin);
            // 检查登录是否过期（24小时）
            const loginTime = new Date(currentAdmin.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                showMainInterface();
                return;
            } else {
                // 登录已过期
                localStorage.removeItem('adminInfo');
                currentAdmin = null;
            }
        } catch (error) {
            console.error('解析保存的管理员信息失败:', error);
            localStorage.removeItem('adminInfo');
        }
    }
    
    showLoginInterface();
}

// 显示登录界面
function showLoginInterface() {
    loginContainer.style.display = 'flex';
    mainContainer.style.display = 'none';
}

// 显示主界面
function showMainInterface() {
    loginContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    
    // 更新管理员信息显示
    if (currentAdmin) {
        adminNameSpan.textContent = `${currentAdmin.name} (${currentAdmin.pid})`;
    }
}

// 处理登录
async function handleLogin(e) {
    e.preventDefault();
    
    const pid = adminPidInput.value.trim();
    const password = adminPasswordInput.value.trim();
    
    if (!pid || !password) {
        showLoginMessage('请填写完整信息', 'error');
        return;
    }
    
    try {
        // 禁用登录按钮
        loginBtn.disabled = true;
        loginBtn.textContent = '登录中...';
        
        const response = await fetch(`${API_BASE_URL}/admin/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pid, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 登录成功
            currentAdmin = result.data;
            localStorage.setItem('adminInfo', JSON.stringify(currentAdmin));
            
            showLoginMessage('登录成功，正在跳转...', 'success');
            
            // 延迟跳转到主界面
            setTimeout(() => {
                showMainInterface();
            }, 1000);
        } else {
            showLoginMessage(result.message || '登录失败', 'error');
        }
    } catch (error) {
        console.error('登录请求失败:', error);
        showLoginMessage('网络错误，请重试', 'error');
    } finally {
        // 恢复登录按钮
        loginBtn.disabled = false;
        loginBtn.textContent = '登录';
    }
}

// 处理退出登录
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        currentAdmin = null;
        localStorage.removeItem('adminInfo');
        showLoginInterface();
        
        // 清空表单
        adminPidInput.value = '';
        adminPasswordInput.value = '';
        loginMessage.innerHTML = '';
    }
}

// 显示登录消息
function showLoginMessage(message, type = 'info') {
    loginMessage.textContent = message;
    loginMessage.className = `login-message ${type}`;
}

// 格式化日期为datetime-local输入格式
function formatDateForInput(date, isStartTime = true) {
    // 创建新的日期对象，避免修改原对象
    const newDate = new Date(date);
    
    if (isStartTime) {
        // 起始时间设为00:00
        newDate.setHours(0, 0, 0, 0);
    } else {
        // 结束时间设为23:59
        newDate.setHours(23, 59, 0, 0);
    }
    
    // 使用本地时间格式化，避免时区问题
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const hours = String(newDate.getHours()).padStart(2, '0');
    const minutes = String(newDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ==================== 支付模式管理功能 ====================

// 初始化支付模式管理
async function initPaymentModeManagement() {
    try {
        await loadCurrentPaymentMode();
    } catch (error) {
        console.error('初始化支付模式管理失败:', error);
        showPaymentModeError('初始化失败，请刷新页面重试');
    }
}

// 加载当前支付模式
async function loadCurrentPaymentMode() {
    try {
        showPaymentModeLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/config/payment/mode`);
        const result = await response.json();
        
        if (result.success) {
            const mode = result.data.mode;
            updatePaymentModeDisplay(mode);
        } else {
            throw new Error(result.message || '获取支付模式失败');
        }
    } catch (error) {
        console.error('获取支付模式失败:', error);
        showPaymentModeError('获取支付模式失败: ' + error.message);
    }
}

// 切换支付模式
async function switchPaymentMode(targetMode) {
    try {
        // 禁用按钮，防止重复点击
        setPaymentModeButtonsEnabled(false);
        
        const response = await fetch(`${API_BASE_URL}/api/config/payment/mode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mode: targetMode })
        });
        
        const result = await response.json();
        
        if (result.success) {
            updatePaymentModeDisplay(targetMode);
            showPaymentModeSuccess(`支付模式已成功切换到${targetMode}模式`);
        } else {
            throw new Error(result.message || '切换支付模式失败');
        }
    } catch (error) {
        console.error('切换支付模式失败:', error);
        showPaymentModeError('切换支付模式失败: ' + error.message);
    } finally {
        // 重新启用按钮
        setPaymentModeButtonsEnabled(true);
    }
}

// 更新支付模式显示
function updatePaymentModeDisplay(mode) {
    // 更新当前模式显示
    currentPaymentMode.textContent = mode;
    currentPaymentMode.className = `mode-value mode-${mode.toLowerCase()}`;
    
    // 更新按钮状态
    updatePaymentModeButtons(mode);
    
    // 更新描述信息
    updatePaymentModeDescription(mode);
}

// 更新支付模式按钮状态
function updatePaymentModeButtons(currentMode) {
    if (currentMode === '2D') {
        switchTo2dBtn.disabled = true;
        switchTo2dBtn.textContent = '当前为2D模式';
        switchTo3dBtn.disabled = false;
        switchTo3dBtn.textContent = '切换到3D支付';
    } else {
        switchTo2dBtn.disabled = false;
        switchTo2dBtn.textContent = '切换到2D支付';
        switchTo3dBtn.disabled = true;
        switchTo3dBtn.textContent = '当前为3D模式';
    }
}

// 更新支付模式描述
function updatePaymentModeDescription(mode) {
    const descriptions = {
        '2D': '2D支付模式：使用标准支付流程，适用于大多数用户。支付时无需额外的身份验证步骤。',
        '3D': '3D支付模式：使用3D Secure验证，提供更高的安全性。支付时可能需要额外的身份验证步骤。'
    };
    
    modeDescription.textContent = descriptions[mode] || '未知支付模式';
}

// 显示支付模式加载状态
function showPaymentModeLoading() {
    currentPaymentMode.textContent = '加载中...';
    currentPaymentMode.className = 'mode-value loading';
    modeDescription.textContent = '正在获取支付模式信息...';
    setPaymentModeButtonsEnabled(false);
}

// 显示支付模式错误
function showPaymentModeError(message) {
    currentPaymentMode.textContent = '获取失败';
    currentPaymentMode.className = 'mode-value loading';
    modeDescription.textContent = message;
    setPaymentModeButtonsEnabled(false);
}

// 显示支付模式成功消息
function showPaymentModeSuccess(message) {
    // 临时显示成功消息
    const originalText = modeDescription.textContent;
    modeDescription.textContent = message;
    
    // 3秒后恢复原描述
    setTimeout(() => {
        const currentMode = currentPaymentMode.textContent;
        updatePaymentModeDescription(currentMode);
    }, 3000);
}

// 设置支付模式按钮启用状态
function setPaymentModeButtonsEnabled(enabled) {
    switchTo2dBtn.disabled = !enabled;
    switchTo3dBtn.disabled = !enabled;
}

// 查询用户信息
async function onQueryUser() {
    const userId = userIdInput.value.trim();
    
    if (!userId) {
        showMessage(userInfoDisplay, '请输入有效的用户ID');
        clearOrdersList();
        return;
    }
    
    try {
        // 显示加载状态
        userInfoDisplay.innerHTML = '<p class="loading">正在加载用户信息...</p>';
        ordersList.innerHTML = '<p class="loading">正在加载订单信息...</p>';
        
        // 获取用户信息
        const userInfo = await fetchUserInfo(userId);
        
        // 显示用户信息
        if (userInfo) {
            displayUserInfo(userInfo);
            
            // 获取并显示用户订单
            const userOrders = await fetchUserOrders(userId);
            updateOrdersList(userOrders);
            
            // 隐藏用户列表区域
            usersSection.style.display = 'none';
        } else {
            showMessage(userInfoDisplay, '未找到用户信息');
            clearOrdersList();
        }
    } catch (error) {
        console.error('查询用户信息出错:', error);
        showMessage(userInfoDisplay, '查询用户信息失败，请稍后再试');
        clearOrdersList();
    }
}

// 按订单号查询
async function onQueryOrder() {
    const billNo = billNoInput.value.trim();
    
    if (!billNo) {
        showMessage(ordersList, '请输入有效的订单号');
        return;
    }
    
    try {
        // 显示加载状态
        ordersList.innerHTML = '<p class="loading">正在查询订单信息...</p>';
        
        // 获取所有订单
        const allOrders = await fetchAllOrders();
        
        // 过滤订单
        const filteredOrders = allOrders.filter(order => 
            order.order_no && order.order_no.includes(billNo)
        );
        
        // 更新订单列表
        updateOrdersList(filteredOrders);
        
        // 清空用户信息区域
        showMessage(userInfoDisplay, '按订单号查询无需用户信息');
        
        // 隐藏用户列表区域
        usersSection.style.display = 'none';
    } catch (error) {
        console.error('查询订单出错:', error);
        showMessage(ordersList, '查询订单失败，请稍后再试');
    }
}

// 按时间段查询
async function onQueryByTimeRange() {
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    
    if (!startTime || !endTime) {
        showMessage(ordersList, '请选择有效的时间范围');
        return;
    }
    
    try {
        // 显示加载状态
        ordersList.innerHTML = '<p class="loading">正在查询时间段内的订单...</p>';
        
        // 获取所有订单
        const allOrders = await fetchAllOrders();
        
        // 过滤出时间范围内的订单
        // 将本地时间转换为UTC时间进行比较
        const startDate = new Date(startTime + ':00').getTime();
        const endDate = new Date(endTime + ':59').getTime();
        
        const matchedOrders = allOrders.filter(order => {
            if (!order.pay_time) return false;
            
            // 解析订单时间，转换为本地时间进行比较
            const orderDate = new Date(order.pay_time);
            
            return orderDate >= startDate && orderDate <= endDate;
        });
        
        // 更新订单列表
        updateOrdersList(matchedOrders);
        
        // 清空用户信息区域
        showMessage(userInfoDisplay, '按时间段查询无需用户信息');
        
        // 隐藏用户列表区域
        usersSection.style.display = 'none';
    } catch (error) {
        console.error('按时间段查询订单出错:', error);
        showMessage(ordersList, '查询订单失败，请稍后再试');
    }
}

// 查询所有订单
async function onQueryAllOrders() {
    try {
        // 显示加载状态
        ordersList.innerHTML = '<p class="loading">正在加载所有订单信息...</p>';
        
        // 获取所有订单
        const allOrders = await fetchAllOrders();
        
        // 更新订单列表
        updateOrdersList(allOrders);
        
        // 清空用户信息区域
        showMessage(userInfoDisplay, '查询所有订单无需用户信息');
        
        // 隐藏用户列表区域
        usersSection.style.display = 'none';
    } catch (error) {
        console.error('查询所有订单出错:', error);
        showMessage(ordersList, '查询所有订单失败，请稍后再试');
    }
}

// 查询所有用户
async function onQueryAllUsers() {
    try {
        // 显示加载状态
        usersList.innerHTML = '<p class="loading">正在加载所有用户信息...</p>';
        ordersList.innerHTML = '<p class="loading">正在加载用户订单信息...</p>';
        
        // 获取所有用户
        const allUsers = await fetchAllUsers();
        
        // 更新用户列表
        updateUsersList(allUsers);
        
        // 获取所有订单并按用户分组显示
        const allOrders = await fetchAllOrders();
        updateOrdersList(allOrders);
        
        // 显示用户列表区域
        usersSection.style.display = 'block';
        
        // 清空用户信息区域
        showMessage(userInfoDisplay, '查询所有用户无需单独用户信息');
    } catch (error) {
        console.error('查询所有用户出错:', error);
        showMessage(usersList, '查询所有用户失败，请稍后再试');
    }
}

// 导出Excel
function onExportExcel() {
    if (!currentOrders || currentOrders.length === 0) {
        alert('没有可导出的订单数据');
        return;
    }
    
    try {
        // 准备Excel数据
        const excelData = currentOrders.map(order => ({
            '用户ID': order.user_id || '',
            '用户名': order.user_name || '',
            '订单号': order.order_no || '',
            '金额': order.amount || '',
            '支付时间': formatDate(order.pay_time) || '',
            '商品': getOrderItemName(order) || '未知商品'
        }));
        
        // 创建工作表
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // 创建工作簿
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, '订单数据');
        
        // 导出Excel文件
        const fileName = `订单数据_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    } catch (error) {
        console.error('导出Excel出错:', error);
        alert('导出Excel失败，请稍后再试');
    }
}

// 获取订单商品名称
function getOrderItemName(order) {
    try {
        // 先检查是否有product_details字段
        if (order.product_details) {
            let details = typeof order.product_details === 'string' 
                ? JSON.parse(order.product_details) 
                : order.product_details;
            
            // 构建商品描述
            let description = [];
            
            // 添加钻石信息
            if (details.diamonds) {
                description.push(`${details.diamonds} Diamonds`);
            }
            
            // 添加道具信息
            if (details.bombBomb) {
                description.push(`${details.bombBomb} Bomb Blast`);
            }
            if (details.bombHor) {
                description.push(`${details.bombHor} Horizontal Bomb`);
            }
            if (details.bombVer) {
                description.push(`${details.bombVer} Vertical Bomb`);
            }
            if (details.bombAllSame) {
                description.push(`${details.bombAllSame} Color Bomb`);
            }
            
            // 添加首充标记
            if (details.isFirstCharge) {
                description.push("(First Charge)");
            }
            
            // 如果有商品ID，添加商品ID
            if (order.product_id) {
                description.push(`ID: ${order.product_id}`);
            }
            
            // 组合描述
            if (description.length > 0) {
                return description.join(", ");
            }
        }
        
        // 如果没有product_details，尝试从product_info获取
        if (order.product_info) {
            return order.product_info;
        }
        
        // 如果上面都没有，尝试从raw_response解析
        if (order.raw_response) {
            const response = typeof order.raw_response === 'string' 
                ? JSON.parse(order.raw_response) 
                : order.raw_response;
            
            if (response.productInfo) {
                return decodeURIComponent(response.productInfo);
            }
        }
    } catch (e) {
        console.error('解析订单商品信息出错:', e);
    }
    
    // 默认返回未知商品
    return '未知商品';
}

// 获取用户信息
async function fetchUserInfo(userId) {
    try {
        // 尝试多个可能的API端点
        let response = null;
        let endpoint = '';
        
        // 尝试端点1: /api/users/${userId}
        try {
            endpoint = `${API_BASE_URL}/api/users/${userId}`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : null;
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 尝试端点2: /users/${userId}
        try {
            endpoint = `${API_BASE_URL}/users/${userId}`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : null;
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 尝试端点3: /admin/api/users/${userId} (原始端点)
        try {
            endpoint = `${API_BASE_URL}/admin/api/users/${userId}`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : null;
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 所有直接查询端点都失败，尝试降级方案：获取所有用户然后过滤
        try {
            // 获取所有用户
            const allUsers = await fetchAllUsers();
            if (allUsers && allUsers.length > 0) {
                // 在前端过滤用户
                const targetUser = allUsers.find(user => 
                    user.pid === userId || 
                    user.user_id === userId || 
                    user.username === userId
                );
                
                if (targetUser) {
                    return targetUser;
                }
            }
        } catch (fallbackError) {
            console.error('降级方案失败:', fallbackError);
        }
        
        // 所有方案都失败，返回null
        return null;
        
    } catch (error) {
        console.error('获取用户信息失败:', error);
        return null;
    }
}

// 获取用户订单
async function fetchUserOrders(userId) {
    try {
        // 尝试多个可能的API端点
        let response = null;
        let endpoint = '';
        
        // 尝试端点1: /api/payments/user/${userId}
        try {
            endpoint = `${API_BASE_URL}/api/payments/user/${userId}`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : [];
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 尝试端点2: /payments/user/${userId}
        try {
            endpoint = `${API_BASE_URL}/payments/user/${userId}`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : [];
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 尝试端点3: /admin/api/payments/user/${userId} (原始端点)
        try {
            endpoint = `${API_BASE_URL}/admin/api/payments/user/${userId}`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : [];
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 所有直接查询端点都失败，尝试降级方案：获取所有订单然后过滤
        try {
            // 获取所有订单
            const allOrders = await fetchAllOrders();
            if (allOrders && allOrders.length > 0) {
                // 在前端过滤订单
                const userOrders = allOrders.filter(order => 
                    order.user_id === userId || 
                    order.user_name === userId ||
                    (order.user && (order.user.pid === userId || order.user.username === userId))
                );
                
                return userOrders;
            }
        } catch (fallbackError) {
            console.error('降级方案失败:', fallbackError);
        }
        
        // 所有方案都失败，返回空数组
        return [];
        
    } catch (error) {
        console.error('获取用户订单失败:', error);
        return [];
    }
}

// 获取所有订单
async function fetchAllOrders() {
    try {
        // 尝试多个可能的API端点
        let response = null;
        let endpoint = '';
        
        // 尝试端点1: /api/payments
        try {
            endpoint = `${API_BASE_URL}/api/payments`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : [];
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 尝试端点2: /payments
        try {
            endpoint = `${API_BASE_URL}/payments`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : [];
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 尝试端点3: /admin/api/payments (原始端点)
        try {
            endpoint = `${API_BASE_URL}/admin/api/payments`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : [];
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 所有端点都失败，返回空数组
        return [];
        
    } catch (error) {
        console.error('获取所有订单失败:', error);
        return [];
    }
}

// 获取所有用户
async function fetchAllUsers() {
    try {
        // 尝试多个可能的API端点
        let response = null;
        let endpoint = '';
        
        // 尝试端点1: /api/users
        try {
            endpoint = `${API_BASE_URL}/api/users`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : [];
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 尝试端点2: /users
        try {
            endpoint = `${API_BASE_URL}/users`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : [];
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 尝试端点3: /admin/api/users (原始端点)
        try {
            endpoint = `${API_BASE_URL}/admin/api/users`;
            response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                return data.success ? data.data : [];
            }
        } catch (e) {
            // 静默失败，继续尝试下一个端点
        }
        
        // 所有端点都失败，返回空数组
        return [];
        
    } catch (error) {
        console.error('获取所有用户失败:', error);
        return [];
    }
}

// 显示用户信息
function displayUserInfo(user) {
    userInfoDisplay.innerHTML = `
        <div class="user-details">
            <p><strong>用户ID:</strong> ${user.pid || '未知'}</p>
            <p><strong>用户名:</strong> ${user.username || '未知'}</p>
            <p><strong>昵称:</strong> ${user.nickname || '未知'}</p>
            <p><strong>金币:</strong> ${user.gold || 0}</p>
            <p><strong>等级:</strong> ${user.level || 0}</p>
            <p><strong>注册时间:</strong> ${formatDate(user.created_at)}</p>
            <p><strong>最后登录:</strong> ${formatDate(user.last_login)}</p>
        </div>
    `;
}

// 更新订单列表
function updateOrdersList(orders) {
    // 保存当前订单列表到全局变量
    currentOrders = orders || [];
    
    // 更新计数
    resultsCount.textContent = currentOrders.length;
    
    // 更新导出按钮状态
    exportExcelBtn.disabled = currentOrders.length === 0;
    
    if (!currentOrders || currentOrders.length === 0) {
        showMessage(ordersList, '暂无订单信息');
        return;
    }
    
    ordersList.innerHTML = '';
    
    currentOrders.forEach(order => {
        // 获取商品名称
        const productName = getOrderItemName(order);
        
        const orderElement = document.createElement('div');
        orderElement.className = 'order-item';
        orderElement.innerHTML = `
            <p><strong>UserID:</strong> ${order.user_id || '未知'} <strong>Name:</strong> ${order.user_name || '未知'}</p>
            <p><strong>Bill No:</strong> ${order.order_no || '未知'} <strong>Amount:</strong> ${order.amount || 0} <strong>Pay Time:</strong> ${formatDate(order.pay_time) || '未知'}</p>
            <p><strong>Product:</strong> ${productName}</p>
        `;
        
        // 添加点击事件，显示订单详情
        orderElement.addEventListener('click', () => {
            showOrderDetail(order);
        });
        
        ordersList.appendChild(orderElement);
    });
}

// 更新用户列表
function updateUsersList(users) {
    // 更新用户计数
    usersCount.textContent = users.length;
    
    if (!users || users.length === 0) {
        showMessage(usersList, '暂无用户信息');
        return;
    }
    
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = `
            <div class="user-header">
                <p><strong>用户ID:</strong> ${user.pid || '未知'}</p>
                <p><strong>用户名:</strong> ${user.username || '未知'}</p>
                <p><strong>昵称:</strong> ${user.nickname || '未知'}</p>
            </div>
            <div class="user-details">
                <p><strong>金币:</strong> ${user.gold || 0}</p>
                <p><strong>等级:</strong> ${user.level || 0}</p>
                <p><strong>注册时间:</strong> ${formatDate(user.created_at) || '未知'}</p>
                <p><strong>最后登录:</strong> ${formatDate(user.last_login) || '未知'}</p>
            </div>
        `;
        
        // 添加点击事件，显示用户详情
        userElement.addEventListener('click', () => {
            showUserDetail(user);
        });
        
        usersList.appendChild(userElement);
    });
}

// 显示订单详情
function showOrderDetail(order) {
    // 解析raw_response
    let rawResponseObj = {};
    try {
        if (order.raw_response) {
            rawResponseObj = typeof order.raw_response === 'string' 
                ? JSON.parse(order.raw_response) 
                : order.raw_response;
        }
    } catch (e) {
        console.error('解析订单详情出错:', e);
        rawResponseObj = { error: '订单详情解析失败' };
    }
    
    // 获取商品信息
    const itemName = getOrderItemName(order);
    
    // 解析商品详情
    let productDetailsHtml = '';
    try {
        if (order.product_details) {
            const details = typeof order.product_details === 'string' 
                ? JSON.parse(order.product_details) 
                : order.product_details;
            
            productDetailsHtml = '<div class="product-details">';
            
            // 添加商品ID
            if (order.product_id) {
                productDetailsHtml += `<p><strong>商品ID:</strong> ${order.product_id}</p>`;
            }
            
            // 添加钻石信息
            if (details.diamonds) {
                productDetailsHtml += `<p><strong>钻石:</strong> ${details.diamonds}</p>`;
            }
            
            // 添加道具信息
            if (details.bombBomb) {
                productDetailsHtml += `<p><strong>炸弹:</strong> ${details.bombBomb}</p>`;
            }
            if (details.bombHor) {
                productDetailsHtml += `<p><strong>横向炸弹:</strong> ${details.bombHor}</p>`;
            }
            if (details.bombVer) {
                productDetailsHtml += `<p><strong>竖向炸弹:</strong> ${details.bombVer}</p>`;
            }
            if (details.bombAllSame) {
                productDetailsHtml += `<p><strong>同类型炸弹:</strong> ${details.bombAllSame}</p>`;
            }
            
            // 添加首充标记
            if (details.isFirstCharge) {
                productDetailsHtml += `<p><strong>首充礼包:</strong> 是</p>`;
            }
            
            productDetailsHtml += '</div>';
        }
    } catch (e) {
        console.error('解析商品详情出错:', e);
        productDetailsHtml = '<p>商品详情解析失败</p>';
    }
    
    // 修改模态框标题
    const modalTitle = orderDetailModal.querySelector('.modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = '订单详情';
    }
    
    // 填充订单详情内容
    orderDetailContent.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">用户信息</div>
            <div class="detail-value">
                <p><strong>用户ID:</strong> ${order.user_id || '未知'}</p>
                <p><strong>用户名:</strong> ${order.user_name || '未知'}</p>
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">订单信息</div>
            <div class="detail-value">
                <p><strong>订单号:</strong> ${order.order_no || '未知'}</p>
                <p><strong>金额:</strong> ${order.amount || 0}</p>
                <p><strong>支付时间:</strong> ${formatDate(order.pay_time) || '未知'}</p>
                <p><strong>商品:</strong> ${itemName}</p>
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">商品详情</div>
            <div class="detail-value">
                ${productDetailsHtml || '<p>无商品详情</p>'}
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">原始响应</div>
            <div class="detail-value">
                <pre>${JSON.stringify(rawResponseObj, null, 2)}</pre>
            </div>
        </div>
    `;
    
    // 显示模态框
    orderDetailModal.style.display = 'block';
}

// 显示用户详情
function showUserDetail(user) {
    // 填充用户详情内容
    orderDetailContent.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">用户基本信息</div>
            <div class="detail-value">
                <p><strong>用户ID:</strong> ${user.pid || '未知'}</p>
                <p><strong>用户名:</strong> ${user.username || '未知'}</p>
                <p><strong>昵称:</strong> ${user.nickname || '未知'}</p>
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">游戏数据</div>
            <div class="detail-value">
                <p><strong>金币:</strong> ${user.gold || 0}</p>
                <p><strong>等级:</strong> ${user.level || 0}</p>
            </div>
        </div>
        <div class="detail-item">
            <div class="detail-label">时间信息</div>
            <div class="detail-value">
                <p><strong>注册时间:</strong> ${formatDate(user.created_at) || '未知'}</p>
                <p><strong>最后登录:</strong> ${formatDate(user.last_login) || '未知'}</p>
            </div>
        </div>
    `;
    
    // 修改模态框标题
    const modalTitle = orderDetailModal.querySelector('.modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = '用户详情';
    }
    
    // 显示模态框
    orderDetailModal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    orderDetailModal.style.display = 'none';
}

// 清空订单列表
function clearOrdersList() {
    currentOrders = [];
    resultsCount.textContent = '0';
    exportExcelBtn.disabled = true;
    showMessage(ordersList, '暂无订单信息');
}

// 显示消息
function showMessage(element, message) {
    element.innerHTML = `<p class="empty-message">${message}</p>`;
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '未知';
    
    try {
        const date = new Date(dateString);
        
        // 检查日期是否有效
        if (isNaN(date.getTime())) {
            console.warn('无效的日期字符串:', dateString);
            return dateString;
        }
        
        // 使用中国时区格式化
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Shanghai'
        });
    } catch (error) {
        console.error('格式化日期出错:', error, dateString);
        return dateString;
    }
} 