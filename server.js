/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
let express = require("express");
let cors = require("cors");
let app = express();

app.use(cors);
app.use(express.static("public"));

app.listen(5000, () => {
	console.log("Budget-UI started on port 5000.");
});