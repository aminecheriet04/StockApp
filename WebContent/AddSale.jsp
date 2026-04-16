<%@ page import="java.sql.*" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    int productId = Integer.parseInt(request.getParameter("productId"));
    int quantity = Integer.parseInt(request.getParameter("quantity"));
    int customerId = Integer.parseInt(request.getParameter("customerId"));
    
    Connection conn = null;
    PreparedStatement ps = null;
    ResultSet rs = null;
    
    try {
        Class.forName("com.mysql.jdbc.Driver");
        conn = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/store_db?useUnicode=true&characterEncoding=UTF-8",
            "root",
            ""
        );
        
        // الحصول على المنتج
        ps = conn.prepareStatement("SELECT name, sell_price, buy_price, quantity FROM products WHERE id = ?");
        ps.setInt(1, productId);
        rs = ps.executeQuery();
        
        if (rs.next()) {
            String productName = rs.getString("name");
            double sellPrice = rs.getDouble("sell_price");
            double buyPrice = rs.getDouble("buy_price");
            int currentQty = rs.getInt("quantity");
            
            if (currentQty >= quantity) {
                // تحديث الكمية
                int newQty = currentQty - quantity;
                ps = conn.prepareStatement("UPDATE products SET quantity = ? WHERE id = ?");
                ps.setInt(1, newQty);
                ps.setInt(2, productId);
                ps.executeUpdate();
                
                double total = sellPrice * quantity;
                double profit = (sellPrice - buyPrice) * quantity;
                
                out.print("{\"success\":true, \"message\":\"تم البيع\", \"total\":" + total + ", \"profit\":" + profit + "}");
            } else {
                out.print("{\"success\":false, \"message\":\"الكمية غير متوفرة. المتوفر: " + currentQty + "\"}");
            }
        } else {
            out.print("{\"success\":false, \"message\":\"المنتج غير موجود\"}");
        }
        
    } catch (Exception e) {
        out.print("{\"success\":false, \"message\":\"" + e.getMessage() + "\"}");
    } finally {
        if (rs != null) try { rs.close(); } catch(Exception e) {}
        if (ps != null) try { ps.close(); } catch(Exception e) {}
        if (conn != null) try { conn.close(); } catch(Exception e) {}
    }
%>