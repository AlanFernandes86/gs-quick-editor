function loadGoogleApi() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  const API_KEY = 'AIzaSyCFZjHEVeI9QgwCARRcEzW5pdJ_GGyvCGQ';
  const DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
  const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive';
  const CLIENT_ID = '1074659725945-evslt5efu5blhquu7404fr95op7jv7ua.apps.googleusercontent.com';

  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
    updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, function (error) {
    errorMessage(JSON.stringify(error, null, 2));
  });
}

function updateSignInStatus(isSignedIn) {
  const menuContainer = document.querySelector('.ui.menu.container');
  toggleBtnSignInOrOut(isSignedIn);
  if (isSignedIn) {
    error.innerHTML = '';
    root.classList.remove('display-none');
    error.classList.add('display-none');
    gapi.client.load('drive', 'v3')
      .then(() => {
        //execute();
      });
  } else {
    //root.classList.add('display-none');
    errorMessage('Você não está autenticado! Favor clicar no botão "Sign In" no menu superior.\n'
      + 'Importante desabilitar o bloqueador de popup.');
  }
}

function toggleBtnSignInOrOut(isSignedIn) {
  if (isSignedIn) {
    menuBtnSignIn.classList.add('display-none');
    menuBtnSignOut.classList.remove('display-none');
    loadHome();
  } else {
    menuBtnSignIn.classList.remove('display-none');
    menuBtnSignOut.classList.add('display-none');
  }
}

function handleSignInClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignOutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
  document.location.reload();
}

// Make sure the client is loaded and sign-in is complete before calling this method.
function execute() {
  gapi.client.drive.files.list({
    pageSize: 1000,
  })
    .then(function (response) {
      // Handle the results here (response.result has the parsed body).
      console.log(response);
      return gapi.client.drive.files.get({
        fileId: response.result.files[153].id,
        fields: 'webContentLink',
      }).then((response) => {
        document.getElementById('img').src = response.result.webContentLink;
        console.log(response);
      });
    }, function (err) { console.error("Execute error", err); });
}

async function createSheet(title) {
  const spreadsheetBody = {
    'properties': {
      'title': title,
    },
  };
  return new Promise((resolve) => {
    const request = gapi.client.sheets.spreadsheets.create({}, spreadsheetBody);
    request.then(function (response) {
      resolve(response.result);
    }, function (reason) {
      console.error('error: ' + reason.result.error.message);
    });
  });
}

async function getSpreadsheet(spreadsheetId) {
  const params = {
    // The spreadsheet to request.
    spreadsheetId: spreadsheetId,  // TODO: Update placeholder value.

    // The ranges to retrieve from the spreadsheet.
    ranges: [],  // TODO: Update placeholder value.

    // True if grid data should be returned.
    // This parameter is ignored if a field mask was set in the request.
    includeGridData: true,  // TODO: Update placeholder value.
  };

  return new Promise((resolve) => {
    const request = gapi.client.sheets.spreadsheets.get(params);
    request.then(function (response) {
      resolve(response);
    }, function (reason) {
      console.error('error: ' + reason.result.error.message);
    });
  });
}

async function getSpreadsheetRows(spreadsheetId, range) {
  return new Promise((resolve, reject) => {
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    }).then(function (response) {
      const range = response.result;
      if (range.values.length > 0) {
        resolve(range);
      } else {
        errorMessage('No data found.');
      }
    }, function (response) {
      errorMessage('Error: ' + response.result.error.message);
    });
  });
}

async function putSpreadsheetData(range, spreadsheetId, values) {
  return new Promise((resolve, reject) => {
    const params = {
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      includeValuesInResponse: true,
    }

    const valueRangeBody = {
      values: [
        values,
      ],
      majorDimension: 'ROWS',
    };
    gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody).then(function (response) {
      resolve(response.result);
    }, function (response) {
      errorMessage('Error: ' + response.result.error.message);
    });
  });
}