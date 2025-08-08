require("dotenv").config({quiet: true});
const app = require("./src/app");
const connectToDB = require("./src/db/db");
const PORT = process.env.PORT || 3000;

connectToDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
