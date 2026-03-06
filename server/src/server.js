import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import output from './routes/middlewares/output.js'
import auth from './routes/middlewares/auth.js'
import dashboardRoute from './routes/dashboard.js'
import domainsRoute from './routes/domains.js'
import usersRoute from './routes/users.js'
import authRoute from './routes/auth.js'

dotenv.config()

const app = express()
const port = process.env.SERVER_PORT

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    credentials: true,
    origin: true
  })
)

app.use(auth)

app.use('/', dashboardRoute)
app.use('/auth', authRoute)
app.use('/domains', domainsRoute)
app.use('/users', usersRoute)

app.use(output)

app.use((_req, res) => {
  res.appResponse = { result: 'error', data: 'Resource not found' }
  res.status(404).send(res.appResponse)
})

app.listen(port, () => {
  console.log(`App started on ${port}`)
})
