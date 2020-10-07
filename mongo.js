const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
  } 

  const password= process.argv[2]
  const database = 'thephonebook'
  
  const url = `mongodb+srv://fullstack-course:${password}@cluster0.e8nyj.mongodb.net/${database}?retryWrites=true&w=majority`

  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})

  const peopleSchema = new mongoose.Schema({
      name: String,
      number: String
  })

  const People = mongoose.model('People', peopleSchema)

  if(process.argv.length === 5 ){
    const people = new People({
        name: process.argv[3],
        number: process.argv[4]
    })
  
    people.save().then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook`)
        mongoose.connection.close()
    })
  } else if (process.argv.length === 3) {
      People.find({}).then(result => {
          console.log('phonebook:')
          result.forEach(people => console.log(`${people.name} ${people.number}`))
          mongoose.connection.close()
      })
  }

