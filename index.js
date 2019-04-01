const express = require("express");
const knex = require("knex");
const bcryptjs = require("bcryptjs");
const session = require("express-session");
const knexConfig = require("./knexfile").development;

const db = knex(knexConfig);

const server = express();

const sessionConfig = {
  name: "name",
  secret: "secret",
  cookies: {
    maxAge: 1000 * 60 * 15, // ms
    secure: false //used over https only
  },
  httpOnly: true, //can the user access the cookie from js
  resave: false,
  saveOninitialized: false // GDPR laws against setting cookies automatically
};

server.use(express.json());
server.use(session(sessionConfig));

server.post("/api/register", (req, res) => {
  let { username, password } = req.body;
  password = bcryptjs.hashSync(password, 10);
  if (username && password) {
    db("users")
      .insert({ username, password })
      .then(id => {
        res.status(201).json({ message: "Successfully made an account" });
      })
      .catch(error => {
        res.status(409).json({ message: "Username already taken", error });
      });
  } else {
    res.status(400).json({ message: "Username and password required" });
  }
});

server.post("/api/login", async (req, res) => {
  let { username, password } = req.body;
  if ((username, password)) {
    try {
      const user = await db("users")
        .where({ username })
        .first();
      if (user && bcryptjs.compareSync(password, user.password)) {
        req.session.username = user.username;
        res.status(200).json({ message: "LOGGED IN" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  } else {
    res.status(400).json({ message: "Username and password required" });
  }
});

function restricted(req, res, next) {
  if (req.session && req.session.username) {
    next();
  } else {
    res.status(401).json({ message: "You shall not pass!" });
  }
}

server.get("/api/users", restricted, (req, res) => {
  db("users")
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json({ message: "Server error", error });
    });
});

server.get("/api/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(error => {
      if (error) {
        res.json({ error });
      } else {
        res.status(200).json({ message: "Successfull logout" });
      }
    });
  } else {
    res.end();
  }
});

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
