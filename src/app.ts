import path from 'path'
import express from 'express'
import session from 'express-session'

const app = express()

app.set('port', process.env.PORT || 3000)

app.use(express.urlencoded({ extended: true }))
app.use('/', express.static(path.join(__dirname, '/public')))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  }
}))

export default app
