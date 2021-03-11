/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
let express = require("express");
let cors = require("cors");
let auth = require("express-openid-connect");

const production = process.env.NODE_ENV === "production";

const authConfig = {
	authRequired: false,
	auth0Logout: true,
	secret: process.env.secret,
	baseURL: process.env.baseURL,
	clientID: process.env.clientID,
	issuerBaseURL: process.env.issuerBaseURL
};

let app = express();

app.use(cors());

if (production) {
	app.use(auth.auth(authConfig));
	app.use(express.static("public"), auth.requiresAuth());
} else {
	app.use(express.static("public"));
}

app.listen(5000, () => {
	console.log("Budget-UI started on port 5000.");
});