const express = require("express");
const path = require("path");
const app = express();
const root = process.env.STATIC_ROOT || "/usr/src/app";

// Force no-cache for all responses
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

app.use(
  express.static(root, {
    index: "index.html",
    extensions: ["html"],
  })
);

app.get("*", (req, res) => {
  res.sendFile(path.join(root, "index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`Static server listening on port ${port}, root=${root}`)
);
