const express = require('express')
const axios = require('axios')
const cors = require('cors')
var parseString = require('xml2js').parseString
const app = express()

const PORT = process.env.PORT || 5000
const zwsid = 'X1-ZWz18kyhv9kzd7_6frtk'

app.use(cors())

app.get('/zillow', (req, res) => {
  // parse query params
  const street = req.query.street
  const citystatezip = req.query.citystatezip
  // query zillow for address
  axios.get(`http://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id=${zwsid}&address=${street}&citystatezip=${citystatezip}&rentzestimate=true`)
    .then(result => {
      // parse data
      parseString(result.data, (error, result) => {
        if (error) {
          return res.json(error)
        }
        const addressData = result["SearchResults:searchresults"].response[0].results[0].result[0]
        const zpid = parseInt(addressData.zpid[0])
        const zestimate = parseInt(addressData.zestimate[0].amount[0]._)
        const rentZestimate = parseInt(addressData.rentzestimate[0].amount[0]._)
        const yearBuilt = parseInt(addressData.yearBuilt[0])
        // return parsed data
        if (zpid) {
          return res.json({
            zpid,
            zestimate,
            rentZestimate,
            yearBuilt
          })
        } else {
          return res.json({
            error: true,
            message: "No properties found for the submitted address"
          })
        }
      })
    })
    .catch(error => {
      return res.json(error)
    })
})

app.listen(PORT, () => console.log(`Zillow Proxy API listening on port ${PORT}!`))
