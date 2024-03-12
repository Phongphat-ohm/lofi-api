const express = require("express");
const cors = require("cors");
const IndexRoute = require("./src/routes/index");
const UserRoute = require("./src/routes/user");
const dotenv = require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors({
    origin: "https://lofi-318fa.web.app/"
}))
app.use(express.static('public'))


app.use('/', IndexRoute);
app.use("/user", UserRoute)

app.listen(3000, () => {
    console.log("http://localhost:3000");
})

module.exports = app;