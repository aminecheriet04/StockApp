



<%@ page import="java.sql.*" %>
<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    request.setCharacterEncoding("UTF-8");
    response.setCharacterEncoding("UTF-8");
%>
<!DOCTYPE html>
<html dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>اختبار قاعدة البيانات</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #1e1e2f; color: white; }
        .success { color: #10b981; }
        .error { color: #f43f5e; }
        .info { color: #22d3ee; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #444; padding: 10px; text-align: right; }
        th { background: #22d3ee; color: #020617; }
        .box { background: #2d2d44; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div style="max-width: 1000px; margin: 0 auto;">
        <h1>🧪 اختبار اتصال قاعدة البيانات</h1>
        
        <div class="box">
            <h2>📊 معلومات الاتصال</h2>
            <ul>
                <li>🔗 URL: <span class="info">jdbc:mysql://localhost:3306/store_db</span></li>
                <li>👤 User: <span class="info">root</span></li>
                <li>🔑 Password: <span class="info">(فارغ)</span></li>
            </ul>
        </div>
        
        <div class="box">
            <h2>🔌 حالة الاتصال</h2>
            <%
                Connection conn = null;
                Statement stmt = null;
                ResultSet rs = null;
                boolean connected = false;
                
                try {
                    out.println("<p>📦 1. تحميل Driver MySQL... ");
                    Class.forName("com.mysql.jdbc.Driver");
                    out.println("<span class='success'>✅ تم بنجاح</span></p>");
                    
                    out.println("<p>🔗 2. الاتصال بقاعدة البيانات... ");
                    conn = DriverManager.getConnection(
                        "jdbc:mysql://localhost:3306/store_db?useUnicode=true&characterEncoding=UTF-8",
                        "root",
                        ""
                    );
                    out.println("<span class='success'>✅ تم بنجاح</span></p>");
                    connected = true;
                    
                    out.println("<p>📊 3. جلب البيانات... ");
                    stmt = conn.createStatement();
                    rs = stmt.executeQuery("SELECT COUNT(*) as count FROM products");
                    if (rs.next()) {
                        int count = rs.getInt("count");
                        out.println("<span class='success'>✅ تم - عدد المنتجات: " + count + "</span></p>");
                    }
                    
                } catch (ClassNotFoundException e) {
                    out.println("<span class='error'>❌ فشل - Driver MySQL غير موجود</span></p>");
                    out.println("<p class='error'>تأكد من وجود mysql-connector.jar في مجلد WEB-INF/lib/</p>");
                } catch (SQLException e) {
                    out.println("<span class='error'>❌ فشل - " + e.getMessage() + "</span></p>");
                    out.println("<p class='error'>تأكد من:</p>");
                    out.println("<ul class='error'>");
                    out.println("<li>MySQL يعمل (XAMPP/WAMP)</li>");
                    out.println("<li>قاعدة البيانات store_db موجودة</li>");
                    out.println("<li>اسم المستخدم وكلمة المرور صحيحين</li>");
                    out.println("</ul>");
                } catch (Exception e) {
                    out.println("<span class='error'>❌ فشل - " + e.getMessage() + "</span></p>");
                } finally {
                    try { if (rs != null) rs.close(); } catch(Exception e) {}
                    try { if (stmt != null) stmt.close(); } catch(Exception e) {}
                    try { if (conn != null) conn.close(); } catch(Exception e) {}
                }
            %>
        </div>
        
        <% if (connected) { %>
        <div class="box">
            <h2>📦 قائمة المنتجات في قاعدة البيانات</h2>
            <%
                try {
                    conn = DriverManager.getConnection(
                        "jdbc:mysql://localhost:3306/store_db?useUnicode=true&characterEncoding=UTF-8",
                        "root",
                        ""
                    );
                    stmt = conn.createStatement();
                    rs = stmt.executeQuery("SELECT * FROM products");
                    
                    out.println("<table>");
                    out.println("<tr><th>ID</th><th>الاسم</th><th>الكمية</th><th>سعر البيع</th><th>سعر الشراء</th><th>الحد الأدنى</th></tr>");
                    while (rs.next()) {
                        out.println("<tr>");
                        out.println("<td>" + rs.getInt("id") + "</td>");
                        out.println("<td>" + rs.getString("name") + "</td>");
                        out.println("<td>" + rs.getInt("quantity") + "</td>");
                        out.println("<td>" + rs.getDouble("sell_price") + " دج</td>");
                        out.println("<td>" + rs.getDouble("buy_price") + " دج</td>");
                        out.println("<td>" + rs.getInt("min_quantity") + "</td>");
                        out.println("</tr>");
                    }
                    out.println("</table>");
                    
                    rs.close();
                    stmt.close();
                    conn.close();
                } catch(Exception e) {
                    out.println("<p class='error'>خطأ في عرض البيانات: " + e.getMessage() + "</p>");
                }
            %>
        </div>
        <% } %>
        
        <div class="box">
            <h2>🔧 الحلول المقترحة في حالة وجود أخطاء</h2>
            <ul>
                <li><strong>❌ Driver not found</strong> → ضع mysql-connector.jar في WebContent/WEB-INF/lib/</li>
                <li><strong>❌ Unknown database 'store_db'</strong> → أنشئ قاعدة البيانات باستخدام SQL</li>
                <li><strong>❌ Access denied</strong> → تحقق من اسم المستخدم وكلمة المرور (root / empty)</li>
                <li><strong>❌ Connection refused</strong> → شغل MySQL من XAMPP/WAMP</li>
            </ul>
        </div>
        
        <div class="box">
            <h2>📝 SQL لإنشاء قاعدة البيانات (إذا لم تكن موجودة)</h2>
            <pre style="background: #1e1e2f; padding: 15px; border-radius: 10px; overflow-x: auto; direction: ltr; text-align: left;">
CREATE DATABASE IF NOT EXISTS store_db;
USE store_db;

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    quantity INT DEFAULT 0,
    sell_price DECIMAL(10,2) DEFAULT 0,
    buy_price DECIMAL(10,2) DEFAULT 0,
    min_quantity INT DEFAULT 10
);

INSERT INTO products (name, quantity, sell_price, buy_price, min_quantity) VALUES
('هاتف ذكي', 25, 1500, 1200, 10),
('حاسوب محمول', 8, 3500, 2800, 5),
('سماعات لاسلكية', 45, 250, 180, 15),
('شاحن سريع', 12, 80, 50, 10),
('بطارية خارجية', 3, 120, 90, 5);
            </pre>
        </div>
    </div>
</body>
</html>