var db = require('./db_connection');
function createOwner(request, response, body_in) {
    let dbcon = db.getDBconnection();
    //so we use JSON.parse to convert it into a JavaScript object and catch the requests
    let owner = JSON.parse(body_in);
    
    // Build the SQL query to insert a new Owner, "?" represents user's input, if they leave a blank, a question mark will fill that blank
    let sql = `INSERT INTO Owner (last_name, first_name, email, address, city, state, zipcode, phone, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
    // Execute the query with the provided Owner data
    dbcon.query(sql, [owner.last_name, owner.first_name, owner.email, owner.address, owner.city, owner.state, owner.zipcode, owner.phone, owner.username, owner.password], (error, result) => {
        
      if (error) {
        console.log("Error creating new Owner: " + error);
        response.writeHead(500, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({error: "Failed to create new Owner"}));
      } 
      else {
        console.log("New Owner created with ID: " + result.insertId);
        //the server has successfully processed the request and is returning the requested resource in the response body.
        response.writeHead(207, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({message: "New Owner created"}));
      }
    });
  }

  module.exports.createOwner = createOwner;