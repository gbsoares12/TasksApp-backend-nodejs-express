const moment = require('moment')

module.exports = (app) => {
    const getTasks = (req, resp) => {
        const date = req.query.date ? req.query.date : moment().endOf('day').toDate()

        app.db('tasks')
            .where({ userId: req.user.id })//O passport coloca o user dentro da req por isso contêm o acesso, apartir do token.
            .where('estimateAt', '<=', date)//Montando uma query where, porém já com a validação do userId
            .orderBy('estimateAt')
            .then(tasks => resp.json(tasks))
            .catch(err => resp.status(500).json(err))
    }

    const save = (req, resp) => {
        if (!req.body.desc.trim()) {
            return resp.status(400).send('Descrição é um campo obrigatório!')
        }

        req.body.userId = req.user.id

        app.db('tasks')
            .insert(req.body)
            .then(_ => resp.status(204).send())
            .catch(err => resp.status(400).json(err))
    }

    const remove = (req, resp) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .del()
            .then(rowsDeleted => {
                if (rowsDeleted > 0) {
                    resp.status(204).send()
                } else {
                    const msg = `Não foi encontrada task com o id: ${req.params.id}.`
                    resp.status(400).send(msg)
                }
            })
            .catch(err => resp.status(400).json(err))
    }

    const updateTaskDoneAt = (req, resp, doneAt) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .update({ doneAt })
            .then(_ => resp.status(204).send())
            .catch(err => resp.status(400).json(err))
    }

    const toggleTask = (req, resp) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .first()
            .then(task => {
                if (!task) {
                    const msg = `Task com id: ${req.params.id} não foi encontrada!`
                    return resp.status(400).send(msg)
                }

                const doneAt = task.doneAt ? null : new Date()

                updateTaskDoneAt(req, resp, doneAt)
            })
            .catch(err => resp.status(400).json(err))
    }

    return { getTasks, save, remove, toggleTask }
}