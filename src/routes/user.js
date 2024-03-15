const express = require('express');
const router = express.Router();
const { PrismaClient } = require("../../prisma/generate/client")
const dotenv = require("dotenv").config();
const { createHash } = require("crypto");
const jwt = require("jsonwebtoken");
const { appendFile } = require('fs');
const app = require('../..');
const { AsyncLocalStorage } = require('async_hooks');

const prisma = new PrismaClient()

router.post("/signin", async (req, res) => {
    let response = {};

    try {
        const body = req.body;
        const identify = body.identify;
        const password = body.password;
        const new_password = createHash('sha256').update(password).digest("hex").toString();

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
                        },
                        {
                            provider: "credential"
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
            const new_password = createHash("sha256").update(password).digest("hex").toString()

            const hash_email = createHash("sha256").update(email).digest("hex").toString();
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

router.post("/token/create", async (req, res) => {
    let response = {};

    try {
        const create_token = jwt.sign({
            data: {
                redirect: req.body.redirect
            }
        }, "331040", {
            expiresIn: "1h"
        })

        response = {
            s: 200,
            m: "create token success",
            d: {
                token: create_token
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

    res.json(response)
})

router.get("/token/vertify", async (req, res) => {
    let response = {};

    try {
        const token = req.headers.authorization.split(" ")[1];
        const vertify = jwt.verify(token, "331040");

        if (vertify.data) {
            response = {
                s: 200,
                m: "vertify success"
            }
        } else {
            response = {
                s: 400,
                m: "token vertify error"
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

    res.json(response)
})

router.post("/token/signin", async (req, res) => {
    let response = {};

    try {
        const token = req.headers.authorization.split(" ")[1];
        const vertify = jwt.verify(token, "331040");
        const identify = req.body.identify;
        const password = req.body.password
        const hash_password = createHash("sha256").update(password).digest("hex");

        if (vertify.data) {
            const find_user = await prisma.users.findFirst({
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
                            password: hash_password
                        },
                        {
                            provider: "credential"
                        }
                    ]
                },
                select: {
                    email: true,
                    username: true,
                    profile_url: true,
                    create_at: true,
                    provider: true,
                    SongHistories: true
                }
            })

            const create_access_token = jwt.sign({
                data: find_user
            }, "331040");

            if (find_user) {
                response = {
                    s: 200,
                    m: "sign success",
                    d: {
                        access_token: create_access_token
                    }
                }
            } else {
                response = {
                    s: 404,
                    m: "not found user"
                }
            }
        } else {
            response = {
                s: 400,
                m: "token vertify error"
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

    res.json(response)
})

router.get("/token", async (req, res) => {
    let response = {}

    try {
        const token = req.headers.authorization.split(" ")[1];
        const vertify_token = jwt.verify(token, "331040");

        if (vertify_token) {
            response = {
                s: 200,
                m: "vertify token success",
                d: vertify_token.data
            }
        } else {
            response = {
                s: 400,
                m: "access token vertify error"
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

router.post("/token/signup", async (req, res) => {
    let response = {};

    try {
        const token = req.headers.authorization.split(" ")[1];
        const vertify = jwt.verify(token, "331040");
        const { email, username, password } = req.body;
        const hash_password = createHash("sha256").update(password).digest("hex");

        if (vertify.data) {
            const new_password = createHash("sha256").update(password).digest("hex").toString()

            const hash_email = createHash("sha256").update(email).digest("hex").toString();
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
        } else {
            response = {
                s: 400,
                m: "vertify token error"
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

    res.json(response)
})

module.exports = router