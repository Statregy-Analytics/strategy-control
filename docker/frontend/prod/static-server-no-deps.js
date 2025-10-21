const http = require("http");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");

const root = process.env.STATIC_ROOT || "/usr/src/app";
const port = process.env.PORT || 8080;
const logDir = process.env.LOG_DIR || "/tmp/frontend-logs";

// Ensure log directory exists
try {
  fs.mkdirSync(logDir, { recursive: true });
  fs.mkdirSync(path.join(logDir, "assets"), { recursive: true });
  fs.mkdirSync(path.join(logDir, "analysis"), { recursive: true });
} catch (e) {
  console.log("[static] could not create log directories", e && e.message);
}

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(`[static] 404 ${filePath}`);
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime =
      ext === ".js"
        ? "application/javascript"
        : ext === ".css"
        ? "text/css"
        : "text/html";
    // If serving the index bundle, inject a small runtime debug log right before
    // the dynamic import for the TransctionPage chunk. This helps detect at
    // runtime whether the import() is being invoked in the browser.
    let out = data;
    try {
      const base = path.basename(filePath);
      if (ext === ".js" && base === "index-1neqJL8W.js") {
        let text = data.toString("utf8");
        const needle = 'import("./TransctionPage-AfgeY0mr.js")';
        if (text.indexOf(needle) !== -1) {
          // Replace with a visible console.error so it's easy to spot in DevTools
          // and also call the import after logging. We keep the original debug
          // but elevate to error for visibility.
          // Prefer using the injected wrapper if present (window.__routeLoadMonitor.wrapImport)
          // so that we get a clear console.error in all browsers. Fall back to
          // the native import() when the wrapper isn't available.
          const replacement =
            '(console.error("[DEBUG-ERROR] runtime: initiating dynamic import for TransctionPage"), console.debug("[DEBUG] runtime: initiating dynamic import for TransctionPage"), (typeof window!="undefined"&&window.__routeLoadMonitor&&typeof window.__routeLoadMonitor.wrapImport==="function")?window.__routeLoadMonitor.wrapImport(()=>import("./TransctionPage-AfgeY0mr.js")):import("./TransctionPage-AfgeY0mr.js"))';
          text = text.replace(needle, replacement);
          out = Buffer.from(text, "utf8");
          console.log(
            "[static] injected runtime debug into index bundle before dynamic import"
          );
        }
      }
      // If serving index.html, inject a small monitoring script into the <head>
      // so we can intercept route loader/import activity more robustly. This
      // avoids touching built assets on disk and provides a hook the browser
      // console will always show (console.error) when a lazy route is requested.
      if (ext === ".html" && path.basename(filePath) === "index.html") {
        let text = data.toString("utf8");
        const injectScript = `<!-- dev-inject-start -->
  <script>
    // Small runtime monitor injected by static-server-no-deps.js
    (function(){
      try{
        window.__routeLoadMonitor = { last: null, events: [] };
        function sendClientLog(type, payload){
          try{
            var body = typeof payload === 'string' ? payload : JSON.stringify(payload);
            var url = '/__client_log';
            if(navigator && typeof navigator.sendBeacon === 'function'){
              try{ navigator.sendBeacon(url, body); return; }catch(e){}
            }
            fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Client-Log-Type': type }, body: body }).catch(function(){});
          }catch(e){}
        }
        ['log','info','warn','error','debug'].forEach(function(k){
          var orig = console[k];
          console[k] = function(){
            try{ sendClientLog(k, { args: Array.prototype.slice.call(arguments) }); }catch(e){}
            try{ orig.apply(console, arguments); }catch(e){}
          };
        });
        window.addEventListener('error', function(ev){
          try{ sendClientLog('error', { message: ev.message, filename: ev.filename, lineno: ev.lineno, colno: ev.colno, error: ev.error && (ev.error.stack||String(ev.error)) }); }catch(e){}
        });
        window.addEventListener('unhandledrejection', function(ev){
          try{ sendClientLog('unhandledrejection', { reason: ev.reason && (ev.reason.stack || String(ev.reason)) }); }catch(e){}
        });
        function wrapImport(pOrThunk){
          try{ sendClientLog('import-request', { argType: typeof pOrThunk, arg: String(pOrThunk) }); }catch(e){}
          try{ window.__routeLoadMonitor.events.push({when:Date.now(), argType: typeof pOrThunk}); }catch(e){}
          var promise;
          try{ if(typeof pOrThunk === 'function') promise = pOrThunk(); else promise = import(pOrThunk); }catch(e){ promise = Promise.reject(e); }
          return promise.then(function(m){ try{ sendClientLog('import-ok', { arg: String(pOrThunk) }); }catch(e){}; return m; }).catch(function(err){ try{ sendClientLog('import-failed', { arg: String(pOrThunk), error: (err && err.stack) || String(err) }); }catch(e){}; throw err; });
        }
        window.__routeLoadMonitor.wrapImport = wrapImport;
        window.__routeLoadMonitor.log = function(){ try{ sendClientLog('log', { args: Array.prototype.slice.call(arguments) }); }catch(e){}; console.error.apply(console, arguments); }
      }catch(e){ try{ console.error('[INJECT-MONITOR] init failed', e && e.stack); }catch(ie){} }
    })();
  </script>
  <!-- dev-inject-end -->`;
        // Inject just before closing </head> if present, otherwise at top of body
        if (text.indexOf("</head>") !== -1) {
          text = text.replace("</head>", injectScript + "\n</head>");
          out = Buffer.from(text, "utf8");
          console.log("[static] injected route load monitor into index.html");
        } else if (text.indexOf("<body") !== -1) {
          // best-effort fallback
          text = injectScript + "\n" + text;
          out = Buffer.from(text, "utf8");
          console.log(
            "[static] injected route load monitor into index.html (body fallback)"
          );
        }
      }
      // If serving the TransctionPage chunk, prepend a visible error log so
      // that when the module is evaluated in the browser a clear message
      // appears in the Console. This is the most reliable way to detect
      // module evaluation without modifying files on disk.
      if (ext === ".js" && base === "TransctionPage-AfgeY0mr.js") {
        try {
          let text = data.toString("utf8");
          const prefix =
            'console.error("[INJECTED-CHUNK] TransctionPage module evaluating (injected)");\n';
          // Only inject once if not already present
          if (text.indexOf(prefix) === -1) {
            text = prefix + text;
            out = Buffer.from(text, "utf8");
            console.log(
              "[static] injected visible error at top of TransctionPage chunk"
            );
          }
        } catch (ie) {
          console.log("[static] chunk injection error", ie && ie.message);
        }
      }
    } catch (e) {
      console.log("[static] injection error", e && e.message);
    }

    res.writeHead(200, {
      "Content-Type": mime,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    console.log(`[static] 200 ${filePath} (${mime}) ${out.length} bytes`);
    // Save a copy of served assets for post-mortem analysis
    try {
      if (ext === ".js" || ext === ".css" || ext === "") {
        const dest = path.join(logDir, "assets", path.basename(filePath));
        fs.writeFile(dest, out, (werr) => {
          if (werr)
            console.log(
              "[static] failed to save served asset",
              dest,
              werr && werr.message
            );
        });
      }
    } catch (e) {
      console.log("[static] save asset error", e && e.message);
    }
    res.end(out);
  });
}

const server = http.createServer((req, res) => {
  // Accept client-side logs posted from the injected script
  if (req.method === "POST" && req.url === "/__client_log") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const now = new Date().toISOString();
      const outLine = `[${now}] ${
        req.headers["x-client-log-type"] || "log"
      } ${body}\n`;
      const dest = path.join(logDir, "client.log");
      fs.appendFile(dest, outLine, (err) => {
        if (err)
          console.log(
            "[static] failed to append client log",
            err && err.message
          );
      });
      res.writeHead(204);
      res.end();
    });
    return;
  }

  // Log incoming request (method, url and relevant headers)
  try {
    const relevant = {
      "if-modified-since": req.headers["if-modified-since"] || null,
      "if-none-match": req.headers["if-none-match"] || null,
      range: req.headers["range"] || null,
      pragma: req.headers["pragma"] || null,
    };
    console.log(
      `[static] REQ ${req.method} ${req.url} headers=${JSON.stringify(
        relevant
      )}`
    );
  } catch (e) {
    console.log("[static] REQ log error", e && e.message);
  }

  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(root, urlPath.replace(/^\//, ""));
  // Prevent path traversal
  if (!filePath.startsWith(root)) {
    console.log(`[static] 400 path traversal attempt ${req.url}`);
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad request");
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Attempt a best-effort fallback: the build sometimes references
      // chunk files by basename (root-relative). Try serving from /assets/<basename>.
      const alt = path.join(root, "assets", path.basename(filePath));
      try {
        fs.stat(alt, (err2, stat2) => {
          if (!err2 && stat2 && stat2.isFile()) {
            console.log(
              `[static] fallback: serving assets/${path.basename(
                filePath
              )} for ${filePath}`
            );
            return sendFile(alt, res);
          }
          return sendFile(path.join(root, "index.html"), res);
        });
      } catch (e) {
        return sendFile(path.join(root, "index.html"), res);
      }
      return;
    }
    sendFile(filePath, res);
  });
});

server.listen(port, () =>
  console.log(`Static server (no deps) listening on ${port}, root=${root}`)
);

// On SIGINT (Ctrl-C) attempt to analyze collected client logs and write a summary
process.on("SIGINT", () => {
  try {
    const clientLog = path.join(logDir, "client.log");
    const summaryPath = path.join(logDir, "summary.txt");
    const analysisDir = path.join(logDir, "analysis");
    const stackGroups = {};
    let summary = [];
    if (fs.existsSync(clientLog)) {
      const content = fs.readFileSync(clientLog, "utf8");
      const lines = content.split(/\n/).filter(Boolean);
      // Find stack frames inside lines
      const stackFrameRegex = /at .*\((.*):(\d+):(\d+)\)/g;
      const errors = lines.filter((l) =>
        /unhandledrejection|error|import-failed/.test(l)
      );
      errors.forEach((l) => {
        let m;
        // collect all file:line pairs
        while ((m = stackFrameRegex.exec(l)) !== null) {
          const file = path.basename(m[1]);
          const key = `${file}:${m[2]}`;
          stackGroups[key] = (stackGroups[key] || 0) + 1;
        }
      });
      summary.push(`Collected client log lines: ${lines.length}`);
      summary.push(`Error-related entries: ${errors.length}`);
      summary.push("Top stack locations:");
      Object.keys(stackGroups)
        .sort((a, b) => stackGroups[b] - stackGroups[a])
        .slice(0, 100)
        .forEach((k) => {
          summary.push(`${stackGroups[k]} x ${k}`);
        });
      // write stackGroups json
      try {
        fs.writeFileSync(
          path.join(analysisDir, "stack_groups.json"),
          JSON.stringify(stackGroups, null, 2)
        );
      } catch (e) {
        console.log("[static] failed writing stack_groups", e && e.message);
      }
    } else {
      summary.push("No client.log found");
    }
    // create a tarball of saved assets for offline analysis
    try {
      const assetsDir = path.join(logDir, "assets");
      const tarPath = path.join(analysisDir, "assets.tar.gz");
      if (fs.existsSync(assetsDir)) {
        // use system tar if available
        try {
          child_process.execSync(`tar -czf ${tarPath} -C ${assetsDir} .`);
          summary.push("Packaged assets to " + tarPath);
        } catch (e) {
          summary.push("Failed to tar assets: " + (e && e.message));
        }
      }
    } catch (e) {
      console.log("[static] tar assets failed", e && e.message);
    }

    fs.writeFileSync(summaryPath, summary.join("\n"));
    console.log("[static] wrote log summary to", summaryPath);
  } catch (e) {
    console.log("[static] error writing summary", e && e.message);
  }
  process.exit(0);
});
