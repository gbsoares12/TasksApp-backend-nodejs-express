const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')

module.exports = (app) => {
    const signin = async (req, resp) => {
        if (!req.body.email || !req.body.password) {
            return resp.status(400).send('Dados incompletos!');
        }

        const user = await app.db('users')//Vai segurar a aplicação até que a func db seja completada
            .whereRaw("LOWER(email) = LOWER(?)", req.body.email)//where "crú"
            .first()

        if (user) {
            bcrypt.compare(req.body.password, user.password, (err, isMatch) => {//O isMatch é verdadeiro se a autenticação for verdadeira
                if (err || !isMatch) {
                    return resp.status(401).send();
                }

                const payload = { id: user.id }
                resp.json({
                    name: user.name,
                    email: user.email,
                    token: jwt.encode(payload, authSecret),
                })
            })
        } else {
            return resp.status(400).send('Usuário não encontrado!')
        }
    }

    return { signin }
}