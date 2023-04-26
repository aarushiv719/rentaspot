// Import required modules
var db = require('./db_connection'); 
var id = require("./listRenter.js")
//takes in JSON of a renter object, reads user id, and updates that user id's data in database
function modifyRenter (request, response, body) {
    let dbcon = db.getDBconnection();
    let renter = JSON.parse(body);
    let sql = `UPDATE Renter 
                SET last_name = ?, first_name = ?, email = ?, address = ?, city = ?, state = ?, zipcode = ?, phone = ?, username = ?, password = ?
                WHERE id = ?`;

dbcon.query(sql, [
    renter.last_name, renter.first_name, renter.email, renter.address, renter.city, renter.state, 
    renter.zipcode, renter.phone, renter.username, renter.password, renter.id
    ], (error, result) => {
    if (error) {
        console.log("Error updating Renter " + error);
        response.writeHead(500, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({error: "Failed to update Renter"}));
      } 
    else {
        //the server has successfully processed the request and is returning the requested resource in the response body.
        response.writeHead(207, {'Content-Type': 'application/json'});
        response.end(JSON.stringify({message: "Renter Updated!"}));
    }
});
}
module.exports.modifyRenter = modifyRenter;


