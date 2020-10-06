const express = require('express')
const app = express()
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
app.use(cors())

let persons =
[
    {
        id: 1,
        name: "Arto Hellas",
        number: "0040-123456"
    },{
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523"
    },{
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },{
        id: 4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }      
];

app.get('/api/info', (req, res) => {
    const date = new Date();
    res.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${date}</p>` )
  })

app.get('/api/persons',(req, res) => {
    res.json(persons);
})

app.get('/api/persons/:id',(req, res) => {
    const id = +req.params.id;
    const person = persons.find(person => person.id === id)
    if (person) {
        res.json(person);
    }else {
        res.status(404).end();
    }
})

app.delete('/api/persons/:id', (req, res)=> {
    const id = +req.params.id;
    persons = persons.filter(person => person.id !== id)
    res.status(204).end();
})

app.post('/api/persons',logger, (req, res) => {
    const person = req.body;
    
    if(!person.name || !person.number) {
        return res.status(400).json({
            error: 'name or number missing'
        })
    }
    if(persons.map(person => person.name.toLowerCase()).includes(person.name.toLowerCase())) {
        
        return res.status(400).json({
            error: 'name must be unique'
        })
    }
    person.id = Math.floor(Math.random()*10000);
    persons.concat(person);
    res.json(person);
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})