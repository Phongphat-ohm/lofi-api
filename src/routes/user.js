const express = require('express');
const router = express.Router();
const { PrismaClient } = require("../../prisma/generate/client")
const dotenv = require("dotenv").config();
const { createHash } = require("crypto");
const jwt = require("jsonwebtoken");
const { appendFile } = require('fs');

const prisma = new PrismaClient()

router.post("/signin", async (req, res) => {
    let response = {};

    try {
        const body = req.body;
        const identify = body.identify;
        const password = body.password;
        const new_password = createHash('sha256', password).digest("hex").toString();

        if (!identify) {
            response = {
                s: 404,
                m: "plese type your username or email"
            }
        } else if (!password) {
            response = {
                s: 404,
                m: "plese type your password"
            }
        } else {

            const check_user = await prisma.users.findFirst({
                where: {
                    AND: [
                        {
                            OR: [
                                {
                                    username: identify
                                },
                                {
                                    email: identify
                                }
                            ]
                        },
                        {
                            password: new_password
                        }
                    ]
                }
            });


            if (check_user) {
                const create_token = jwt.sign({
                    data: {
                        id: check_user.id
                    }
                }, process.env.SECURITY_KEY);

                response = {
                    s: 200,
                    m: "login success",
                    d: {
                        token: create_token
                    }
                }
            } else {
                response = {
                    s: 404,
                    m: "not found user"
                }
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

router.post("/signup", async (req, res) => {
    let response = {};

    try {
        const { email, username, password } = req.body;

        if (!email) {
            response = {
                s: 404,
                m: "please type your email"
            }
        } else if (!username) {
            response = {
                s: 404,
                m: "please type your username"
            }
        } else if (!password) {
            response = {
                s: 404,
                m: "please type your password"
            }
        } else {
            const new_password = createHash("sha256", password).digest("hex").toString()

            const hash_email = createHash("sha256", email).digest("hex").toString();
            const image_url = "https://gravatar.com/avatar/" + hash_email

            const create_user = await prisma.users.create({
                data: {
                    email,
                    username,
                    password: new_password,
                    profile_url: image_url
                }
            })

            if (create_user) {
                const creat_song_history = await prisma.songHistories.create({
                    data: {
                        user_id: create_user.id
                    }
                })

                response = {
                    s: 200,
                    m: "create user success"
                }
            } else {
                response = {
                    s: 400,
                    m: "can not create user"
                }
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

router.get("/@me", async (req, res) => {
    let response = {};

    try {
        const { token } = req.query;

        const vertify_token = jwt.verify(token, process.env.SECURITY_KEY);
        const user_id = vertify_token.data.id;

        const get_user = await prisma.users.findUnique({
            where: {
                id: user_id
            },
            select: {
                email: true,
                username: true,
                profile_url: true,
                SongHistories: true
            }
        })

        if (get_user) {
            response = {
                s: 200,
                m: "find user",
                d: {
                    get_user
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

    res.json(response);
})

module.exports = router