<%@ page import="java.sql.*, com.google.gson.*" %>
<%@ page contentType="application/json; charset=UTF-8" %>
<%
    Connection conn = null;
    Statement stmt = null;
    ResultSet rs = null;
    JsonArray jsonArray = new JsonArray();
    
    try {
        Class.forName("com.mysql.jdbc.Driver");
        conn = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/store_db?useUnicode=true&characterEncoding=UTF-8",
            "root",
            ""
        );
        stmt = conn.createStatement();
        rs = stmt.executeQuery("SELECT * FROM products ORDER BY id DESC");
        
        while (rs.next()) {
            JsonObject obj = new JsonObject();
            obj.addProperty("id", rs.getInt("id"));
            obj.addProperty("name", rs.getString("name"));
            obj.addProperty("quantity", rs.getInt("quantity"));
            obj.addProperty("sellPrice", rs.getDouble("sell_price"));
            obj.addProperty("buyPrice", rs.getDouble("buy_price"));
            obj.addProperty("minQuantity", rs.getInt("min_quantity"));
            jsonArray.add(obj);
        }
        out.print(jsonArray.toString());
    } catch(Exception e) {
        out.print("[]");
        e.printStackTrace();
    } finally {
        if(rs != null) try { rs.close(); } catch(Exception e) {}
        if(stmt != null) try { stmt.close(); } catch(Exception e) {}
        if(conn != null) try { conn.close(); } catch(Exception e) {}
    }
%>