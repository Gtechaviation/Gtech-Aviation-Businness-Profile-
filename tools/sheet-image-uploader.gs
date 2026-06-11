/**
 * Gtech Website — Sheet → GitHub image uploader (Google Apps Script)
 * ------------------------------------------------------------------
 * Lets you paste a Google Drive link (or any image URL) into the "image"
 * column of the content sheet and, with one menu click, uploads that image
 * into the GitHub repo and replaces the cell with the permanent website URL
 * (https://gtechaviation.github.io/.../assets/uploads/<key>.jpg).
 * The website already reads that column, so the picture updates on reload.
 *
 * ONE-TIME SETUP
 * 1. Open the content sheet → Extensions ▸ Apps Script.
 * 2. Delete any sample code, paste this whole file, click Save.
 * 3. Project Settings (gear icon) ▸ Script properties ▸ Add property:
 *       name : GITHUB_TOKEN
 *       value: <a GitHub fine-grained token with Contents = Read and write
 *               on the Gtech-Aviation-Businness-Profile- repo>
 *    (GitHub ▸ Settings ▸ Developer settings ▸ Personal access tokens ▸
 *     Fine-grained tokens ▸ Generate. Repository access: only this repo.
 *     Permissions: Repository ▸ Contents ▸ Read and write.)
 * 4. Reload the sheet. A "Gtech" menu appears at the top.
 *
 * USE
 * - Put a Drive link or image URL in the image column, then click
 *   Gtech ▸ Upload images to GitHub. (Authorize the script on first run.)
 * - Each new image is committed to assets/uploads/ and the cell becomes the
 *   permanent website URL. Cells already pointing to the website are skipped.
 */

const REPO    = 'Gtechaviation/Gtech-Aviation-Businness-Profile-';
const BRANCH  = 'main';
const PAGES   = 'https://gtechaviation.github.io/Gtech-Aviation-Businness-Profile-/';
const KEY_COL = 1; // column A (key)
const IMG_COL = 3; // column C (image)

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Gtech')
    .addItem('Upload images to GitHub', 'uploadImagesToGitHub')
    .addToUi();
}

function uploadImagesToGitHub() {
  var sh = SpreadsheetApp.getActiveSheet();
  var values = sh.getDataRange().getValues();
  var done = 0, skipped = 0, errors = [];
  for (var r = 1; r < values.length; r++) {            // row 0 is the header
    var key  = String(values[r][KEY_COL - 1] || '').trim();
    var cell = String(values[r][IMG_COL - 1] || '').trim();
    if (!key || !cell) continue;
    if (cell.indexOf(PAGES) === 0) { skipped++; continue; } // already on the site
    try {
      var blob = fetchImage_(cell);
      var path = 'assets/uploads/' + key + '.' + extFor_(blob, cell);
      var url  = commitToGitHub_(path, blob);
      sh.getRange(r + 1, IMG_COL).setValue(url);
      done++;
    } catch (e) {
      errors.push(key + ': ' + e.message);
    }
  }
  var msg = 'Uploaded: ' + done + '\nAlready on site: ' + skipped;
  if (errors.length) msg += '\n\nErrors:\n' + errors.join('\n');
  SpreadsheetApp.getUi().alert(msg);
}

function fetchImage_(src) {
  var m = src.match(/\/d\/([-\w]{20,})/) || src.match(/[?&]id=([-\w]{20,})/);
  if (m) return DriveApp.getFileById(m[1]).getBlob();      // Drive file (no public share needed)
  return UrlFetchApp.fetch(src, { muteHttpExceptions: true }).getBlob(); // any public image URL
}

function extFor_(blob, src) {
  var ct = (blob.getContentType() || '').toLowerCase();
  if (ct.indexOf('png')  >= 0 || /\.png(\?|$)/i.test(src))  return 'png';
  if (ct.indexOf('webp') >= 0 || /\.webp(\?|$)/i.test(src)) return 'webp';
  if (ct.indexOf('gif')  >= 0 || /\.gif(\?|$)/i.test(src))  return 'gif';
  return 'jpg';
}

function commitToGitHub_(path, blob) {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('Set GITHUB_TOKEN in Project Settings ▸ Script properties.');
  var api = 'https://api.github.com/repos/' + REPO + '/contents/' + path;
  var headers = { Authorization: 'token ' + token, Accept: 'application/vnd.github+json' };

  var sha = null;                                          // needed when overwriting
  var get = UrlFetchApp.fetch(api + '?ref=' + BRANCH, { headers: headers, muteHttpExceptions: true });
  if (get.getResponseCode() === 200) sha = JSON.parse(get.getContentText()).sha;

  var payload = {
    message: 'Update ' + path + ' via Google Sheet',
    content: Utilities.base64Encode(blob.getBytes()),
    branch:  BRANCH
  };
  if (sha) payload.sha = sha;

  var put = UrlFetchApp.fetch(api, {
    method: 'put', headers: headers, contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  if (put.getResponseCode() >= 300) {
    throw new Error('GitHub ' + put.getResponseCode() + ': ' + put.getContentText());
  }
  return PAGES + path;
}
