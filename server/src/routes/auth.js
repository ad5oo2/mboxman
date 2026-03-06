import express from 'express'
// import { PrismaClient } from '@prisma/client'

const router = express.Router()
// const prisma = new PrismaClient()

router.post('/login', (req, res, next) => {
  const { token } = req.body
  if (token != process.env.TOKEN) {
    res.appResponse = {
      result: 401,
      data: [{ msg: 'Invalid token', param: 'token' }]
    }
  } else {
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 60 * 1000 * 60 * 24 * 365
    })
    res.appResponse = {
      result: 200,
      data: 'logged in'
    }
  }

  next()
})

router.get('/logout', (req, res, next) => {
  res.cookie('token', '', { maxAge: 0 })
  res.appResponse = {
    result: 200,
    data: 'logged out'
  }
  next()
})

export default router
