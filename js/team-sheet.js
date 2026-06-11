/* Live team content from a Google Sheet.
   Sheet columns:  key | name | role | image (image is optional)
   - Edit name/role text and it updates the matching card on reload.
   - Put a public image URL (or a Google Drive share link) in the image column
     to change that person's photo. Leave it blank to keep the current picture.
   The sheet must be shared "Anyone with the link: Viewer".
   Falls back silently to whatever is already in the HTML if the sheet is
   unreachable, so the page never breaks. */
(function () {
  "use strict";

  var SHEET_ID = "10tmLC6iZBkiOQKyyERoyLpjqHkVk0tZWX5hwokH8br8";
  var URL = "https://docs.google.com/spreadsheets/d/" + SHEET_ID +
            "/gviz/tq?tqx=out:json";

  // Turn a Google Drive share link into a direct image URL.
  function toImageUrl(u) {
    if (!u) return null;
    u = u.trim();
    var m = u.match(/\/d\/([-\w]{20,})/) || u.match(/[?&]id=([-\w]{20,})/);
    if (m) return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w600";
    return u;
  }

  function apply(map) {
    document.querySelectorAll("[data-team-key]").forEach(function (el) {
      var row = map[el.getAttribute("data-team-key")];
      if (!row) return;
      var card = el.closest(".op-person, .lc-card");
      if (row.name) el.textContent = row.name;
      if (row.role) {
        var roleEl = card && card.querySelector(".op-role, .role");
        if (roleEl) roleEl.textContent = row.role;
      }
      if (row.image && card) {
        var avatar = card.querySelector(".lc-avatar, .op-avatar");
        if (avatar) {
          var img = avatar.querySelector("img");
          if (!img) { img = document.createElement("img"); avatar.appendChild(img); }
          img.src = toImageUrl(row.image);
          img.alt = row.name || "";
          avatar.classList.remove("logo-av"); // show as a real photo, not a logo
        }
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
          name:  c[1] && c[1].v != null ? String(c[1].v).trim() : null,
          role:  c[2] && c[2].v != null ? String(c[2].v).trim() : null,
          image: c[3] && c[3].v != null ? String(c[3].v).trim() : null
        };
      });
      apply(map);
    })
    .catch(function () { /* keep the static HTML content */ });
})();
