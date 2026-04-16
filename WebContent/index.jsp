<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>مخزنة - إدارة المخزن</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<canvas id="bgCanvas"></canvas>

<!-- تسجيل الدخول -->
<div id="loginContainer" class="login-container">
    <div class="login-box">
        <div class="login-icon">📦</div>
        <h1>مخزنة</h1>
        <p class="login-subtitle">إدارة المخزن</p>
        <input type="text" id="username" class="login-input" placeholder="اسم المستخدم" value="admin">
        <input type="password" id="password" class="login-input" placeholder="كلمة المرور" value="1234">
        <button class="login-btn" onclick="doLogin()">دخول</button>
        <div id="errorMsg" class="error-msg">بيانات الدخول غير صحيحة</div>
    </div>
</div>

<!-- النظام الرئيسي -->
<div id="mainSystem" class="main-system">
    <div class="app-container">
        <!-- القائمة الجانبية -->
        <div class="sidebar">
            <div class="logo">
                <h2>📦 مخزنة</h2>
                <p>إدارة المخزن</p>
            </div>
            
            <div class="nav-item active" onclick="showPage('dashboard')">
                <span class="nav-icon">📊</span> <span>لوحة التحكم</span>
            </div>
            <div class="nav-item" onclick="showPage('products')">
                <span class="nav-icon">📦</span> <span>المنتجات</span>
            </div>
            <div class="nav-item" onclick="showPage('purchases')">
                <span class="nav-icon">🛒</span> <span>المشتريات</span>
            </div>
            <div class="nav-item" onclick="showPage('sales')">
                <span class="nav-icon">💰</span> <span>المبيعات</span>
            </div>
            <div class="nav-item" onclick="showPage('expenses')">
                <span class="nav-icon">📝</span> <span>المصروفات</span>
            </div>
            <div class="nav-item" onclick="showPage('cash')">
                <span class="nav-icon">🏦</span> <span>الصندوق</span>
            </div>
            
            <hr>
            
            <div class="nav-item" onclick="showPage('suppliers')">
                <span class="nav-icon">🏭</span> <span>الموردين</span>
            </div>
            <div class="nav-item" onclick="showPage('customers')">
                <span class="nav-icon">👥</span> <span>العملاء</span>
            </div>
            
            <hr>
            
            <div class="nav-item" onclick="showPage('reports')">
                <span class="nav-icon">📈</span> <span>تقرير المخزن</span>
            </div>
            <div class="nav-item" onclick="showPage('purchaseOrder')">
                <span class="nav-icon">📋</span> <span>تقدير فاتورة شراء</span>
            </div>
            <div class="nav-item" onclick="showPage('calculator')">
                <span class="nav-icon">🧮</span> <span>الآلة الحاسبة</span>
            </div>
            <div class="nav-item" onclick="showPage('settings')">
                <span class="nav-icon">⚙️</span> <span>الإعدادات</span>
            </div>
            
            <div class="share-section">
                <p>مشاركة التطبيق صدقة<br>لعل الله ينفعنا وإياكم بها</p>
                <button class="share-btn" onclick="shareApp()">اضغط هنا</button>
            </div>
        </div>
        
        <!-- المحتوى الرئيسي -->
        <div class="content">
            
            <!-- ========== لوحة التحكم ========== -->
            <div id="pageDashboard" class="page active">
                <div class="alerts-header">
                    <h2>📊 لوحة التحكم</h2>
                </div>
                
                <!-- أزرار الاختبار -->
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button onclick="testDirectFetch()" style="background: #f59e0b; color: white;">📡 اختبار الاتصال</button>
                    <button onclick="forceRefresh()" style="background: #22d3ee; color: #020617;">🔄 إعادة تحميل</button>
                </div>
                
                <div id="smartAlerts" class="smart-alerts-container"></div>
                <div class="stats-grid" id="dashboardStats"></div>
                
                <!-- معلومات التصحيح -->
                <div class="glass" style="margin-top: 20px; padding: 15px;">
                    <h3>🔍 معلومات التصحيح</h3>
                    <div id="debugInfo" style="font-size: 12px; color: #94a3b8; direction: ltr; text-align: left;"></div>
                </div>
            </div>
            
            <!-- ========== المنتجات ========== -->
            <div id="pageProducts" class="page">
                <h2>📦 المنتجات</h2>
                <div class="form-card">
                    <div class="form-row">
                        <input type="text" id="prodName" placeholder="اسم المنتج">
                        <input type="number" id="prodQty" placeholder="الكمية">
                        <input type="number" id="prodPrice" placeholder="سعر البيع">
                        <input type="number" id="prodBuyPrice" placeholder="سعر الشراء">
                        <input type="number" id="prodMin" placeholder="الحد الأدنى" value="10">
                        <button class="btn-add" onclick="addProduct()">➕ إضافة</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="productsTable">
                        <thead>
                            <tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر البيع</th><th>سعر الشراء</th><th>الحالة</th><th></th></tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="7" style="text-align:center;">جاري التحميل...<\/td><\/tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- ========== المشتريات ========== -->
            <div id="pagePurchases" class="page">
                <h2>🛒 المشتريات</h2>
                <div class="form-card">
                    <div class="form-row">
                        <select id="purchaseProduct"></select>
                        <input type="number" id="purchaseQty" placeholder="الكمية">
                        <input type="number" id="purchasePrice" placeholder="سعر الشراء">
                        <button class="btn-add" onclick="addPurchase()">➕ تسجيل شراء</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="purchasesTable">
                        <thead><tr><th>التاريخ</th><th>المنتج</th><th>الكمية</th><th>سعر الشراء</th><th>الإجمالي</th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
            
            <!-- ========== المبيعات ========== -->
            <div id="pageSales" class="page">
                <h2>💰 المبيعات</h2>
                <div class="form-card">
                    <div class="form-row">
                        <select id="saleProduct"></select>
                        <input type="number" id="saleQty" placeholder="الكمية">
                        <select id="saleCustomer"><option value="">بدون عميل</option></select>
                        <button class="btn-sell" onclick="addSale()">💵 بيع</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="salesTable">
                        <thead><tr><th>التاريخ</th><th>المنتج</th><th>العميل</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th><th>الربح</th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
            
            <!-- ========== المصروفات ========== -->
            <div id="pageExpenses" class="page">
                <h2>📝 المصروفات</h2>
                <div class="form-card">
                    <div class="form-row">
                        <input type="text" id="expenseName" placeholder="اسم المصروف">
                        <input type="number" id="expenseAmount" placeholder="المبلغ">
                        <input type="text" id="expenseNote" placeholder="ملاحظة">
                        <button class="btn-add" onclick="addExpense()">➕ إضافة مصروف</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="expensesTable">
                        <thead><tr><th>التاريخ</th><th>البيان</th><th>المبلغ</th><th>ملاحظة</th><th></th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
            
            <!-- ========== الصندوق ========== -->
            <div id="pageCash" class="page">
                <h2>🏦 الصندوق</h2>
                <div class="stats-grid" id="cashStats"></div>
                <div class="form-card">
                    <div class="form-row">
                        <input type="number" id="cashAmount" placeholder="المبلغ">
                        <select id="cashType"><option value="in">إيداع</option><option value="out">سحب</option></select>
                        <button class="btn-add" onclick="updateCash()">تحديث الرصيد</button>
                    </div>
                </div>
            </div>
            
            <!-- ========== الموردين ========== -->
            <div id="pageSuppliers" class="page">
                <h2>🏭 الموردين</h2>
                <div class="form-card">
                    <div class="form-row">
                        <input type="text" id="supplierName" placeholder="اسم المورد">
                        <input type="text" id="supplierPhone" placeholder="الهاتف">
                        <input type="text" id="supplierAddress" placeholder="العنوان">
                        <button class="btn-add" onclick="addSupplier()">➕ إضافة مورد</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="suppliersTable">
                        <thead><tr><th>#</th><th>الاسم</th><th>الهاتف</th><th>العنوان</th><th></th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
            
            <!-- ========== العملاء ========== -->
            <div id="pageCustomers" class="page">
                <h2>👥 العملاء</h2>
                <div class="form-card">
                    <div class="form-row">
                        <input type="text" id="customerName" placeholder="اسم العميل">
                        <input type="text" id="customerPhone" placeholder="الهاتف">
                        <input type="text" id="customerAddress" placeholder="العنوان">
                        <button class="btn-add" onclick="addCustomer()">➕ إضافة عميل</button>
                    </div>
                </div>
                <div class="table-container">
                    <table id="customersTable">
                        <thead><tr><th>#</th><th>الاسم</th><th>الهاتف</th><th>العنوان</th><th>نقاط</th><th></th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
            
            <!-- ========== التقارير ========== -->
            <div id="pageReports" class="page">
                <h2>📈 تقارير المخزن</h2>
                <div class="stats-grid" id="reportsStats"></div>
            </div>
            
            <!-- ========== تقدير فاتورة الشراء ========== -->
            <div id="pagePurchaseOrder" class="page">
                <h2>📋 تقدير فاتورة الشراء</h2>
                <div class="form-card">
                    <h3>➕ إضافة منتج للفاتورة</h3>
                    <div class="form-row">
                        <select id="poProduct" style="flex:2;"></select>
                        <input type="number" id="poQty" placeholder="الكمية" style="flex:1;">
                        <input type="number" id="poPrice" placeholder="سعر الشراء" style="flex:1;">
                        <button class="btn-add" onclick="addToPurchaseOrder()">➕ إضافة</button>
                    </div>
                </div>
                <div class="table-container">
                    <h3>🛒 منتجات الفاتورة</h3>
                    <table id="poItemsTable">
                        <thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر الشراء</th><th>الإجمالي</th><th></th></tr></thead>
                        <tbody></tbody>
                        <tfoot>
                            <tr style="background:rgba(34,211,238,0.1);">
                                <td colspan="4"><strong>المجموع</strong></td>
                                <td><strong id="poTotal">0</strong> دج<\/td>
                                <td><\/td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="form-card">
                    <h3>🏭 معلومات المورد</h3>
                    <div class="form-row">
                        <select id="poSupplier" style="flex:2;"></select>
                        <input type="text" id="poSupplierName" placeholder="اسم المورد (يدوي)" style="flex:2;">
                    </div>
                    <div class="form-row">
                        <input type="text" id="poNotes" placeholder="ملاحظات" style="flex:3;">
                    </div>
                </div>
                <div class="form-card">
                    <div class="form-row">
                        <button class="btn-sell" onclick="printPurchaseOrder()">🖨️ طباعة</button>
                        <button class="btn-add" onclick="savePurchaseOrder()">💾 حفظ</button>
                        <button class="btn-delete" onclick="clearPurchaseOrder()">🗑️ تفريغ</button>
                    </div>
                </div>
            </div>
            
            <!-- ========== الآلة الحاسبة ========== -->
            <div id="pageCalculator" class="page">
                <h2>🧮 الآلة الحاسبة</h2>
                <div class="calculator">
                    <div class="calculator-screen" id="calcScreen">0</div>
                    <div class="calculator-buttons">
                        <button onclick="calcAppend('7')">7</button>
                        <button onclick="calcAppend('8')">8</button>
                        <button onclick="calcAppend('9')">9</button>
                        <button class="calc-operator" onclick="calcAppend('/')">/</button>
                        
                        <button onclick="calcAppend('4')">4</button>
                        <button onclick="calcAppend('5')">5</button>
                        <button onclick="calcAppend('6')">6</button>
                        <button class="calc-operator" onclick="calcAppend('*')">*</button>
                        
                        <button onclick="calcAppend('1')">1</button>
                        <button onclick="calcAppend('2')">2</button>
                        <button onclick="calcAppend('3')">3</button>
                        <button class="calc-operator" onclick="calcAppend('-')">-</button>
                        
                        <button class="calc-clear" onclick="calcClear()">C</button>
                        <button onclick="calcAppend('0')">0</button>
                        <button onclick="calcAppend('.')">.</button>
                        <button class="calc-operator" onclick="calcAppend('+')">+</button>
                        
                        <button class="calc-equals" onclick="calcCalculate()">=</button>
                        <button class="calc-operator" onclick="calcPercentage()">%</button>
                    </div>
                </div>
            </div>
            
            <!-- ========== الإعدادات ========== -->
            <div id="pageSettings" class="page">
                <h2>⚙️ الإعدادات</h2>
                <div class="form-card">
                    <h3>تغيير كلمة المرور</h3>
                    <div class="form-row">
                        <input type="password" id="newPassword" placeholder="كلمة المرور الجديدة">
                        <button onclick="changePassword()">تغيير</button>
                    </div>
                </div>
                <div class="form-card">
                    <h3>مسح جميع البيانات</h3>
                    <button class="btn-delete" onclick="clearAllData()">⚠️ مسح الكل</button>
                </div>
                <div class="form-card">
                    <h3>مزامنة مع قاعدة البيانات</h3>
                    <button class="btn-add" onclick="syncWithDatabase()">🔄 مزامنة</button>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="js/script.js"></script>
</body>
</html>