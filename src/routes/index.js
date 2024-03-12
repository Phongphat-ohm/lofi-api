const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.send({
        status: 200,
        message: "server check success"
    })
})

module.exports = router