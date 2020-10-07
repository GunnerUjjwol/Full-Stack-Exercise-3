require('dotenv').config()
const express = require('express')
const app = express()
const People = require('./models/person')
app.use(express.json())
const morgan = require('morgan')
app.use(morgan('tiny', {
    skip: function (req, res) { return req.method === 'POST' }
  }))
morgan.token('reqBody', function(req, res) {
    return JSON.stringify(req.body)
})

const logger = morgan(':method :url :status :res[content-length] - :response-time ms :reqBody')

const cors = require('cors')
const person = require('./models/person')
app.use(cors())

app.use(express.static('build'))


app.get('/api/info', (req, res, next) => {
    People.count({})
        .then (count => {
            const date = new Date();
            res.send(`<p>Phonebook has info for ${count} people</p>
            <p>${date}</p>` )
        })
        .catch(error => next(error))
})

app.get('/api/persons',(req, res) => {
    People.find({}).then(persons => {
        res.json(persons);
    })
})

app.get('/api/persons/:id',(req, res, next) => {
    People.findById(req.params.id)
        .then(person => {
            if(person) {
                res.json(person)
            } else {
                res.status(404).end();
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next)=> {
    People.findByIdAndRemove(req.params.id)
    .then(result => {
        res.status(204).end();
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    const personToUpdate = {
        name: body.name,
        number: body.number
    }

    People.findByIdAndUpdate(req.params.id, personToUpdate, {new: true, runValidators: true})
        .then(updatedPerson => {
            res.json(updatedPerson)
        })
        .catch(error => next(error));
})

app.post('/api/persons',logger, (req, res, next) => {
    const person = req.body;
    
    if(!person.name || !person.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }

    const personToSave = new People({
        name: person.name,
        number: person.number
    })
    personToSave.save().then(savedPerson => {
        res.json(savedPerson);
    })
    .catch(error => next(error))
    
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  // handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({error : error.message})
    } 
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})