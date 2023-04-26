var mysql = require('mysql');  // MySQL database driver module
var fs = require('fs');        // file system (fs) module

// Create a connection to a MySQL database using
// a specific set of credentials.
function getDBconnection()
{
	// create the connecction
	// host - the name of the computer that is running the MySql database service.
	// user - the name or user ID of the MySql user
	// password - the pass word of the user account
	// database - the databaase name
	
	var dbcon = mysql.createConnection({
	  host: "localhost",
	  user: "root",
	  password: "Princess28!",
	  database: "RentASpot"
	});
	
	return dbcon;
}

// Some of the SQL strings need to be enclosed in single quotes.
function quote(value)
{
	return "'" + value + "'";
}


// Load a file into memory and send it to the res (HTML response)
// function parameter so that it can be rendered in the remote 
// HTML browswer.
function loadFile(sFileName, bBinary, res, contentType) {
	var bRtn = false;
	
	// Confirm the file exists.
	if (fs.existsSync(sFileName))
	{
		// If the file is a binary file (like a jpeg image) then
		// load it as a binary file.
		if (bBinary === true)
		{
			fileToLoad = fs.readFileSync(sFileName);
			res.writeHead(200, {'Content-Type':  contentType });
			res.end(fileToLoad, 'binary');
			bRtn = true;
		}
		else
		{
			fileToLoad = fs.readFileSync(sFileName, "utf8");
			res.writeHead(200, {'Content-Type':  contentType });
			res.write(fileToLoad);
			res.end();
			bRtn = true;


		}
	}
	else
	{
		// If the file does not exist then let the end user know.
		res.end('Invalid Request! File does not exist: ' + sFileName);
	}	
	
}

// Given a set of user ID and password parameters, validate the UID and pw
// and then using the res (HTML response) parameter, send the correct
// HTML page to be rendereed on the remote browser.

async function validate_login_renter(uid, pw, res)
{
	var dbcon = getDBconnection();
	// connect to the MySQL database
	dbcon.connect();
	let renterRes = null;
	// setup the SQL string
	var sql = "select * from renter where Username = " + quote(uid) + " and Password = " + quote(pw) + ";";
	
	function setRenter(renter) {
		renterRes = renter;
		console.log("setRenter: ")
		console.log(renterRes);
	}

	// perform the SQL query
	let q = await new Promise( (resolve, reject) => {
		dbcon.query(sql, function (err, rows, fields) 
	{
		if (err) 
		{
			console.log("sql is incorrect: " + sql);
			throw err;
		}
		console.log("rows:");
		console.log(rows);
		// If the SQL returned a single row using the UID and PW then
		// the end-user typed in the correct PW and UID. If there are
		// rows returned then the UID and PW is not valid.
		if (rows.length > 0) {
		console.log('found renter record: ' + rows.length);
		loadFile('index_renter.html', false, res, 'text/html');
		resolve({...rows[0]})
		//console.log(renterRes);
		//return renterRes;
		}
		else
		{
			// Validation is false, inform the end user
			loadFile('login_invalid.html', false, res, 'text/html');
			reject(new Error("Validation failed"));
		}			

	});
	}); 
	
	

	setRenter(q);
	dbcon.end();
	return renterRes;

}

// Given a set of user ID and password parameters, validate the UID and pw
// and then using the res (HTML response) parameter, send the correct
// HTML page to be rendereed on the remote browser.
function validate_login_propertyowner(uid, pw, res)
{
	var bRtn = false;
	var dbcon = getDBconnection();
	
	// connect to the MySQL database
	dbcon.connect();

	// setup the SQL string
	var sql = "select count(*) as recordcount from owner where Username = " + quote(uid) + " and Password = " + quote(pw) + ";";
	
	// perform the SQL query
	dbcon.query(sql, function (err, rows, fields) 
	{
		if (err) 
		{
			console.log("sql is incorrect: " + sql);
			throw err;
		}

		// If the SQL returned a single row using the UID and PW then
		// the end-user typed in the correct PW and UID. If there are
		// rows returned then the UID and PW is not valid.
		bRtn = (rows[0].recordcount > 0 ? true : false);
		console.log('found property owner record: ' + rows[0].recordcount);
		
		if (bRtn == true)
		{
			// Validation is true therefore load the propertyowner landing page.
			loadFile('index_propertyowner.html', false, res, 'text/html')
		}
		else
		{
			// Validation is false, inform the end user
			loadFile('login_invalid.html', false, res, 'text/html');
		}			
		
		
	});
	
	dbcon.end();
	
	return bRtn;
}

function parkingspotlisting(res)
{
	var dbcon = getDBconnection();
	
	// connect to the MySQL database
	dbcon.connect();

	// setup the SQL string
	var sql = "select * from listings inner join propertyowner on listings.fkPropertyOwnerID = propertyowner.PropertyOwnerID order by ZipCode";
		
	dbcon.query(sql, function (err, rows, fields) 
	{
		if (err) 
		{
			console.log("sql is incorrect: " + sql);
			throw err;
		}

		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.write('<!DOCTYPE html>');
		res.write('<html><body>');

		res.write('<table><tr><th>Parking Spot Address</th><th>Parking Spot Size</th><th>Price</th><th>Map</th></tr>');
		
		for (var i = 0; i < rows.length; i++) 
		{
			res.write('<tr>');
			res.write('<td>' + rows[i].Address + ' ' + rows[i].City + ' ' + rows[i].ZipCode + '</td>'); 
			res.write('<td>' + rows[i].ParkingSpotLength + ' feet x ' + rows[i].ParkingSpotWidth + ' feet </td>');
			res.write('<td>' + rows[i].Price + rows[i].PriceUOM + '</td>');
			res.write('<td>Google map place holder</td>');
			res.write('</tr>');
		}
		
		res.write('</body></html>');
	});
	
	dbcon.end();

}


// We can’t access the functions defined in one module in another module by
// default. To access the module functions, we have to export the functions 
// and import them in the file we want to call the functions.

// Export the functions that are allowed to be called from other modules.
module.exports = { 
	validate_login_renter,
	validate_login_propertyowner,
	parkingspotlisting,
	getDBconnection,
	loadFile
};