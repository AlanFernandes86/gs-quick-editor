export const sheets = () => {
   
  return {
    execute: () => {
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
    },

    createSheet: async (title) => {
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
    },

    getSpreadsheet: async (spreadsheetId) => {
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
    },

    getSpreadsheetRows: async (spreadsheetId, range) => {
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
    },

    putSpreadsheetData: async (range, spreadsheetId, values) => {
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
    },
  } // FIM DO RETURN

};
