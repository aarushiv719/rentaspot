var db = require('./db_connection');
function createRenter(request, response, body_in) {
    let dbcon = db.getDBconnection();
    //so we use JSON.parse to convert it into a JavaScript object and catch the requests
    let renter = JSON.parse(body_in);
    // Build the SQL query to insert a new Renter, "?" represents user's input, if they leave a blank, a question mark will fill that blank
    let sql = `INSERT INTO Renter (last_name, first_name, email, address, city, state, zipcode, phone, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
    // Execute the query with the provided Renter data
    dbcon.query(sql, [renter.last_name, renter.first_name, renter.email, renter.address, renter.city, renter.state, renter.zipcode, renter.phone, renter.username, renter.password, renter.insertId], (error, result) => {
        
      if (error) {
        console.log("Error creating new Renter: " + error);
        response.writeHead(500, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({error: "Failed to create new Renter"}));
      } 
      else {
        console.log("New Renter created with ID: " + result.insertId);
        //the server has successfully processed the request and is returning the requested resource in the response body.
        response.writeHead(207, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({message: "New Renter created"}));
      }
    });
  }

  module.exports.createRenter = createRenter;