const express = require('express');
const app = express();
const db = require('./config/db')
const consign = require('consign')

consign()//Propaga o app para todos os outros modulos, assim podendo utilizar o knex.
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)


app.db = db
    
app.get('/', (req, res) => {
    res.status(200).send('Meu backend em express!');
})

app.listen(3000, () => {
    console.log('Backend executando...');
})