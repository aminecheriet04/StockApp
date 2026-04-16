// ========== متغيرات عامة ==========
var products = [];
var purchases = [];
var sales = [];
var expenses = [];
var suppliers = [];
var customers = [];
var cashBalance = 50000;
var currentUser = null;
var purchaseOrderItems = [];
var nextPOId = 1;

// ========== دوال الاختبار ==========
function testDirectFetch() {
    console.log("=== اختبار الاتصال المباشر ===");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'GetProducts.jsp', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("البيانات الخام:");
            console.log(xhr.responseText);
            try {
                var data = JSON.parse(xhr.responseText);
                alert("✅ تم استلام " + data.length + " منتج\n\n" + JSON.stringify(data, null, 2).substring(0, 500));
                // تحديث المنتجات
                products = data;
                updateProductsTable();
                updateDashboardStats();
                updateSmartAlerts();
                updateProductSelects();
                updatePurchaseOrderProductSelect();
            } catch(e) {
                alert("❌ خطأ في تحليل JSON: " + e.message);
            }
        } else if (xhr.readyState === 4) {
            alert("❌ فشل الاتصال: " + xhr.status);
        }
    };
    xhr.send();
}

function forceRefresh() {
    console.log("=== إعادة تحميل قسري ===");
    loadProductsFromDB();
}

function showDebugInfo() {
    var debugDiv = document.getElementById('debugInfo');
    if (!debugDiv) return;
    debugDiv.innerHTML = '🔄 جاري التحديث...';
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'GetProducts.jsp', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var info = '';
            info += '📡 HTTP Status: 200 ✅<br>';
            info += '📦 عدد المنتجات: ' + (products ? products.length : 0) + '<br>';
            info += '📄 حجم البيانات: ' + xhr.responseText.length + ' حرف<br>';
            info += '🕒 آخر تحديث: ' + new Date().toLocaleTimeString() + '<br>';
            if (xhr.responseText.length > 0) {
                info += '📋 أول 100 حرف: ' + xhr.responseText.substring(0, 100) + '...<br>';
            }
            debugDiv.innerHTML = info;
        } else if (xhr.readyState === 4) {
            debugDiv.innerHTML = '❌ خطأ: HTTP ' + xhr.status;
        }
    };
    xhr.send();
}

// ========== تحميل المنتجات من قاعدة البيانات ==========
function loadProductsFromDB() {
    console.log("جاري تحميل المنتجات من قاعدة البيانات...");
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'GetProducts.jsp', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var responseText = xhr.responseText;
                console.log("الرد: " + responseText);
                
                if (responseText && responseText !== "[]") {
                    products = JSON.parse(responseText);
                    console.log("تم تحميل " + products.length + " منتج");
                } else {
                    products = [];
                    console.log("لا توجد منتجات");
                }
                
                // تحديث جميع العناصر
                updateProductsTable();
                updateDashboardStats();
                updateSmartAlerts();
                updateProductSelects();
                updatePurchaseOrderProductSelect();
                showDebugInfo();
                
            } catch(e) {
                console.error("خطأ: " + e.message);
                products = [];
                updateProductsTable();
            }
        } else if (xhr.readyState === 4) {
            console.error("HTTP خطأ: " + xhr.status);
        }
    };
    xhr.send();
}

// ========== عرض جدول المنتجات ==========
function updateProductsTable() {
    var tbody = document.getElementById('productsTable');
    if (!tbody) {
        console.error("productsTable غير موجود!");
        return;
    }
    
    console.log("تحديث الجدول. عدد المنتجات: " + (products ? products.length : 0));
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#f59e0b;">⚠️ لا توجد منتجات في قاعدة البيانات<\/td><\/tr>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        var status = (p.quantity < p.minQuantity) ? 
            '<span style="color:#f43f5e;">⚠️ منخفض</span>' : 
            '<span style="color:#10b981;">✅ جيد</span>';
        
        html += '<tr>';
        html += '<td>' + p.id + '</td>';
        html += '<td>' + (p.name || 'بدون اسم') + '</td>';
        html += '<td>' + (p.quantity || 0) + '</td>';
        html += '<td>' + (p.sellPrice || 0) + ' دج<\/td>';
        html += '<td>' + (p.buyPrice || 0) + ' دج<\/td>';
        html += '<td>' + status + '<\/td>';
        html += '<td><button class="btn-delete" onclick="deleteProduct(' + p.id + ')">🗑️ حذف<\/button><\/td>';
        html += '</tr>';
    }
    tbody.innerHTML = html;
    console.log("تم تحديث الجدول بنجاح");
}

// ========== إضافة منتج ==========
function addProduct() {
    var name = document.getElementById('prodName').value;
    var qty = parseInt(document.getElementById('prodQty').value);
    var sellPrice = parseFloat(document.getElementById('prodPrice').value);
    var buyPrice = parseFloat(document.getElementById('prodBuyPrice').value);
    var minQty = parseInt(document.getElementById('prodMin').value) || 10;
    
    if (!name || isNaN(qty) || isNaN(sellPrice)) { 
        showMessage("املأ جميع الحقول", "error"); 
        return; 
    }
    
    showMessage("جاري إضافة المنتج...", "success");
    console.log("إرسال طلب إضافة: " + name);
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'AddProduct.jsp', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var result = JSON.parse(xhr.responseText);
            console.log("رد الخادم: ", result);
            if (result.success) {
                showMessage("✅ تم إضافة المنتج", "success");
                loadProductsFromDB();
                document.getElementById('prodName').value = '';
                document.getElementById('prodQty').value = '';
                document.getElementById('prodPrice').value = '';
                document.getElementById('prodBuyPrice').value = '';
            } else {
                showMessage("❌ " + result.message, "error");
            }
        }
    };
    var data = 'name=' + encodeURIComponent(name) + 
               '&quantity=' + qty + 
               '&sellPrice=' + sellPrice + 
               '&buyPrice=' + buyPrice + 
               '&minQuantity=' + minQty;
    xhr.send(data);
}

// ========== حذف منتج ==========
function deleteProduct(id) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    
    showMessage("جاري حذف المنتج...", "success");
    console.log("حذف المنتج ID: " + id);
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'DeleteProduct.jsp', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var result = JSON.parse(xhr.responseText);
            if (result.success) {
                showMessage("✅ تم حذف المنتج", "success");
                loadProductsFromDB();
            } else {
                showMessage("❌ " + result.message, "error");
            }
        }
    };
    xhr.send('id=' + id);
}

// ========== تحديث قوائم المنتجات ==========
function updateProductSelects() {
    var purchaseSelect = document.getElementById('purchaseProduct');
    var saleSelect = document.getElementById('saleProduct');
    
    if (purchaseSelect) {
        var html = '';
        for (var i = 0; i < products.length; i++) {
            html += '<option value="' + products[i].id + '">' + products[i].name + '</option>';
        }
        purchaseSelect.innerHTML = html;
    }
    
    if (saleSelect) {
        var html = '';
        for (var i = 0; i < products.length; i++) {
            html += '<option value="' + products[i].id + '">' + products[i].name + ' - ' + products[i].quantity + ' قطعة</option>';
        }
        saleSelect.innerHTML = html;
    }
}

// ========== تحديث قائمة فاتورة الشراء ==========
function updatePurchaseOrderProductSelect() {
    var select = document.getElementById('poProduct');
    if (!select) return;
    var html = '<option value="">اختر المنتج...</option>';
    for (var i = 0; i < products.length; i++) {
        html += '<option value="' + products[i].id + '">' + products[i].name + ' - المخزون: ' + products[i].quantity + '</option>';
    }
    select.innerHTML = html;
}

// ========== التنبيهات الذكية ==========
function updateSmartAlerts() {
    var alertsHtml = '';
    var criticalProducts = [];
    var lowProducts = [];
    
    for (var i = 0; i < products.length; i++) {
        var p = products[i];
        if (p.quantity <= 0) criticalProducts.push(p);
        else if (p.quantity < p.minQuantity) lowProducts.push(p);
    }
    
    if (criticalProducts.length > 0) {
        alertsHtml += '<div class="alert-card alert-critical"><div class="alert-icon">🚨</div><div class="alert-content"><h4>تنبيه عاجل - منتجات نفدت</h4><div class="alert-items">';
        for (var i = 0; i < criticalProducts.length; i++) {
            alertsHtml += '<div class="alert-item-critical">📦 ' + criticalProducts[i].name + ' - الكمية: 0 - يجب التوريد فوراً!</div>';
        }
        alertsHtml += '</div></div></div>';
    }
    
    if (lowProducts.length > 0) {
        alertsHtml += '<div class="alert-card alert-warning"><div class="alert-icon">⚠️</div><div class="alert-content"><h4>تنبيه - منتجات أقل من الحد الأدنى</h4><div class="alert-items">';
        for (var i = 0; i < lowProducts.length; i++) {
            var p = lowProducts[i];
            var needed = p.minQuantity - p.quantity;
            alertsHtml += '<div class="alert-item-warning">📦 ' + p.name + ' - المتبقي: ' + p.quantity + ' - يوصى بإضافة ' + (needed + 10) + ' قطعة</div>';
        }
        alertsHtml += '</div></div></div>';
    }
    
    var totalValue = 0;
    for (var i = 0; i < products.length; i++) totalValue += products[i].quantity * products[i].sellPrice;
    
    alertsHtml += '<div class="stats-mini">';
    alertsHtml += '<div class="stat-mini">📦 إجمالي المنتجات: ' + products.length + '</div>';
    alertsHtml += '<div class="stat-mini">💰 قيمة المخزون: ' + totalValue.toLocaleString() + ' دج</div>';
    alertsHtml += '<div class="stat-mini">⚠️ منتجات ناقصة: ' + lowProducts.length + '</div>';
    alertsHtml += '<div class="stat-mini">🚨 منتجات منفذة: ' + criticalProducts.length + '</div>';
    alertsHtml += '</div>';
    
    if (criticalProducts.length === 0 && lowProducts.length === 0) {
        alertsHtml = '<div class="alert-card alert-success"><div class="alert-icon">✅</div><div class="alert-content"><h4>المخزون آمن</h4><p>جميع المنتجات ضمن الحدود الآمنة</p><div class="stats-mini"><div class="stat-mini">📦 إجمالي المنتجات: ' + products.length + '</div><div class="stat-mini">💰 قيمة المخزون: ' + totalValue.toLocaleString() + ' دج</div></div></div></div>';
    }
    
    document.getElementById('smartAlerts').innerHTML = alertsHtml;
}

// ========== إحصائيات لوحة التحكم ==========
function updateDashboardStats() {
    var totalProducts = products.length;
    var lowStock = 0;
    var outStock = 0;
    var totalSalesAmount = 0;
    var totalProfit = 0;
    
    for (var i = 0; i < products.length; i++) {
        if (products[i].quantity < products[i].minQuantity) lowStock++;
        if (products[i].quantity === 0) outStock++;
    }
    for (var i = 0; i < sales.length; i++) {
        totalSalesAmount += sales[i].total;
        totalProfit += sales[i].profit || 0;
    }
    
    var html = '';
    html += '<div class="stat-card"><div>💰 إجمالي المبيعات</div><div class="value">' + totalSalesAmount.toLocaleString() + ' دج</div></div>';
    html += '<div class="stat-card"><div>📦 إجمالي المنتجات</div><div class="value">' + totalProducts + '</div></div>';
    html += '<div class="stat-card"><div>⚠️ منتجات ناقصة</div><div class="value">' + lowStock + '</div></div>';
    html += '<div class="stat-card"><div>🚫 منتجات منفذة</div><div class="value">' + outStock + '</div></div>';
    html += '<div class="stat-card"><div>👥 العملاء</div><div class="value">' + customers.length + '</div></div>';
    html += '<div class="stat-card"><div>🏭 الموردين</div><div class="value">' + suppliers.length + '</div></div>';
    html += '<div class="stat-card"><div>💰 صافي الربح</div><div class="value">' + totalProfit.toLocaleString() + ' دج</div></div>';
    
    document.getElementById('dashboardStats').innerHTML = html;
}

// ========== تسجيل الدخول ==========
function doLogin() {
    var user = document.getElementById('username').value;
    var pass = document.getElementById('password').value;
    if (user === "admin" && pass === "1234") {
        currentUser = user;
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainSystem').style.display = 'block';
        loadAllData();
    } else {
        document.getElementById('errorMsg').style.display = 'block';
        setTimeout(function() { document.getElementById('errorMsg').style.display = 'none'; }, 3000);
    }
}

// ========== تحميل جميع البيانات ==========
function loadAllData() {
    loadProductsFromDB();
    
    var savedPurchases = localStorage.getItem('store_purchases');
    var savedSales = localStorage.getItem('store_sales');
    var savedExpenses = localStorage.getItem('store_expenses');
    var savedSuppliers = localStorage.getItem('store_suppliers');
    var savedCustomers = localStorage.getItem('store_customers');
    var savedCash = localStorage.getItem('store_cash');
    
    purchases = savedPurchases ? JSON.parse(savedPurchases) : [];
    sales = savedSales ? JSON.parse(savedSales) : [];
    expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
    suppliers = savedSuppliers ? JSON.parse(savedSuppliers) : [{ id: 1, name: "شركة التقنية", phone: "0555123456", address: "الرياض" }, { id: 2, name: "مؤسسة الإلكترونيات", phone: "0555234567", address: "جدة" }];
    customers = savedCustomers ? JSON.parse(savedCustomers) : [{ id: 1, name: "أحمد محمد", phone: "0555345678", address: "الدمام", points: 0 }, { id: 2, name: "سارة علي", phone: "0555456789", address: "الخبر", points: 0 }];
    cashBalance = savedCash ? parseFloat(savedCash) : 50000;
    
    updatePurchasesTable();
    updateSalesTable();
    updateExpensesTable();
    updateSuppliersTable();
    updateCustomersTable();
    updateCashPage();
    updateReportsStats();
    updateCustomerSelect();
    updatePurchaseOrderSupplierSelect();
}

function saveAllData() {
    localStorage.setItem('store_purchases', JSON.stringify(purchases));
    localStorage.setItem('store_sales', JSON.stringify(sales));
    localStorage.setItem('store_expenses', JSON.stringify(expenses));
    localStorage.setItem('store_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('store_customers', JSON.stringify(customers));
    localStorage.setItem('store_cash', cashBalance);
}

// ========== تبديل الصفحات ==========
function showPage(page) {
    var pages = ['dashboard', 'products', 'purchases', 'sales', 'expenses', 'cash', 'suppliers', 'customers', 'reports', 'purchaseOrder', 'calculator', 'settings'];
    for (var i = 0; i < pages.length; i++) {
        var p = document.getElementById('page' + pages[i].charAt(0).toUpperCase() + pages[i].slice(1));
        if (p) p.classList.remove('active');
    }
    var activePage = document.getElementById('page' + page.charAt(0).toUpperCase() + page.slice(1));
    if (activePage) activePage.classList.add('active');
    
    var navItems = document.querySelectorAll('.nav-item');
    for (var i = 0; i < navItems.length; i++) navItems[i].classList.remove('active');
    if (window.event && window.event.target) {
        var target = window.event.target;
        while (target && (!target.classList || !target.classList.contains('nav-item'))) target = target.parentElement;
        if (target && target.classList) target.classList.add('active');
    }
    
    if (page === 'dashboard') { updateDashboardStats(); updateSmartAlerts(); showDebugInfo(); }
    if (page === 'cash') updateCashPage();
    if (page === 'reports') updateReportsStats();
}

// ========== باقي الدوال (مختصرة للاختصار - نفس الدوال السابقة) ==========
function updatePurchasesTable() {
    var tbody = document.getElementById('purchasesTable');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < purchases.length; i++) {
        var pr = purchases[i];
        html += '<td>' + pr.date + '</td>';
        html += '<td>' + pr.productName + '</td>';
        html += '<td>' + pr.quantity + '</td>';
        html += '<td>' + pr.price + ' دج<\/td>';
        html += '<td>' + pr.total + ' دج<\/td>';
        html += '</tr>';
    }
    tbody.innerHTML = html || '<tr><td colspan="5">لا توجد مشتريات<\/td><\/tr>';
}

function addPurchase() {
    var productId = parseInt(document.getElementById('purchaseProduct').value);
    var qty = parseInt(document.getElementById('purchaseQty').value);
    var price = parseFloat(document.getElementById('purchasePrice').value);
    if (isNaN(productId) || isNaN(qty) || isNaN(price)) { showMessage("املأ جميع الحقول", "error"); return; }
    var product = null;
    for (var i = 0; i < products.length; i++) { if (products[i].id === productId) { product = products[i]; break; } }
    if (!product) { showMessage("المنتج غير موجود", "error"); return; }
    var total = price * qty;
    product.quantity += qty;
    var now = new Date();
    var dateStr = now.toLocaleDateString('ar-EG');
    purchases.unshift({ id: Date.now(), productId: productId, productName: product.name, quantity: qty, price: price, total: total, date: dateStr });
    if (purchases.length > 100) purchases.pop();
    cashBalance -= total;
    saveAllData(); loadProductsFromDB(); updatePurchasesTable(); updateCashPage();
    showMessage("تم تسجيل الشراء", "success");
    document.getElementById('purchaseQty').value = '';
    document.getElementById('purchasePrice').value = '';
}

function updateCustomerSelect() {
    var customerSelect = document.getElementById('saleCustomer');
    if (customerSelect) { var html = '<option value="">بدون عميل</option>'; for (var i = 0; i < customers.length; i++) { html += '<option value="' + customers[i].id + '">' + customers[i].name + '</option>'; } customerSelect.innerHTML = html; }
}

function updateSalesTable() {
    var tbody = document.getElementById('salesTable');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < sales.length; i++) {
        var s = sales[i];
        html += '<td>' + s.date + '<td>' + s.productName + '<td>' + (s.customerName || '-') + '<td>' + s.quantity + '<td>' + s.price + ' دج<\/td>' + '<td>' + s.total + ' دج<\/td>' + '<td>' + (s.profit || 0) + ' دج<\/td>' + '</tr>';
    }
    tbody.innerHTML = html || '<tr><td colspan="7">لا توجد مبيعات<\/td><\/tr>';
}

function addSale() {
    var productId = parseInt(document.getElementById('saleProduct').value);
    var qty = parseInt(document.getElementById('saleQty').value);
    var customerId = parseInt(document.getElementById('saleCustomer').value);
    if (isNaN(productId) || isNaN(qty) || qty <= 0) { showMessage("اختر منتج وكمية صحيحة", "error"); return; }
    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'AddSale.jsp', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var result = JSON.parse(xhr.responseText);
            if (result.success) {
                showMessage("✅ تم البيع. المبلغ: " + result.total + " دج", "success");
                loadProductsFromDB();
                document.getElementById('saleQty').value = '';
                var now = new Date();
                var product = null;
                for (var i = 0; i < products.length; i++) { if (products[i].id === productId) { product = products[i]; break; } }
                if (product) {
                    var customerName = "";
                    for (var i = 0; i < customers.length; i++) { if (customers[i].id === customerId) { customerName = customers[i].name; break; } }
                    sales.unshift({ id: Date.now(), productId: productId, productName: product.name, quantity: qty, price: product.sellPrice, total: result.total, profit: result.profit, customerId: customerId, customerName: customerName, date: now.toLocaleDateString('ar-EG') });
                    updateSalesTable();
                    updateCashPage();
                    saveAllData();
                }
            } else {
                showMessage("❌ " + result.message, "error");
            }
        }
    };
    xhr.send('productId=' + productId + '&quantity=' + qty + '&customerId=' + (customerId || 0));
}

function updateExpensesTable() {
    var tbody = document.getElementById('expensesTable');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < expenses.length; i++) {
        var e = expenses[i];
        html += '<td>' + e.date + '</td>' + '<td>' + e.name + '</td>' + '<td>' + e.amount + ' دج<\/td>' + '<td>' + (e.note || '') + '<\/td>' + '<td><button class="btn-delete" onclick="deleteExpense(' + e.id + ')">🗑️<\/button><\/td>' + '</tr>';
    }
    tbody.innerHTML = html || '<td><td colspan="5">لا توجد مصروفات<\/td><\/tr>';
}

function addExpense() {
    var name = document.getElementById('expenseName').value;
    var amount = parseFloat(document.getElementById('expenseAmount').value);
    var note = document.getElementById('expenseNote').value;
    if (!name || isNaN(amount)) { showMessage("املأ جميع الحقول", "error"); return; }
    var now = new Date();
    var dateStr = now.toLocaleDateString('ar-EG');
    expenses.unshift({ id: Date.now(), name: name, amount: amount, note: note, date: dateStr });
    if (expenses.length > 100) expenses.pop();
    cashBalance -= amount;
    saveAllData(); updateExpensesTable(); updateCashPage();
    showMessage("تم إضافة المصروف", "success");
    document.getElementById('expenseName').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseNote').value = '';
}

function deleteExpense(id) {
    var newExpenses = [];
    for (var i = 0; i < expenses.length; i++) { if (expenses[i].id !== id) newExpenses.push(expenses[i]); }
    expenses = newExpenses;
    saveAllData(); updateExpensesTable(); updateCashPage();
    showMessage("تم حذف المصروف", "success");
}

function updateCashPage() {
    var html = '';
    html += '<div class="stat-card"><div>💰 رصيد الصندوق</div><div class="value">' + cashBalance.toLocaleString() + ' دج</div></div>';
    var totalSales = 0; for (var i = 0; i < sales.length; i++) { totalSales += sales[i].total; }
    var totalPurchases = 0; for (var i = 0; i < purchases.length; i++) { totalPurchases += purchases[i].total; }
    var totalExpenses = 0; for (var i = 0; i < expenses.length; i++) { totalExpenses += expenses[i].amount; }
    html += '<div class="stat-card"><div>📈 إجمالي المبيعات</div><div class="value">' + totalSales.toLocaleString() + ' دج</div></div>';
    html += '<div class="stat-card"><div>📉 إجمالي المشتريات</div><div class="value">' + totalPurchases.toLocaleString() + ' دج</div></div>';
    html += '<div class="stat-card"><div>📝 إجمالي المصروفات</div><div class="value">' + totalExpenses.toLocaleString() + ' دج</div></div>';
    document.getElementById('cashStats').innerHTML = html;
}

function updateCash() {
    var amount = parseFloat(document.getElementById('cashAmount').value);
    var type = document.getElementById('cashType').value;
    if (isNaN(amount)) { showMessage("أدخل مبلغ صحيح", "error"); return; }
    if (type === 'in') { cashBalance += amount; showMessage("تم إيداع " + amount + " دج", "success"); }
    else { if (cashBalance < amount) { showMessage("الرصيد غير كافٍ", "error"); return; } cashBalance -= amount; showMessage("تم سحب " + amount + " دج", "success"); }
    saveAllData(); updateCashPage();
    document.getElementById('cashAmount').value = '';
}

function updateSuppliersTable() {
    var tbody = document.getElementById('suppliersTable');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < suppliers.length; i++) {
        var s = suppliers[i];
        html += '<td>' + s.id + '</td>' + '<td>' + s.name + '</td>' + '<td>' + s.phone + '<td>' + s.address + '</td>' + '<td><button class="btn-delete" onclick="deleteSupplier(' + s.id + ')">🗑️<\/button><\/td>' + '</tr>';
    }
    tbody.innerHTML = html;
}

function addSupplier() {
    var name = document.getElementById('supplierName').value;
    var phone = document.getElementById('supplierPhone').value;
    var address = document.getElementById('supplierAddress').value;
    if (!name) { showMessage("أدخل اسم المورد", "error"); return; }
    var newId = 1; for (var i = 0; i < suppliers.length; i++) { if (suppliers[i].id >= newId) newId = suppliers[i].id + 1; }
    suppliers.push({ id: newId, name: name, phone: phone, address: address });
    saveAllData(); updateSuppliersTable(); updatePurchaseOrderSupplierSelect();
    showMessage("تم إضافة المورد", "success");
    document.getElementById('supplierName').value = '';
    document.getElementById('supplierPhone').value = '';
    document.getElementById('supplierAddress').value = '';
}

function deleteSupplier(id) {
    if (!confirm("هل أنت متأكد؟")) return;
    var newSuppliers = [];
    for (var i = 0; i < suppliers.length; i++) { if (suppliers[i].id !== id) newSuppliers.push(suppliers[i]); }
    suppliers = newSuppliers;
    saveAllData(); updateSuppliersTable(); updatePurchaseOrderSupplierSelect();
    showMessage("تم حذف المورد", "success");
}

function updateCustomersTable() {
    var tbody = document.getElementById('customersTable');
    if (!tbody) return;
    var html = '';
    for (var i = 0; i < customers.length; i++) {
        var c = customers[i];
        html += '<td>' + c.id + '</td>' + '<td>' + c.name + '</td>' + '<td>' + c.phone + '<td>' + c.address + '<td>' + c.points + '<td>' + '<td><button class="btn-delete" onclick="deleteCustomer(' + c.id + ')">🗑️<\/button><\/td>' + '</tr>';
    }
    tbody.innerHTML = html;
}

function addCustomer() {
    var name = document.getElementById('customerName').value;
    var phone = document.getElementById('customerPhone').value;
    var address = document.getElementById('customerAddress').value;
    if (!name) { showMessage("أدخل اسم العميل", "error"); return; }
    var newId = 1; for (var i = 0; i < customers.length; i++) { if (customers[i].id >= newId) newId = customers[i].id + 1; }
    customers.push({ id: newId, name: name, phone: phone, address: address, points: 0 });
    saveAllData(); updateCustomersTable(); updateCustomerSelect();
    showMessage("تم إضافة العميل", "success");
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
}

function deleteCustomer(id) {
    if (!confirm("هل أنت متأكد؟")) return;
    var newCustomers = [];
    for (var i = 0; i < customers.length; i++) { if (customers[i].id !== id) newCustomers.push(customers[i]); }
    customers = newCustomers;
    saveAllData(); updateCustomersTable(); updateCustomerSelect();
    showMessage("تم حذف العميل", "success");
}

function updateReportsStats() {
    var totalProducts = products.length;
    var lowStock = 0; for (var i = 0; i < products.length; i++) { if (products[i].quantity < products[i].minQuantity) lowStock++; }
    var totalSales = 0; for (var i = 0; i < sales.length; i++) { totalSales += sales[i].total; }
    var totalPurchases = 0; for (var i = 0; i < purchases.length; i++) { totalPurchases += purchases[i].total; }
    var totalProfit = 0; for (var i = 0; i < sales.length; i++) { totalProfit += sales[i].profit || 0; }
    var html = '';
    html += '<div class="stat-card"><div>📦 إجمالي المنتجات</div><div class="value">' + totalProducts + '</div></div>';
    html += '<div class="stat-card"><div>⚠️ منتجات ناقصة</div><div class="value">' + lowStock + '</div></div>';
    html += '<div class="stat-card"><div>💰 إجمالي المبيعات</div><div class="value">' + totalSales.toLocaleString() + ' دج</div></div>';
    html += '<div class="stat-card"><div>🛒 إجمالي المشتريات</div><div class="value">' + totalPurchases.toLocaleString() + ' دج</div></div>';
    html += '<div class="stat-card"><div>📈 صافي الربح</div><div class="value">' + totalProfit.toLocaleString() + ' دج</div></div>';
    document.getElementById('reportsStats').innerHTML = html;
}

function updatePurchaseOrderSupplierSelect() {
    var select = document.getElementById('poSupplier');
    if (!select) return;
    var html = '<option value="">اختر المورد...</option>';
    for (var i = 0; i < suppliers.length; i++) {
        html += '<option value="' + suppliers[i].id + '">' + suppliers[i].name + ' - ' + suppliers[i].phone + '</option>';
    }
    select.innerHTML = html;
}

function addToPurchaseOrder() {
    var productId = parseInt(document.getElementById('poProduct').value);
    var qty = parseInt(document.getElementById('poQty').value);
    var price = parseFloat(document.getElementById('poPrice').value);
    if (isNaN(productId) || productId <= 0) { showMessage("اختر منتجاً أولاً", "error"); return; }
    if (isNaN(qty) || qty <= 0) { showMessage("أدخل كمية صحيحة", "error"); return; }
    if (isNaN(price) || price <= 0) { showMessage("أدخل سعر شراء صحيح", "error"); return; }
    var product = null;
    for (var i = 0; i < products.length; i++) { if (products[i].id === productId) { product = products[i]; break; } }
    if (!product) { showMessage("المنتج غير موجود", "error"); return; }
    var existingIndex = -1;
    for (var i = 0; i < purchaseOrderItems.length; i++) { if (purchaseOrderItems[i].productId === productId) { existingIndex = i; break; } }
    if (existingIndex >= 0) {
        purchaseOrderItems[existingIndex].quantity += qty;
        purchaseOrderItems[existingIndex].total = purchaseOrderItems[existingIndex].quantity * purchaseOrderItems[existingIndex].price;
        showMessage("تم تحديث كمية المنتج", "success");
    } else {
        purchaseOrderItems.push({ id: nextPOId++, productId: productId, productName: product.name, quantity: qty, price: price, total: qty * price });
        showMessage("تم إضافة المنتج للفاتورة", "success");
    }
    document.getElementById('poQty').value = '';
    document.getElementById('poPrice').value = '';
    document.getElementById('poProduct').value = '';
    updatePurchaseOrderTable();
}

function updatePurchaseOrderTable() {
    var tbody = document.getElementById('poItemsTable');
    if (!tbody) return;
    if (purchaseOrderItems.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد منتجات في الفاتورة<\/td><\/tr>'; document.getElementById('poTotal').innerHTML = '0'; return; }
    var html = '';
    var total = 0;
    for (var i = 0; i < purchaseOrderItems.length; i++) {
        var item = purchaseOrderItems[i];
        total += item.total;
        html += '<td>' + (i + 1) + '<td>' + item.productName + '<td>' + item.quantity + '<td>' + item.price + ' دج<\/td>' + '<td>' + item.total + ' دج<\/td>' + '<td><button class="btn-delete" onclick="removeFromPurchaseOrder(' + item.id + ')">🗑️<\/button><\/td>' + '</tr>';
    }
    tbody.innerHTML = html;
    document.getElementById('poTotal').innerHTML = total.toLocaleString();
}

function removeFromPurchaseOrder(id) {
    var newItems = [];
    for (var i = 0; i < purchaseOrderItems.length; i++) { if (purchaseOrderItems[i].id !== id) newItems.push(purchaseOrderItems[i]); }
    purchaseOrderItems = newItems;
    updatePurchaseOrderTable();
    showMessage("تم حذف المنتج من الفاتورة", "success");
}

function clearPurchaseOrder() {
    if (purchaseOrderItems.length === 0) { showMessage("الفاتورة فارغة", "error"); return; }
    if (confirm("هل أنت متأكد من تفريغ الفاتورة؟")) {
        purchaseOrderItems = [];
        updatePurchaseOrderTable();
        document.getElementById('poSupplier').value = '';
        document.getElementById('poSupplierName').value = '';
        document.getElementById('poNotes').value = '';
        showMessage("تم تفريغ الفاتورة", "success");
    }
}

function savePurchaseOrder() {
    if (purchaseOrderItems.length === 0) { showMessage("لا توجد منتجات في الفاتورة", "error"); return; }
    var supplierId = document.getElementById('poSupplier').value;
    var supplierName = document.getElementById('poSupplierName').value;
    var notes = document.getElementById('poNotes').value;
    var finalSupplierName = "";
    if (supplierName) { finalSupplierName = supplierName; }
    else if (supplierId) { for (var i = 0; i < suppliers.length; i++) { if (suppliers[i].id == supplierId) { finalSupplierName = suppliers[i].name; break; } } }
    var total = 0;
    for (var i = 0; i < purchaseOrderItems.length; i++) { total += purchaseOrderItems[i].total; }
    var now = new Date();
    var orderData = { id: Date.now(), date: now.toLocaleDateString('ar-EG') + ' ' + now.toLocaleTimeString('ar-EG'), supplier: finalSupplierName || "بدون مورد", items: purchaseOrderItems.slice(), total: total, notes: notes };
    var savedOrders = localStorage.getItem('purchase_orders');
    var orders = savedOrders ? JSON.parse(savedOrders) : [];
    orders.unshift(orderData);
    if (orders.length > 50) orders.pop();
    localStorage.setItem('purchase_orders', JSON.stringify(orders));
    showMessage("تم حفظ الفاتورة", "success");
    purchaseOrderItems = [];
    updatePurchaseOrderTable();
    document.getElementById('poSupplier').value = '';
    document.getElementById('poSupplierName').value = '';
    document.getElementById('poNotes').value = '';
}

function printPurchaseOrder() {
    if (purchaseOrderItems.length === 0) { showMessage("لا توجد منتجات للطباعة", "error"); return; }
    var supplierId = document.getElementById('poSupplier').value;
    var supplierName = document.getElementById('poSupplierName').value;
    var notes = document.getElementById('poNotes').value;
    var finalSupplierName = "";
    if (supplierName) { finalSupplierName = supplierName; }
    else if (supplierId) { for (var i = 0; i < suppliers.length; i++) { if (suppliers[i].id == supplierId) { finalSupplierName = suppliers[i].name; break; } } }
    var total = 0;
    for (var i = 0; i < purchaseOrderItems.length; i++) { total += purchaseOrderItems[i].total; }
    var now = new Date();
    var dateStr = now.toLocaleDateString('ar-EG');
    var timeStr = now.toLocaleTimeString('ar-EG');
    var printContent = '<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>فاتورة شراء</title><style>';
    printContent += 'body{font-family:Arial;padding:30px;direction:rtl}';
    printContent += '.invoice-container{max-width:800px;margin:0 auto;border:1px solid #ddd;padding:20px;border-radius:10px}';
    printContent += '.header{text-align:center;margin-bottom:30px;border-bottom:2px solid #22d3ee;padding-bottom:15px}';
    printContent += '.header h1{color:#22d3ee}';
    printContent += '.info-row{display:flex;justify-content:space-between;margin-bottom:20px;padding:10px;background:#f5f5f5;border-radius:8px}';
    printContent += 'table{width:100%;border-collapse:collapse;margin:20px 0}';
    printContent += 'th,td{border:1px solid #ddd;padding:10px;text-align:center}';
    printContent += 'th{background:#22d3ee;color:white}';
    printContent += '.total-row{font-size:18px;font-weight:bold;text-align:left;margin-top:20px;padding-top:10px;border-top:2px solid #ddd}';
    printContent += '.footer{margin-top:30px;text-align:center;font-size:12px;color:#666;border-top:1px solid #ddd;padding-top:15px}';
    printContent += '.notes{background:#f9f9f9;padding:10px;border-radius:8px;margin-top:20px}';
    printContent += '@media print{.no-print{display:none}}';
    printContent += '</style></head><body>';
    printContent += '<div class="invoice-container"><div class="header"><h1>📋 فاتورة شراء مقترحة</h1><p>مخزنة - نظام إدارة المخازن</p></div>';
    printContent += '<div class="info-row"><div><strong>📅 التاريخ:</strong> ' + dateStr + '</div><div><strong>⏰ الوقت:</strong> ' + timeStr + '</div><div><strong>🏭 المورد:</strong> ' + (finalSupplierName || "غير محدد") + '</div></div>';
    printContent += '<table><thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر الشراء</th><th>الإجمالي</th></tr></thead><tbody>';
    for (var i = 0; i < purchaseOrderItems.length; i++) {
        var item = purchaseOrderItems[i];
        printContent += '<tr><td>' + (i + 1) + '<\/td><td>' + item.productName + '<\/td><td>' + item.quantity + '<\/td><td>' + item.price.toLocaleString() + ' دج<\/td><td>' + item.total.toLocaleString() + ' دج<\/td><\/tr>';
    }
    printContent += '</tbody></table>';
    printContent += '<div class="total-row"><strong>المجموع الكلي: ' + total.toLocaleString() + ' دج</strong></div>';
    if (notes) printContent += '<div class="notes"><strong>📝 ملاحظات:</strong><br>' + notes + '</div>';
    printContent += '<div class="footer"><p>هذه فاتورة تقديرية غير ملزمة</p><p>شكراً لثقتكم بنا</p></div></div>';
    printContent += '<div class="no-print" style="text-align:center;margin-top:20px;"><button onclick="window.print()" style="padding:10px 20px;background:#22d3ee;border:none;border-radius:8px;">🖨️ طباعة</button> <button onclick="window.close()" style="padding:10px 20px;background:#f43f5e;border:none;border-radius:8px;color:white;">❌ إغلاق</button></div>';
    printContent += '</body></html>';
    var printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    printWindow.document.write(printContent);
    printWindow.document.close();
}

// ========== آلة حاسبة ==========
var calcScreen = document.getElementById('calcScreen');
function calcAppend(val) { if (calcScreen.innerText === '0') calcScreen.innerText = val; else calcScreen.innerText += val; }
function calcClear() { calcScreen.innerText = '0'; }
function calcCalculate() { try { calcScreen.innerText = eval(calcScreen.innerText); } catch(e) { calcScreen.innerText = 'خطأ'; } }
function calcPercentage() { try { calcScreen.innerText = eval(calcScreen.innerText) / 100; } catch(e) { calcScreen.innerText = 'خطأ'; } }

// ========== الإعدادات ==========
function changePassword() { var newPass = document.getElementById('newPassword').value; if (newPass) { localStorage.setItem('store_password', newPass); showMessage("تم تغيير كلمة المرور", "success"); document.getElementById('newPassword').value = ''; } else { showMessage("أدخل كلمة مرور جديدة", "error"); } }
function clearAllData() { if (confirm("هل أنت متأكد من مسح جميع البيانات؟")) { localStorage.clear(); showMessage("تم مسح جميع البيانات", "success"); setTimeout(function() { location.reload(); }, 2000); } }
function syncWithDatabase() { showMessage("جاري المزامنة...", "success"); loadProductsFromDB(); }
function shareApp() { alert("يمكنك مشاركة هذا التطبيق مع أصدقائك"); }

// ========== رسائل ==========
function showMessage(msg, type) {
    var toast = document.createElement('div');
    toast.className = 'message ' + type;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(function() { if (toast) toast.remove(); }, 3000);
}

// ========== خلفية متحركة ==========
var canvas = document.getElementById('bgCanvas');
if (canvas) {
    var ctx = canvas.getContext('2d');
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resizeCanvas(); window.addEventListener('resize', resizeCanvas);
    var particles = [];
    for (var i = 0; i < 80; i++) { particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 2 + 1, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, a: Math.random() * 0.5 + 0.2 }); }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 211, 238, ' + p.a + ')';
            ctx.fill();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

console.log("✅ script.js تم التحميل بنجاح");