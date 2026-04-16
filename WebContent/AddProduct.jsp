<%@ page import="java.sql.*" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    request.setCharacterEncoding("UTF-8");
    
    String name = request.getParameter("name");
    int quantity = Integer.parseInt(request.getParameter("quantity"));
    double sellPrice = Double.parseDouble(request.getParameter("sellPrice"));
    double buyPrice = Double.parseDouble(request.getParameter("buyPrice"));
    int minQuantity = Integer.parseInt(request.getParameter("minQuantity"));
    
    Connection conn = null;
    PreparedStatement ps = null;
    
    try {
        Class.forName("com.mysql.jdbc.Driver");
        conn = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/store_db?useUnicode=true&characterEncoding=UTF-8",
            "root",
            ""
        );
        
        String sql = "INSERT INTO products (name, quantity, sell_price, buy_price, min_quantity) VALUES (?, ?, ?, ?, ?)";
        ps = conn.prepareStatement(sql);
        ps.setString(1, name);
        ps.setInt(2, quantity);
        ps.setDouble(3, sellPrice);
        ps.setDouble(4, buyPrice);
        ps.setInt(5, minQuantity);
        
        int result = ps.executeUpdate();
        if (result > 0) {
            out.print("{\"success\":true, \"message\":\"تم إضافة المنتج\"}");
        } else {
            out.print("{\"success\":false, \"message\":\"فشل الإضافة\"}");
        }
        
    } catch (Exception e) {
        out.print("{\"success\":false, \"message\":\"" + e.getMessage() + "\"}");
    } finally {
        if (ps != null) try { ps.close(); } catch(Exception e) {}
        if (conn != null) try { conn.close(); } catch(Exception e) {}
    }
%>