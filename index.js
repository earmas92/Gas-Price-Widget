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
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-US,en;q=0.9");
myHeaders.append("apollo-require-preflight", "true");
myHeaders.append("content-type", "application/json");
myHeaders.append("gbcsrf", "1.ZZjgVN9S4RtbF6zO");
myHeaders.append("origin", "https://www.gasbuddy.com");
myHeaders.append("referer", "https://www.gasbuddy.com/home?fuel=1&method=all&maxAge=0&lat=25.7758819&lng=-80.3768659");
myHeaders.append("sec-ch-ua", "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"");
myHeaders.append("sec-ch-ua-mobile", "?0");
myHeaders.append("sec-ch-ua-platform", "\"macOS\"");
myHeaders.append("sec-fetch-dest", "empty");
myHeaders.append("sec-fetch-mode", "cors");
myHeaders.append("sec-fetch-site", "same-origin");
myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    var graphql = JSON.stringify({
      query: "query LocationBySearchTerm($brandId: Int, $cursor: String, $fuel: Int, $lat: Float, $lng: Float, $maxAge: Int, $search: String) {\n  locationBySearchTerm(lat: $lat, lng: $lng, search: $search) {\n    countryCode\n    displayName\n    latitude\n    longitude\n    regionCode\n    stations(\n      brandId: $brandId\n      cursor: $cursor\n      fuel: $fuel\n      lat: $lat\n      lng: $lng\n      maxAge: $maxAge\n    ) {\n      count\n      cursor {\n        next\n        __typename\n      }\n      results {\n        address {\n          country\n          line1\n          line2\n          locality\n          postalCode\n          region\n          __typename\n        }\n        badges {\n          badgeId\n          callToAction\n          campaignId\n          clickTrackingUrl\n          description\n          detailsImageUrl\n          detailsImpressionTrackingUrls\n          imageUrl\n          impressionTrackingUrls\n          targetUrl\n          title\n          __typename\n        }\n        brandings {\n          brandId\n          brandingType\n          __typename\n        }\n        brands {\n          brandId\n          imageUrl\n          name\n          __typename\n        }\n        distance\n        emergencyStatus {\n          hasDiesel {\n            nickname\n            reportStatus\n            updateDate\n            __typename\n          }\n          hasGas {\n            nickname\n            reportStatus\n            updateDate\n            __typename\n          }\n          hasPower {\n            nickname\n            reportStatus\n            updateDate\n            __typename\n          }\n          __typename\n        }\n        enterprise\n        fuels\n        id\n        name\n        offers {\n          discounts {\n            grades\n            highlight\n            pwgbDiscount\n            receiptDiscount\n            __typename\n          }\n          highlight\n          id\n          types\n          use\n          __typename\n        }\n        payStatus {\n          isPayAvailable\n          __typename\n        }\n        prices {\n          cash {\n            nickname\n            postedTime\n            price\n            formattedPrice\n            __typename\n          }\n          credit {\n            nickname\n            postedTime\n            price\n            formattedPrice\n            __typename\n          }\n          discount\n          fuelProduct\n          __typename\n        }\n        priceUnit\n        ratingsCount\n        starRating\n        __typename\n      }\n      __typename\n    }\n    trends {\n      areaName\n      country\n      today\n      todayLow\n      trend\n      __typename\n    }\n    __typename\n  }\n}",
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
