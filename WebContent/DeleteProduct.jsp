<%@ page import="java.sql.*" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    int id = Integer.parseInt(request.getParameter("id"));
    
    Connection conn = null;
    PreparedStatement ps = null;
    
    try {
        Class.forName("com.mysql.jdbc.Driver");
        conn = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/store_db?useUnicode=true&characterEncoding=UTF-8",
            "root",
            ""
        );
        
        String sql = "DELETE FROM products WHERE id = ?";
        ps = conn.prepareStatement(sql);
        ps.setInt(1, id);
        
        int result = ps.executeUpdate();
        if (result > 0) {
            out.print("{\"success\":true, \"message\":\"تم حذف المنتج\"}");
        } else {
            out.print("{\"success\":false, \"message\":\"المنتج غير موجود\"}");
        }
        
    } catch (Exception e) {
        out.print("{\"success\":false, \"message\":\"" + e.getMessage() + "\"}");
    } finally {
        if (ps != null) try { ps.close(); } catch(Exception e) {}
        if (conn != null) try { conn.close(); } catch(Exception e) {}
    }
%>