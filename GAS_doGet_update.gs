// ============================================================
// NEXT.JS BRIDGE — Add this to the TOP of your Code.gs
// Replaces the existing doGet() function
// Handles both: google.script.run (existing GAS UI)
//               fetch() calls from Next.js frontend
// ============================================================

function doGet(e) {
  // ── CORS headers for Next.js / external fetch ──
  var output;

  // Check if this is an API call from Next.js (has 'func' param)
  if (e && e.parameter && e.parameter.func) {
    output = _handleAPICall(e);
  } else {
    // Original GAS HTML serving (keep existing behaviour)
    var view = (e && e.parameter && e.parameter.view) || '';
    if (view === 'jobs') {
      return HtmlService
        .createTemplateFromFile('jobs-portal')
        .evaluate()
        .setTitle('Careers — United Group Holding')
        .addMetaTag('viewport','width=device-width, initial-scale=1.0')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }
    return HtmlService
      .createTemplateFromFile('index')
      .evaluate()
      .setTitle('United Group Holding — HR System')
      .addMetaTag('viewport','width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  return output;
}

// ── Main API dispatcher ──
function _handleAPICall(e) {
  var func  = e.parameter.func  || '';
  var token = e.parameter.token || '';
  var args  = [];

  try {
    args = JSON.parse(e.parameter.args || '[]');
  } catch(err) {
    args = [];
  }

  var result;

  try {
    // ── Public functions — no token required ──
    if (func === 'loginUser') {
      result = loginUser(args[0], args[1]);

    } else if (func === 'validateSession') {
      result = validateSession(args[0]);

    } else if (func === 'logoutUser') {
      result = logoutUser(args[0]);

    } else if (func === 'loadAllData') {
      // loadAllData takes the token as first arg from Next.js
      var sessionToken = args[0] || token;
      if (sessionToken) _setSessionFromToken(sessionToken);
      result = loadAllData(sessionToken);

    } else if (func === 'getPublicJobs') {
      result = getPublicJobs();

    // ── Protected functions — token required ──
    } else if (func === 'runProtected') {
      // Next.js calls: runProtected(token, funcName, args)
      var protToken    = args[0] || token;
      var protFuncName = args[1] || '';
      var protArgs     = args[2] || [];
      result = runProtected(protToken, protFuncName, protArgs);

    } else {
      result = { success: false, error: 'Unknown function: ' + func };
    }
  } catch(err) {
    result = { success: false, error: err.message || String(err) };
  }

  // Return JSON with CORS headers
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// END OF NEXT.JS BRIDGE
// ============================================================
