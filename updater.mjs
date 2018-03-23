import fs from 'fs'
import googleAuth from 'google-auth-library'
import readline from 'readline'
import google from 'googleapis'


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
let SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
let TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
let TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export function authorize (credentials, callback, argsInCb) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      console.log('get new token');
      getNewToken(oauth2Client, callback, argsInCb);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      console.log('run callback');
      callback(oauth2Client, argsInCb);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken (oauth2Client, callback, argsInCb) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client, argsInCb);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken (token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}


/**
 * Print the names and majors of students in a sample spreadsheet:
 * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 */
export function listMajors(auth, argsInCb) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SHEET_ID,
    range: 'B2:D2'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        console.log(row);
        // Print columns A and E, which correspond to indices 0 and 4.
        // console.log('%s, %s', row[0], row[4]);
      }
    }
  });
}

export function update (auth, argsInCb) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.update({
    auth: auth,
    spreadsheetId: argsInCb.id,
    range: argsInCb.range,
    includeValuesInResponse: true,
    valueInputOption: 'RAW',  // using v25.0.0 will get error, so we use v24.0.0 now
    resource: {
      values: argsInCb.values
    }
  }, function(err, response) {
    if (err) {
      throw ('The API returned an error: ' + err)
    }
    console.log("response.values is", response.values)
    // var rows = response.values;
    // if (rows.length == 0) {
    //   console.log('No data found.');
    // } else {
    //   for (var i = 0; i < rows.length; i++) {
    //     var row = rows[i];
    //     console.log(row);
    //     // Print columns A and E, which correspond to indices 0 and 4.
    //     // console.log('%s, %s', row[0], row[4]);
    //   }
    // }
  });
}

export default {
  update,
  authorize
}
