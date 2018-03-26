// here is the example to update the version field in https://docs.google.com/spreadsheets/d/1jw57yZTwBk8cpPhERzcHbzrPhx5I2PAE0bTWsQc92VU/edit#gid=0
import fs from 'fs'
import {update, authorize} from './updater'

let SHEET_ID = '1jw57yZTwBk8cpPhERzcHbzrPhx5I2PAE0bTWsQc92VU'
let rangeMap = {
  'gomax': 'B3:B3',        // for Eagleyes    version position in the https://docs.google.com/spreadsheets/d/1jw57yZTwBk8cpPhERzcHbzrPhx5I2PAE0bTWsQc92VU/edit#gid=0
  'intrising': 'C3:C3',    // for intri.cloud version position in the https://docs.google.com/spreadsheets/d/1jw57yZTwBk8cpPhERzcHbzrPhx5I2PAE0bTWsQc92VU/edit#gid=0
  'evo': 'D3:D3'           // for evo-ip      version position in the https://docs.google.com/spreadsheets/d/1jw57yZTwBk8cpPhERzcHbzrPhx5I2PAE0bTWsQc92VU/edit#gid=0
}

let testRegexMap = {
  'gomax': /^v([0-9]+\.){2}(\*|[0-9]+e+)$/,
  'intrising': /^v([0-9]+\.){2}(\*|[0-9]+i+)$/,
  'evo': /^v([0-9]+\.){2}(\*|[0-9]+v+)$/
}

const VERSION = (process.env.version || process.env.VERSION)
const VENDOR = process.env.vendor || process.env.VENDOR

let vendor = VENDOR.toLowerCase()
let version = VERSION.toLowerCase()

try {
  checkParam()
  run()
} catch (e) {
  throw (e)
}

function checkParam () {
  if (!VERSION || !VENDOR) throw ('Version and Vendor is necessary')
  if (!rangeMap[vendor]) throw ("Invalid vendor, please enter one of the 'gomax', 'intrising', 'evo'")
  if (vendor === 'gomax' && !testRegexMap[vendor].test(version)) throw ("Invalid version string, please enter the format like 'v1.22.31e'")
  if (vendor === 'intrising' && !testRegexMap[vendor].test(version)) throw ("Invalid version string, please enter the format like 'v1.22.31i'")
  if (vendor === 'evo' && !testRegexMap[vendor].test(version)) throw ("Invalid version string, please enter the format like 'v1.22.31v'")
}


function run () {
  // Load client secrets from a local file.
  fs.readFile('client_secret.json', function processClientSecrets (err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err)
      return
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Sheets API.
    authorize(JSON.parse(content), update, {range: rangeMap[vendor], id: SHEET_ID, values: [[version]]})
  })
  console.log('Update ', vendor, ' to version ', version)
}
