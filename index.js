const express = require("express");
const knex = require("knex");
const knexConfig = require("./knexfile").development;

const db = knex(knexConfig);

const server = express()

server.post("/api/register", (req,res) => {

})

server.post("/api/login", (req,res) => {
  
})

server.post("/api/users", (req,res) => {
  
})

const port = process.env.PORT || 5000;

server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
