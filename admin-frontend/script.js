// 配置API基础URL
const API_BASE_URL = 'http://119.91.142.92:3001/api';

// 全局变量
let currentOrders = []; // 存储当前查询到的订单列表

// DOM元素
const userIdInput = document.getElementById('user-id');
const billNoInput = document.getElementById('order-no');
const startTimeInput = document.getElementById('start-time');
const endTimeInput = document.getElementById('end-time');
const queryUserBtn = document.getElementById('query-user-btn');
const queryOrderBtn = document.getElementById('query-order-btn');
const queryTimeBtn = document.getElementById('query-time-btn');
const queryAllBtn = document.getElementById('query-all-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');
const userInfoDisplay = document.getElementById('user-info');
const ordersList = document.getElementById('orders-list');
const resultsCount = document.getElementById('results-count');
const orderDetailModal = document.getElementById('order-detail-modal');
const orderDetailContent = document.getElementById('order-detail-content');
const closeModalBtn = document.querySelector('.close-modal');

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 初始化时间选择器默认值
    initDateTimeInputs();
    
    // 查询按钮点击事件
    queryUserBtn.addEventListener('click', onQueryUser);
    queryOrderBtn.addEventListener('click', onQueryOrder);
    queryTimeBtn.addEventListener('click', onQueryByTimeRange);
    queryAllBtn.addEventListener('click', onQueryAllOrders);
    
    // 导出Excel按钮点击事件
    exportExcelBtn.addEventListener('click', onExportExcel);
    
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
    
    startTimeInput.value = formatDateForInput(oneWeekAgo);
    endTimeInput.value = formatDateForInput(now);
}

// 格式化日期为datetime-local输入格式
function formatDateForInput(date) {
    return date.toISOString().slice(0, 16);
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
        
        console.log('查询时间范围:', {
            startTime: new Date(startDate).toISOString(),
            endTime: new Date(endDate).toISOString()
        });
        
        const matchedOrders = allOrders.filter(order => {
            if (!order.pay_time) return false;
            
            // 解析订单时间，转换为本地时间进行比较
            const orderDate = new Date(order.pay_time);
            
            console.log('订单时间:', {
                orderNo: order.order_no,
                payTime: order.pay_time,
                orderDateLocal: orderDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
                orderDateUTC: orderDate.toISOString(),
                inRange: orderDate >= startDate && orderDate <= endDate
            });
            
            return orderDate >= startDate && orderDate <= endDate;
        });
        
        // 更新订单列表
        updateOrdersList(matchedOrders);
        
        // 清空用户信息区域
        showMessage(userInfoDisplay, '按时间段查询无需用户信息');
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
    } catch (error) {
        console.error('查询所有订单出错:', error);
        showMessage(ordersList, '查询所有订单失败，请稍后再试');
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
        const response = await fetch(`${API_BASE_URL}/users/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error('获取用户信息失败:', error);
        throw error;
    }
}

// 获取用户订单
async function fetchUserOrders(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/user/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('获取用户订单失败:', error);
        throw error;
    }
}

// 获取所有订单
async function fetchAllOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/all`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('获取所有订单失败:', error);
        throw error;
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