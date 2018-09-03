import java.sql.*;

public class Business {
   static final String JDBC_DRIVER = "com.mysql.jdbc.Driver";  
   static final String DB_URL = "jdbc:mysql://localhost/";
   
   static final String USER = "username";
   static final String PASS = "password";
   
//   public static void createBusinessDatabase(String[] args) {
//   Connection conn = null;
//   Statement stmt = null;
//   try{
//      //STEP 2: Register JDBC driver
//      Class.forName("com.mysql.jdbc.Driver");
//
//      //STEP 3: Open a connection
//      System.out.println("Connecting to database...");
//      conn = DriverManager.getConnection(DB_URL);
//
//      //STEP 4: Execute a query
//      System.out.println("Creating database...");
//      stmt = conn.createStatement();
//      
//      String sql = "CREATE DATABASE STUDENTS";
//      stmt.executeUpdate(sql);
//      System.out.println("Database created successfully...");
//   }catch(SQLException se){
//      //Handle errors for JDBC
//      se.printStackTrace();
//   }catch(Exception e){
//      //Handle errors for Class.forName
//      e.printStackTrace();
//   }finally{
//      //finally block used to close resources
//      try{
//         if(stmt!=null)
//            stmt.close();
//      }catch(SQLException se2){
//      }// nothing we can do
//      try{
//         if(conn!=null)
//            conn.close();
//      }catch(SQLException se){
//         se.printStackTrace();
//      }//end finally try
//   }//end try
//   System.out.println("Goodbye!");
//}//end main
   
   public static void createBusinessTable(String dbName) {
	   Connection conn = null;
	   Statement stmt = null;
	   String DB_URL1 = DB_URL + dbName;
	   try{
	      Class.forName("com.mysql.jdbc.Driver");

	      System.out.println("Connecting to a selected database...");
	      conn = DriverManager.getConnection(DB_URL1, USER, PASS);
	      System.out.println("Connected database successfully...");

	      System.out.println("Creating table in given database...");
	      stmt = conn.createStatement();
	      
	      String sql = "CREATE TABLE BUSINESS " +
	                   "(user_id VARCHAR(255)" +
	                   " bus_name VARCHAR(255), " +
	                   " op_time VARCHAR(255), " + 
	                   " pho_num VARCHAR(255), " + 
	                   " email VARCHAR(255), " +
	                   " bus_des VARCHAR(255), " +
	                   " PRIMARY KEY ( user_id ))"; 

	      stmt.executeUpdate(sql);
	      System.out.println("Created table in given database...");
	   }catch(SQLException se){
	      se.printStackTrace();
	   }catch(Exception e){
	      e.printStackTrace();
	   }finally{
	      try{
	         if(stmt!=null)
	            conn.close();
	      }catch(SQLException se){
	      }
	      try{
	         if(conn!=null)
	            conn.close();
	      }catch(SQLException se){
	         se.printStackTrace();
	      }
	   }
	   System.out.println("Goodbye!");
	}
   
   public static void LinkBusiness(String user, String dbName) {
	   Connection conn = null;
	   Statement stmt = null;
	   try{
	      Class.forName("com.mysql.jdbc.Driver");
	      
	      System.out.println("Connecting to a selected database...");
	      conn = DriverManager.getConnection(DB_URL, USER, PASS);
	      System.out.println("Connected database successfully...");
	      
	      System.out.println("Inserting records into the table...");
	      stmt = conn.createStatement();
	      
	      String sql = "INSERT INTO Business " +
	                   "VALUES ()";
	      stmt.executeUpdate(sql);
	      System.out.println("Inserted records into the table...");

	   }catch(SQLException se){
	      se.printStackTrace();
	   }catch(Exception e){
	      e.printStackTrace();
	   }finally{
	      try{
	         if(stmt!=null)
	            conn.close();
	      }catch(SQLException se){
	      }
	      try{
	         if(conn!=null)
	            conn.close();
	      }catch(SQLException se){
	         se.printStackTrace();
	      }
	   }
	   System.out.println("Goodbye!");
	}
   
   
   
}