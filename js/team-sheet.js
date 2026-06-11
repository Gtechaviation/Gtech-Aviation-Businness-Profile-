/* Live team content from a Google Sheet.
   Edit the sheet (columns: key, name, role) and the org chart updates on reload.
   The sheet must be shared "Anyone with the link: Viewer" (or Published to web).
   Falls back silently to the names/roles already in the HTML if the sheet is
   unreachable, so the page never breaks. */
(function () {
  "use strict";

  var SHEET_ID = "10tmLC6iZBkiOQKyyERoyLpjqHkVk0tZWX5hwokH8br8";
  var URL = "https://docs.google.com/spreadsheets/d/" + SHEET_ID +
            "/gviz/tq?tqx=out:json";

  function apply(map) {
    var nodes = document.querySelectorAll("[data-team-key]");
    nodes.forEach(function (el) {
      var row = map[el.getAttribute("data-team-key")];
      if (!row) return;
      if (row.name) el.textContent = row.name;
      if (row.role) {
        var card = el.closest(".op-person, .lc-card");
        var roleEl = card && card.querySelector(".op-role, .role");
        if (roleEl) roleEl.textContent = row.role;
      }
    });
  }

  fetch(URL)
    .then(function (r) { return r.text(); })
    .then(function (text) {
      var start = text.indexOf("{");
      var end = text.lastIndexOf("}");
      if (start < 0 || end < 0) return;
      var data = JSON.parse(text.substring(start, end + 1));
      var rows = (data.table && data.table.rows) || [];
      var map = {};
      rows.forEach(function (row) {
        var c = row.c || [];
        var key = c[0] && c[0].v != null ? String(c[0].v).trim() : "";
        if (!key || key.toLowerCase() === "key") return; // skip header row
        map[key] = {
          name: c[1] && c[1].v != null ? String(c[1].v).trim() : null,
          role: c[2] && c[2].v != null ? String(c[2].v).trim() : null
        };
      });
      apply(map);
    })
    .catch(function () { /* keep the static HTML content */ });
})();
