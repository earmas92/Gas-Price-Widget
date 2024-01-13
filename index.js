import express, { json } from 'express';
import fetch, { Headers } from 'node-fetch';

const app = express();
const port = 3000; // You can change the port number as needed

app.use(json());


app.get('/', (req, res) => {
    res.send('Hello World!')
  })


app.post('/gasbuddy', async (req, res) => {
  try {
    // const { fuel, lat, lng, maxAge } = req.body;

    var myHeaders = new Headers();
    myHeaders.append("authority", "www.gasbuddy.com");
    // Add other headers as needed

    var graphql = JSON.stringify({
      query: "query LocationBySearchTerm($brandId: Int, $cursor: String, $fuel: Int, $lat: Float, $lng: Float, $maxAge: Int, $search: String) {\n  locationBySearchTerm(lat: $lat, lng: $lng, search: $search) {\n    countryCode\n    displayName\n    latitude\n    longitude\n    regionCode\n    stations(\n      brandId: $brandId\n      cursor: $cursor\n      fuel: $fuel\n      lat: $lat\n      lng: $lng\n      maxAge: $maxAge\n    ) {\n      count\n      cursor {\n        next\n        __typename\n      }\n      results {\n        // ... (rest of the query)\n      }\n      __typename\n    }\n    // ... (rest of the query)\n  }\n}",
      variables: req.body
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: graphql,
      redirect: 'follow'
    };

    const response = await fetch("https://www.gasbuddy.com/graphql", requestOptions);
    const result = await response.text();
    console.log(result)
    res.json(JSON.parse(result));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
