const express = require('express');
const { PrismaClient } = require("../../prisma/generate/client");
const jwt = require("jsonwebtoken");
const app = require('../..');
const dotenv = require('dotenv').config();

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
    let response = {};

    try {
        const { token } = req.query;
        const vertify_token = jwt.verify(token, process.env.SECURITY_KEY);

        const user_id = vertify_token.data.id;

        const get_song = await prisma.users.findUnique({
            where: {
                id: user_id
            },
            select: {
                SongHistories: true
            }
        })

        if (get_song) {
            response = {
                s: 200,
                m: "find song success",
                d: {
                    get_song
                }
            }
        } else {
            response = {
                s: 404,
                m: "not found user"
            }
        }
    } catch (error) {
        console.log(error);
        response = {
            s: 400,
            m: "error",
            e: error
        }
    }

    res.send(response);
})

router.post("/update", async (req, res) => {
    let response = {}

    try {
        const { token } = req.query;
        const { name, time } = req.body;
        const vertify_token = jwt.verify(token, process.env.SECURITY_KEY);

        const user_id = vertify_token.data.id;

        const update_song = await prisma.songHistories.update({
            where: {
                user_id: user_id
            },
            data: {
                song_name: name,
                time: parseFloat(time)
            }
        });


        if (update_song) {
            response = {
                s: 200,
                m: "update success"
            }
        } else {
            response = {
                s: 400,
                m: "cannot update song"
            }
        }
    } catch (error) {
        console.log(error);
        response = {
            s: 400,
            m: "error",
            e: error
        }
    }

    res.json(response);
})

module.exports = router