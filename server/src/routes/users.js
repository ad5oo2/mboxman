import express from 'express'
import { check, validationResult } from 'express-validator'
import { PrismaClient } from '@prisma/client'
import genPassword from '../helpers/genpassword.js'
import exclude from '../helpers/exlude.js'
import validator from 'validator'

const router = express.Router()
const prisma = new PrismaClient().$extends({
  result: {
    virtual_users: {
      quota_used: {
        needs: { bytes: true, quota: true },
        compute(virtual_users) {
          return parseFloat(
            (virtual_users.bytes * BigInt(100)) /
              BigInt(virtual_users.quota * 1024 * 1024)
          )
        }
      }
    }
  }
})

const sortable = ['email', 'name', 'quota', 'active', 'last_login']
const computed_sortable = ['quota_used']

const modelValidators = [
  check('domain_id')
    .exists()
    .withMessage('Domain required')
    .isInt()
    .withMessage('Incorrect value'),
  check('local_part')
    .exists()
    .withMessage('Username required')
    .trim()
    .isLength({ max: 99 })
    .withMessage('Maximum 99 symbols allowed')
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9_\-+.]+$/)
    .withMessage('a-Z0-9_-+. allowed, must not starts with symbols'),
  check('name')
    .exists()
    .notEmpty()
    .withMessage('Name required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Max 100 symbols allowed'),
  check('quota').isInt({ min: 0 }).withMessage('Incorrect value'),
  check('active').isInt({ min: 0, max: 1 }).withMessage('Incorrect value')
]

const passwordValidator = [
  check('password')
    .exists()
    .withMessage('Password required')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      pointsPerRepeat: 1
    })
    .withMessage(
      'Strong password required(8 upper-lower letters with digits and special symbols. Use suggested or make your own really strong password'
    )
]

router.get('/', async (req, res, next) => {
  try {
    const { sort_attr, sort_direction, search, page, per_page } = req.query

    let conditions = {}
    if (!computed_sortable.includes(sort_attr)) {
      conditions = {
        skip:
          parseInt(page) === 1 ? 0 : (parseInt(page) - 1) * parseInt(per_page),
        take: parseInt(per_page) + 1
      }
    }

    if (sortable.includes(sort_attr)) {
      conditions = {
        ...conditions,
        orderBy: [{ [sort_attr]: sort_direction == 'asc' ? 'asc' : 'desc' }]
      }
    }
    if (search) {
      conditions = {
        ...conditions,
        where: {
          OR: [{ email: { contains: search } }, { name: { contains: search } }]
        }
      }
    }
    let users = await prisma.virtual_users.findMany(conditions)
    users = exclude(users, 'password')

    if (computed_sortable.includes(sort_attr)) {
      users.sort((a, b) =>
        sort_direction == 'asc'
          ? a.quota_used - b.quota_used
          : b.quota_used - a.quota_used
      )

      if (parseInt(page) === 1) {
        users.splice(parseInt(per_page) + 1, users.length)
      } else {
        users.splice(0, (parseInt(page) - 1) * parseInt(per_page))
        users.splice(parseInt(per_page) + 1, users.length)
      }
    }

    res.appResponse = {
      result: 200,
      data: users
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
  let user = await prisma.virtual_users.findUnique({
    where: {
      id: parseInt(req.params.id)
    },
    include: {
      virtual_domains: true
    }
  })

  if (!user) {
    res.appResponse = {
      result: 422,
      data: 'User not found'
    }
    return next()
  }

  user.local_part = user.email.split('@')[0]

  user = exclude(user, 'password', 'email')

  res.appResponse = { result: 200, data: user }
  next()
})

router.post(
  '/',
  [modelValidators, passwordValidator],
  async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
      res.appResponse = { result: 422, data: error.array() }
      return next()
    }

    try {
      const domain = await prisma.virtual_domains.findUnique({
        where: {
          id: parseInt(req.body.domain_id)
        }
      })

      if (domain === null) {
        res.appResponse = {
          result: 422,
          data: [{ msg: 'Domain does not exists', param: 'domain_id' }]
        }
        return next()
      }

      const email = req.body.local_part + '@' + domain.name

      const isUnique = await prisma.virtual_users.findUnique({
        where: {
          email: email
        }
      })

      if (isUnique) {
        res.appResponse = {
          result: 422,
          data: [
            { msg: 'Email already exists in this domain', param: 'local_part' }
          ]
        }
        return next()
      }

      let user = await prisma.virtual_users.create({
        data: {
          domain_id: parseInt(req.body.domain_id),
          email: email,
          name: req.body.name,
          quota: parseInt(req.body.quota),
          active: parseInt(req.body.active),
          password: genPassword(req.body.password),
          created_time: Math.floor(Date.now() / 1000)
        }
      })

      user = exclude(user, 'password', 'email')
      user.local_part = req.body.local_part
      user.virtual_domains = domain

      res.appResponse = { result: 200, data: user }
    } catch (prismaError) {
      res.appResponse = {
        result: 503,
        data: 'Database error'
      }
    }

    next()
  }
)

router.patch('/:id', modelValidators, async (req, res, next) => {
  const error = validationResult(req)
  if (!error.isEmpty()) {
    res.appResponse = { result: 422, data: error.array() }
    return next()
  }

  try {
    const user = await prisma.virtual_users.findUnique({
      where: {
        id: parseInt(req.params.id)
      }
    })

    if (!user) {
      res.appResponse = {
        result: 422,
        data: 'User not found'
      }
      return next()
    }

    const domain = await prisma.virtual_domains.findUnique({
      where: {
        id: parseInt(req.body.domain_id)
      }
    })

    if (domain === null) {
      res.appResponse = {
        result: 422,
        data: [{ msg: 'Domain does not exists', param: 'domain_id' }]
      }
      return next()
    }

    const email = req.body.local_part + '@' + domain.name

    const isUnique = await prisma.virtual_users.findFirst({
      where: {
        email: email,
        NOT: {
          id: { equals: user.id }
        }
      }
    })

    if (isUnique !== null) {
      res.appResponse = {
        result: 422,
        data: [
          { msg: 'Email already exists in this domain', param: 'local_part' }
        ]
      }
      return next()
    }

    if (
      req.body.password &&
      validator.isStrongPassword(req.body.password) === false
    ) {
      res.appResponse = {
        result: 422,
        data: [
          {
            msg: 'Strong password required(8 upper-lower letters with digits and special symbols. Use suggested or make your own really strong password',
            param: 'password'
          }
        ]
      }
      return next()
    }

    const updated_data = {
      domain_id: parseInt(req.body.domain_id),
      email: email,
      name: req.body.name,
      quota: parseInt(req.body.quota),
      active: parseInt(req.body.active),
      password: req.body.password
        ? genPassword(req.body.password)
        : user.password
    }

    if (req.body.reset_inactivity && req.body.reset_inactivity == 'on') {
      updated_data.last_login = Math.floor(Date.now() / 1000)
    }

    let updated = await prisma.virtual_users.update({
      where: {
        id: user.id
      },
      data: updated_data
    })

    updated = exclude(updated, 'password', 'email')
    updated.local_part = req.body.local_part
    updated.virtual_domains = domain

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
  const user = await prisma.virtual_users.findUnique({
    where: {
      id: parseInt(req.params.id)
    }
  })

  if (!user) {
    res.appResponse = {
      result: 422,
      data: 'User not found'
    }
    return next()
  }

  try {
    await prisma.virtual_users.delete({
      where: {
        id: user.id
      }
    })

    res.appResponse = {
      result: 200,
      data: 'User deleted'
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
