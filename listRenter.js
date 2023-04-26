var db = require('./db_connection'); 

function listRenter(request, response, id) {
    let dbcon = db.getDBconnection();
    let sql = `SELECT last_name, first_name, email, address, city, state, zipcode, username FROM renter
               WHERE id = ?`;

    dbcon.query(sql, [id], (error, result) => {
        if (error) {
            console.log("Error retrieving Renter information: " + error);
            response.writeHead(500, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({error: "Failed to retrieve Renter information"}));
        } 
        else if (result.length == 0) {
            console.log("No Renter found with ID: " + id);
            response.writeHead(404, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({error: "Renter not found"}));
        }
        else {
            let renterRes = result[0];
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify({renterRes}));
            
        }
    });
}

module.exports.listRenter = listRenter;