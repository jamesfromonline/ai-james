require('dotenv').config()
const twit = require('twit')
const { GoogleSpreadsheet } = require('google-spreadsheet')
const googleCreds = require('./google_config')
const sheetId = process.env.GOOGLE_SHEET_ID
const doc = new GoogleSpreadsheet(sheetId)

const T = new twit({
  consumer_key:         process.env.CONSUMER_KEY,
  consumer_secret:      process.env.CONSUMER_SECRET,
  access_token:         process.env.ACCESS_TOKEN,
  access_token_secret:  process.env.ACCESS_SECRET,
  timeout_ms:           60*1000,
  strictSSL:            true
})

const handleSheetsUpdate = async () => {
  try {
    await doc.useServiceAccountAuth(googleCreds)
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()
    await sheet.loadCells('A2:A2')
    const nextTweet = sheet.getCellByA1('A2').value
    if (nextTweet)
      T.post('statuses/update',
      { status: nextTweet },
      async (data, err) => {
        console.log(data)
        !err && await rows[0].delete()
        err && console.log(err)
      })
      // console.log(new Date(), nextTweet)
  } catch (e) {
    throw e.message
  }
}

handleSheetsUpdate()
