/* Live site content from one Google Sheet.
   Columns:  key | name | image | role
     - name  : the text to show (person name, or a section heading / caption)
     - image : a public image URL or Google Drive share link (optional)
     - role  : the sub-line under a person's name (team cards only)
   Wiring in the HTML:
     - [data-team-key]    -> updates a person's name, role and photo
     - [data-content-key] -> updates a section's text from the "name" column
     - [data-content-img] -> updates an image's src from the "image" column
   The sheet must be shared "Anyone with the link: Viewer".
   If the sheet is unreachable, the page keeps whatever is already in the HTML. */
(function () {
  "use strict";

  var SHEET_ID = "1CvnUCtCJU8hGEZ4x9ynfgopJQZYL9r4ZbQl86hyg84s";
  var URL = "https://docs.google.com/spreadsheets/d/" + SHEET_ID +
            "/gviz/tq?tqx=out:json";

  function toImageUrl(u) {
    if (!u) return null;
    u = u.trim();
    var m = u.match(/\/d\/([-\w]{20,})/) || u.match(/[?&]id=([-\w]{20,})/);
    if (m) return "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w800";
    return u;
  }

  function setPhoto(container, url, alt) {
    if (!container) return;
    var img = container.querySelector("img");
    if (!img) { img = document.createElement("img"); container.appendChild(img); }
    img.src = toImageUrl(url);
    if (alt) img.alt = alt;
    container.classList.remove("logo-av");
  }

  function apply(map) {
    // Team cards: name + role + photo
    document.querySelectorAll("[data-team-key]").forEach(function (el) {
      var row = map[el.getAttribute("data-team-key")];
      if (!row) return;
      var card = el.closest(".op-person, .lc-card");
      if (row.name) el.textContent = row.name;
      if (row.role && card) {
        var roleEl = card.querySelector(".op-role, .role");
        if (roleEl) roleEl.textContent = row.role;
      }
      if (row.image && card) setPhoto(card.querySelector(".lc-avatar, .op-avatar"), row.image, row.name);
    });

    // Section text
    document.querySelectorAll("[data-content-key]").forEach(function (el) {
      var row = map[el.getAttribute("data-content-key")];
      if (row && row.name) el.textContent = row.name;
    });

    // Section images
    document.querySelectorAll("[data-content-img]").forEach(function (el) {
      var row = map[el.getAttribute("data-content-img")];
      if (row && row.image) el.src = toImageUrl(row.image);
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
        var name = c[1] && c[1].v != null ? String(c[1].v).trim() : null;
        if (name && name.charAt(0) === "[") name = null; // "[Image] ..." labels are notes, not text
        map[key] = {
          name:  name,
          image: c[2] && c[2].v != null ? String(c[2].v).trim() : null,
          role:  c[3] && c[3].v != null ? String(c[3].v).trim() : null
        };
      });
      apply(map);
    })
    .catch(function () { /* keep the static HTML content */ });
})();
