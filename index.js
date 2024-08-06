const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const fs = require("fs");

protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { standard: true, secure: true, supportFetchAPI: true },
  },
]);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true, // Start in fullscreen mode
    resizable: true, // Make the window resizable
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Reference to the preload script if any
      nodeIntegration: true,
      contextIsolation: false, // Set to false for access to Node.js in renderer process
    },
  });

  // Load your React app using the custom protocol
  mainWindow.loadURL("app://index.html");

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  protocol.handle("app", async (request) => {
    const url = new URL(request.url);
    const pathname = decodeURI(url.pathname); // Decode URL components

    let filePath = path.join(__dirname, "frontend", "build", pathname);
    if (url.pathname === "/" || !path.extname(filePath)) {
      filePath = path.join(__dirname, "frontend", "build", "index.html");
    }

    try {
      console.log(`Serving file: ${filePath}`); // Log the file being served
      const data = await fs.promises.readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();
      let mimeType = "text/html";

      if (extension === ".js") {
        mimeType = "application/javascript";
      } else if (extension === ".css") {
        mimeType = "text/css";
      } else if (extension === ".json") {
        mimeType = "application/json";
      } else if (extension === ".png") {
        mimeType = "image/png";
      } else if (extension === ".jpg" || extension === ".jpeg") {
        mimeType = "image/jpeg";
      } else if (extension === ".ico") {
        mimeType = "image/x-icon";
      }

      return new Response(data, { headers: { "content-type": mimeType } });
    } catch (error) {
      console.error(`Failed to read ${filePath} on custom protocol`, error);
      return { error: -2 }; // -2 = failed to load
    }
  });

  createWindow();
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  if (mainWindow === null) {
    createWindow();
  }
});
