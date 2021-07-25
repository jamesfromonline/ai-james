require('dotenv').config()
const twit = require('twit')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const googleCreds = require('./google_config.json')
const sheetId = process.env.GOOGLE_SHEET_ID
const T = new twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_SECRET,
  timeout_ms:           60*1000,
  strictSSL:            true
})

const doc = new GoogleSpreadsheet(sheetId);
const handleSheetsUpdate = async () => {
  try {
    await doc.useServiceAccountAuth(googleCreds)
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()
    await sheet.loadCells('A2:A2')
    const latestTweet = sheet.getCellByA1('A2').value
    if (latestTweet) {
      
      T.post('statuses/update', { status: latestTweet }, async err => {
        if (!err) {
          console.log('TWEETED: ', latestTweet)
          await rows[0].delete()
        }
      })

    }
  } catch (e) {
    throw e.message
  }
}

handleSheetsUpdate()