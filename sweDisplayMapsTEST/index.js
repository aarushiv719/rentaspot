
const mysql = require('mysql');
const NodeGeocoder = require('node-geocoder');
const googleMapsApiKey = '';
const googleMapsScript = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Number*21',
  database: 'rentaspot'
});
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Number*21',
  database: 'rentaspot'
};
const geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: ''
});

function filterPosts() {
  // Connect to the database
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) throw err;

    // Retrieve all the entries from the `posts` table
    connection.query('SELECT * FROM posts', async (error, results) => {
      if (error) throw error;

      // Loop through each entry
      const filteredRows = [];
      for (const row of results) {
        // Geocode the address
        const result = await geocoder.geocode(row.address);
        const lat = result[0].latitude;
        const lng = result[0].longitude;

        // Calculate the distance between the address and Rutgers University New Brunswick
        const rutgersLat = 40.5007;
        const rutgersLng = -74.4474;
        const distance = Math.sqrt(Math.pow(lat - rutgersLat, 2) + Math.pow(lng - rutgersLng, 2));

        // If the distance is less than 10 miles, add the entry to the filteredRows array
        if (distance < 1) {
          filteredRows.push(row);
        }
      }

      // Create the `postswithradius` table with the same schema as the `posts` table
      connection.query('CREATE TABLE IF NOT EXISTS postswithinradius LIKE posts', (error) => {
        if (error) throw error;

        // Insert the filtered entries into the `postswithradius` table
        for (const row of filteredRows) {
          connection.query('INSERT INTO postswithinradius SET ?', row, (error) => {
            if (error) throw error;
          });
        }

        // Close the database connection
        connection.end();
      });
    });
  });
}

filterPosts();

app.get('/', (req, res) => {
  connection.query('SELECT * FROM posts', (error, results, fields) => {
    if (error) throw error;

    let html = '';
    let markers = [];
    for (const result of results) {
      const address = result.address;
      const firstName = result.firstname;
      const lastName = result.lastname;
      const price = result.price;
      const telephone = result.telephone;
      const description = result.description;
      const contentString = `
        <div>
          <h2>${firstName} ${lastName}</h2>
          <p>${address}</p>
          <p>${price}</p>
          <p>${telephone}</p>
          <p>${description}</p>
        </div>
      `;
      const marker = {
        position: { lat: 0, lng: 0 },
        contentString: contentString
      };
      markers.push(marker);
    }

    const mapDiv = '<div id="map" class="map"></div>';
    html += `
      <div>
        <h2>All Addresses</h2>
        ${mapDiv}
      </div>
    `;

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Show Addresses on Map</title>
          <style>
            .map {
              height: 400px;
              width: 100%;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Show Addresses on Map</h1>
          ${html}
          <script src="${googleMapsScript}"></script>
          <script>
            function showAddressesOnMap(markers) {
              const geocoder = new google.maps.Geocoder();
              const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 10,
                center: { lat: 40.5007, lng: -74.4474 },
              });

              for (const marker of markers) {
                geocoder.geocode({ address: marker.contentString }, (results, status) => {
                  if (status === 'OK') {
                    const infoWindow = new google.maps.InfoWindow({
                      content: marker.contentString
                    });
                    const newMarker = new google.maps.Marker({
                      map,
                      position: results[0].geometry.location,
                      title: marker.contentString
                    });
                    newMarker.addListener('click', () => {
                      infoWindow.open(map, newMarker);
                    });
                  } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                  }
                });
              }
            }

            document.addEventListener("DOMContentLoaded", () => {
              showAddressesOnMap(${JSON.stringify(markers)});
            });
          </script>
        </body>
      </html>
    `);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
