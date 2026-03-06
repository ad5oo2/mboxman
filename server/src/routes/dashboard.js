import express from 'express'
// import { PrismaClient } from '@prisma/client'

const router = express.Router()
// const prisma = new PrismaClient()

router.get('/', async (req, res, next) => {
  const response = {
    'get /': 'this dashboard',
    'get /domains': 'list domains',
    'get /domains/:id': 'view domain',
    'post /domains': 'create new domain',
    'patch /domains/:id': 'update domain',
    'delete /domains/:id': 'delete domain',
    'get /users': 'list users',
    'get /users/:id': 'view user',
    'post /users': 'create new user',
    'patch /users/:id': 'update user',
    'delete /users/:id': 'delete user'
  }
  res.appResponse = {
    result: 200,
    data: response
  }
  next()
})

export default router
