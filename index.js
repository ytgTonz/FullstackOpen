require('dotenv').config()
const express = require('express')
const Note = require('./models/note')

const app = express()

let notes = []

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger) //request body is undefined!

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// GET all notes route
app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

// GET specific note route <id>
app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id).then((note) => {
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

// POST Create a new note route
app.post('/api/notes', (request, response, next) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })
  note.save().then((savedNote) => {
    response.json(savedNote)
  })
  .catch(error => next(error))
})

// PUT update a specfic note <id>
app.put('/api/notes/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findById(request.params.id)
   .then(note => {
      if (!note) {
        return response.status(404).end()
      }

      note.content = content
      note.important = important

      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
    })
    .catch(error => next(error))
})

// DELETE specific note <id>
app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id

 Note.findByIdAndDelete(id)
 .then(result => {
  response.status(204).end()
 })
  .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
//handler of requests with unknown endpoints
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(404).send({ error : "Malformed Id" })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error:error.message })
  }
  next(error)
}
// hand;er of requests with result to errors
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})