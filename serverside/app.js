const path = require('path');
const config = require('./config');
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const routes = require('./src/router/index')
const connectDatabase = require('./src/db/db')
const errorMiddleWare = require('./src/middleware/error.middleware');
const ServerError = require('./src/interface/Error');
// connecting to database
connectDatabase();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: 'easyMoney API',
      version: '1.0.0',
      description: 'API for development'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ],
  },
  apis: ["./src/router/api/v1/*.js"]
}
const specs = swaggerJsDoc(options);

const app = express();
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs))
const port =  3001
// const corsOptions = {
//   origin: 'http://www.mercatoaffilliate.com',
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   preflightContinue: false,
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// }
app.use(cors())
app.use(express.json())

// security middleware
app.use(morgan('common'))

app.use('/images', express.static(path.join(__dirname, "./src/uploads")))

app.use(express.static(path.join(__dirname, '../clientside/build')))


// homepage
app.get('/', (req, res) => {
  res.send('hello world')
  console.log(req.ip === '127.0.0.1')
})

// api routes
app.use('/api/v1', routes)


app.use((req, res, next) => {
  // res.status(404).json({
  // message: 'page not found.'
  // })
  next(ServerError.badRequest(404, 'page not found'))
  // throw new Error('page not found')
})
app.use(errorMiddleWare);
//server listen
app.listen(port, () => console.log(`server running on: http://127.0.0.1:${port}`))

process.on('uncaughtException', err => {
  console.log(err)
})