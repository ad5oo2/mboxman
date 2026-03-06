import express from 'express'
import { check, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

const sortable = ['name', 'active']

const modelValidators = [
  check('active').isInt({ min: 0, max: 1 }).withMessage('Incorrect value'),
  check('name')
    .exists()
    .withMessage('Domain name required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Maximum 100 symbols allowed')
    .isFQDN()
    .withMessage('Incorrect domain name')
]

router.get('/', async (req, res, next) => {
  try {
    const { sort_attr, sort_direction } = req.query
    let conditions = {}
    if (sortable.includes(sort_attr)) {
      conditions = {
        orderBy: [{ [sort_attr]: sort_direction == 'asc' ? 'asc' : 'desc' }]
      }
    }
    const domains = await prisma.virtual_domains.findMany(conditions)
    res.appResponse = {
      result: 200,
      data: domains
    }
  } catch (prismaError) {
    res.appResponse = {
      result: 503,
      data: 'Database error'
    }
  }

  next()
})

router.get('/:id', async (req, res, next) => {
  const domain = await prisma.virtual_domains.findUnique({
    where: { id: parseInt(req.params.id) }
  })

  if (!domain) {
    res.appResponse = {
      result: 422,
      data: 'Domain not found'
    }
    return next()
  }

  res.appResponse = { result: 200, data: domain }
  next()
})

router.post('/', modelValidators, async (req, res, next) => {
  const error = validationResult(req)
  if (!error.isEmpty()) {
    res.appResponse = { result: 422, data: error.array() }
    return next()
  }

  try {
    const check = await prisma.virtual_domains.findUnique({
      where: { name: req.body.name }
    })

    if (check) {
      res.appResponse = {
        result: 422,
        data: [{ msg: 'Domain exists', param: 'name' }]
      }
      return next()
    }

    const domain = await prisma.virtual_domains.create({
      data: {
        active: parseInt(req.body.active),
        name: req.body.name
      }
    })

    res.appResponse = { result: 200, data: domain }
  } catch (prismaError) {
    res.appResponse = {
      result: 503,
      data: 'Database error'
    }
  }
  next()
})

router.patch('/:id', modelValidators, async (req, res, next) => {
  const error = validationResult(req)
  if (!error.isEmpty()) {
    res.appResponse = { result: 422, data: error.array() }
    return next()
  }

  const domain = await prisma.virtual_domains.findUnique({
    where: { id: parseInt(req.params.id) }
  })

  if (!domain) {
    res.appResponse = {
      result: 422,
      data: 'Domain not found'
    }
    return next()
  }

  try {
    const isUnique = await prisma.virtual_domains.findFirst({
      where: {
        name: req.body.name,
        NOT: {
          id: { equals: domain.id }
        }
      }
    })

    if (isUnique !== null) {
      res.appResponse = {
        result: 422,
        data: [{ msg: 'Domain name already exists', param: 'name' }]
      }
      return next()
    }

    const updated = await prisma.virtual_domains.update({
      where: {
        id: domain.id
      },
      data: {
        active: parseInt(req.body.active),
        name: req.body.name
      }
    })

    res.appResponse = { result: 200, data: updated }
  } catch (prismaError) {
    res.appResponse = {
      result: 503,
      data: 'Database error'
    }
  }
  next()
})

router.delete('/:id', async (req, res, next) => {
  const domain = await prisma.virtual_domains.findUnique({
    where: { id: parseInt(req.params.id) }
  })

  if (!domain) {
    res.appResponse = {
      result: 422,
      data: 'Domain not found'
    }
    return next()
  }

  try {
    const users = await prisma.virtual_users.findMany({
      where: {
        domain_id: domain.id
      }
    })

    if (users.length > 0) {
      res.appResponse = {
        result: 422,
        data: `Domain have ${users.length} users, move to another domain or delete they first`
      }
      return next()
    }

    await prisma.virtual_domains.delete({
      where: {
        id: domain.id
      }
    })

    res.appResponse = {
      result: 200,
      data: 'Domain deleted'
    }
  } catch (prismaError) {
    res.appResponse = {
      result: 503,
      data: 'Database error'
    }
  }

  next()
})

export default router
