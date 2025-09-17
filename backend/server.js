require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/db/db");
const PORT = process.env.PORT || 3000;

(async function start() {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error(
      "Failed to start server:",
      err && err.stack ? err.stack : err
    );
    process.exit(1);
  }
})();
