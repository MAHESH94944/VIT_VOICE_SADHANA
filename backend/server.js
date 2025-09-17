require("dotenv").config({ quiet: true });

const PORT = process.env.PORT || 3000;

// Log unhandled errors to help diagnose deploy crashes
process.on("uncaughtException", (err) => {
  console.error(
    "Uncaught Exception (caught):",
    err && err.stack ? err.stack : err
  );
});

process.on("unhandledRejection", (reason) => {
  console.error(
    "Unhandled Rejection (caught):",
    reason && reason.stack ? reason.stack : reason
  );
});

// Diagnostic: try requiring router/middleware modules individually to identify which file throws
const diagnosticModules = [
  "./src/routes/auth",
  "./src/routes/counsilli",
  "./src/routes/counsellor",
  "./src/middleware/authMiddleware",
  "./src/controllers/authController",
  "./src/controllers/counsilliController",
  "./src/controllers/counsellorController",
];

for (const mod of diagnosticModules) {
  try {
    // clear from cache first to get fresh require stack
    delete require.cache[require.resolve(mod)];
    require(mod);
    console.log(`Diagnostic: require ok -> ${mod}`);
  } catch (e) {
    console.error(`Diagnostic: require FAILED -> ${mod}`);
    console.error(e && e.stack ? e.stack : e);
    // do not exit — continue checking remaining modules
  }
}

(async () => {
  try {
    // require app and db inside try/catch to capture load-time errors
    let app;
    let connectToDB;
    try {
      app = require("./src/app");
      connectToDB = require("./src/db/db");
    } catch (loadErr) {
      console.error(
        "Error while requiring app or dependencies. This usually means a module threw during load (e.g. invalid route pattern)."
      );
      console.error(
        "Require-time error stack:",
        loadErr && loadErr.stack ? loadErr.stack : loadErr
      );
      console.error(
        "Hint: look at the 'Diagnostic: require FAILED' logs above to find the exact module."
      );
      // helpful hint
      console.error(
        "Search routers for invalid route strings (empty param names like '/:/' or full URLs used as mount paths)."
      );
      // rethrow to be handled by outer catch
      throw loadErr;
    }

    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error(
      "Failed to start server:",
      err && err.stack ? err.stack : err
    );
    // exit so nodemon can restart — preserves logs
    process.exit(1);
  }
})();
