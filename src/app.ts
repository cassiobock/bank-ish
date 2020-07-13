import path from 'path'
import express from 'express'
import session from 'express-session'

import * as nubank from './connector/nubank/index'

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

app.post('/login', async (req, res, next) => {
  const { username, password } = req.body

  try {
    const bankInfoId = await nubank.login(
      req.session.id,
      username,
      password
    )

    req.session.bankInfoId = bankInfoId

    return res.redirect('/validation.html')
  } catch (e) {
    return next(e)
  }
})

export default app
