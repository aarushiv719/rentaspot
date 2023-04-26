/* -------------------------------------------------------------------------- *\
   Node.js
   
   As an asynchronous event-driven JavaScript runtime, Node.js is designed to
   build scalable network applications. In the following web server example, 
   many client web connections can be handled concurrently. Upon each 
   connection, the callback is fired, but if there is no work to be done, 
   Node.js will sleep.
   ----------------------------------------------------
   Make sure you install the MySQL driver by navigating to the director that
   contains the npm.exe file in the nodejs directory and then use the 
   following command line:
   
   npm install mysql   
   
\* -------------------------------------------------------------------------- */
// 1 - import Node.js core module
// Load core Node.js modules
const cr = require('./createRenter');
const mr = require ('./modifyRenter');
const co = require('./createOwner');
const listR = require('./listRenter');
const http = require('http');        // http module
var fs = require('fs');              // file system (fs) module
var db = require('./db_connection'); // mySQL connection file
var qs = require('querystring');     // use this to process POST form variables
const url = require('url');
var currentUser = null;
// web server vars
const ws_hostname = '127.0.0.1'; 
const ws_port = 3000;
let dbcon = db.getDBconnection();
let testQuery = "SELECT * FROM Renter";
let testQueryOwner = "SELECT * FROM Owner";
let createTab = "CREATE TABLE Renter (last_name VARCHAR(255) NOT NULL, first_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, city VARCHAR(255), state VARCHAR(255) NOT NULL, zipcode VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, id MEDIUMINT PRIMARY KEY AUTO_INCREMENT)";
let propertyOwner = "CREATE TABLE Owner (last_name VARCHAR(255), first_name VARCHAR(255), email VARCHAR(255), address VARCHAR(255), city VARCHAR(255), state VARCHAR(255), zipcode VARCHAR(255), phone VARCHAR(255), username VARCHAR(255), password VARCHAR(255))";


dbcon.query(testQuery, function(err) {
	if (err) {
		dbcon.query(createTab, function(err) {
		if (err) throw err;
		console.log("Renter Table created!");
	})}
});

dbcon.query(testQueryOwner, function(err) {
	if (err) {
		dbcon.query(propertyOwner, function(err) {
			if (err) throw err;
			console.log("Owner Table Created!");
		})
	}
});

// 2 - create server
// The next step is to call createServer() method of http and specify callback 
// function with request and response parameter.
// The http.createServer() method includes request and response parameters 
// which is supplied by Node.js.  The request object can be used to get 
// information about the current HTTP request e.g., url, request header, and 
// data. The response object can be used to send a response for a current HTTP 
// request. 
const server = http.createServer(function (req, res) 
{
	const { pathname, query } = url.parse(req.url, true);
	var isImage = 0, contentType, fileToLoad;
	var file_ext, file_name;
	
	if (pathname.includes("."))
	{
		file_name = "." + pathname;
		file_ext = pathname.split('.').pop();
	}
	else
	{
		file_name = "";
		file_ext = "";
	}
	
	if (file_ext != 'ico')
	{
		console.log('---------------------------------------------------');
		console.log('method:    ' + req.method);
		console.log('pathname:  ' + pathname);
		console.log('file_ext:  ' + file_ext);
		console.log('file_name: ' + file_name);
	}
	
	if (file_ext.length > 0)
	{
		switch(file_ext)
		{
			case "jpg":
				contentType = 'image/jpg';
				isImage = 1;
				break;
			case "png":
				contentType = 'image/png';
				isImage = 1;
				break;
			case "js":
				contentType = 'text/javascript';
				isImage = 2;
				break;
			case "css":
				contentType = 'text/css';
				isImage = 2;
				break;
			case "html":
				contentType = 'text/html';
				isImage = 2;
				break;
		}
	}	
	
	//check the URL of the current request
	if (req.url == '/') 
	{ 
		// load the html file and send it to the client
		fs.readFile('index.html',function (err, data)
		{
			if (!err)
			{
				res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
				res.write(data);
				res.end();
			}
			else
			{
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.write('<html><body><p>Failed to load requested file.</p></body></html>');
				res.end();
			}
		});
	}
	else if (req.url == '/db_validate_login_renter' && req.method == 'POST') 
	{ 
		var body="";
		req.on("data", function (data) { body +=data; });
		req.on("end",async function(){ 
			var formvar = qs.parse(body);
			currentUser = await db.validate_login_renter(formvar.uid, formvar.psw, res);
			console.log("webserver:");
			console.log(currentUser);
			//console.log('db.validate_login_renter() = ' + currentUser);

		});
	  
		req.on("error",function(e){		});
    }	
	else if (req.url == '/db_validate_login_propertyowner' && req.method == 'POST') 
	{ 
		var body="";
		req.on("data", function (data) { body +=data; });
		req.on("end",function(){ 
			var formvar = qs.parse(body);

			var bValid = db.validate_login_propertyowner(formvar.uid, formvar.psw, res);
			console.log('db.validate_login_propertyowner() = ' + bValid);

		});
	  
		req.on("error",function(e){		});
    }	
	else if (req.url == '/parkingspotlisting' && req.method == 'GET') 
	{ 
		var body="";
		req.on("data", function (data) { body +=data; });
		req.on("end",function(){ 
			var formvar = qs.parse(body);
			db.parkingspotlisting(res);
		});
	  
		req.on("error",function(e){		});
    } else if (req.url == '/createRenter' && req.method == 'POST') {
		var body="";
		req.on("data", function (data) { body +=data; });
		req.on("end",function(){ 
			var formvar = qs.parse(body);
			cr.createRenter(req,res,body);
		});
	  
		req.on("error",function(e){		});
	} else if (req.url == '/modifyRenter' && req.method == 'POST') {
		var body = "";
		req.on("data", function (data) { body +=data; });
		req.on("end",function(){ 
			var formvar = qs.parse(body);
			mr.modifyRenter(req,res,body);
		});
		req.on("error",function(e){		});

	} else if(req.url == '/createOwner' && req.method == 'POST') {
		var body = "";
		req.on("data", function (data) {body += data;});
		req.on("end", function () {
			var formvar = qs.parse(body);
			co.createOwner(req, res, body);
		});
		req.on("error", function(e){ 	});
	} else if (pathname == '/listRenter' && req.method == 'GET') {
		var body="";
		req.on("data", function (data) {
			body +=data;
		 });
		req.on("end",function(){ 
			listR.listRenter(req,res,query['id']);
		});
	  
		req.on("error",function(e){		});

	  } else if (pathname == '/getCurrentUser' && req.method == 'GET'){
		//console.log(currentUser);
		res.writeHead(207, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(currentUser));

	 } else {
		if(isImage == 1)
		{
			loadFile(file_name, true, res, contentType);
		}
		else if(isImage == 2)
		{
			loadFile(file_name, false, res, contentType);
		}
		else
			res.end('Invalid Request!');
	}


});

// 3 - listen for any incoming requests
// Finally, call listen() method of server object which was returned from 
// createServer() method with port number, to start listening to incoming 
// requests on port 5000.
server.listen(ws_port, ws_hostname);
console.log('Web server running at:     http://' + ws_hostname + ':' + ws_port + '/');
console.log('Current working directory: ' + process.cwd());


function getFormVars(req)
{
	var formvar;
	
	var body="";
	req.on("data", function (data) {
		body +=data;
	});
  
	req.on("end",function(){
		var formvar = qs.parse(body);
		
		//rest of code - this function is executed when all the variables are received
	});
  
	req.on("error",function(e){
		//console.log('problem with request: ' + e.message);
	});
	
	return formvar;
	
}

function loadFile(sFileName, bBinary, res, contentType)
{
	var bRtn = false;
	
	if (fs.existsSync(sFileName))
	{
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
		res.end('Invalid Request! File does not exist: ' + sFileName);
	}
	
	return bRtn;
}