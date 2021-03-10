/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line no-undef
let express = require("express");
let app = express();

app.use(express.static("public"));

app.listen(5000, () => {
	console.log("Budget-UI started on port 5000.");
});