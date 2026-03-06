import * as dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'

dotenv.config()
const prisma = new PrismaClient()

const exporter_file = process.env.EXPORTER_FILE
//const exporter_file = '/home/ad/projects/mboxman/test.prom'

const day = 86400
const current_timestamp = Math.floor(Date.now() / 1000)

const mode = process.argv[2] ? process.argv[2] : 'exporter'

switch (mode) {
  case 'exporter':
    try {
      if (fs.existsSync(exporter_file)) fs.unlinkSync(exporter_file)
    } catch (err) {
      console.error(err)
    }
    await exporter()
    break
  case 'remover':
    await remover()
    break
  default:
    break
}

function write(content) {
  try {
    fs.appendFileSync(exporter_file, content, { flag: 'a+' })
  } catch (err) {
    console.error(err)
  }
}

async function exporter() {
  try {
    const never_logged = await prisma.virtual_users.findMany({
      where: {
        created_time: {
          lt: current_timestamp - day * process.env.NEVER_LOGIN_WARN
        },
        last_login: 0
      }
    })

    let data

    if (never_logged.length > 0) {
      data = `# HELP mail_never_logged User created but not logged in ${process.env.NEVER_LOGIN_WARN} days
# TYPE mail_never_logged gauge
`
      for (const user of never_logged) {
        data += `mail_never_logged{email="${user.email}"} 1`
        data += '\n'
      }
      write(data)
    }

    const age_logged = await prisma.virtual_users.findMany({
      where: {
        AND: [
          {
            last_login: {
              lt: current_timestamp - day * process.env.LAST_LOGIN_WARN
            }
          },
          {
            last_login: {
              not: 0
            }
          }
        ]
      }
    })

    if (age_logged.length > 0) {
      data = `# HELP mail_age_logged User not logged in ${process.env.LAST_LOGIN_WARN} days
# TYPE mail_age_logged gauge
`
      for (const user of age_logged) {
        data += `mail_age_logged{email="${user.email}"} 1`
        data += '\n'
      }
      write(data)
    }

    const usage = await prisma.virtual_users.findMany()

    if (usage.length > 0) {
      data = `# HELP mail_quota_usage Quota used precent
# TYPE mail_quota_usage gauge
`
      for (const item of usage) {
        const diskUsed = (Number(item.bytes) / 1024 / 1024).toFixed(2)
        const quotaUsed = ((diskUsed / item.quota) * 100).toFixed(2)
        //data += `mail_quota_usage{email="${item.email}", quota="${item.quota}", used="${diskUsed}"} ${quotaUsed}`
        data += `mail_quota_usage{email="${item.email}"} ${quotaUsed}`
        data += '\n'
      }
      write(data)
    }
  } catch (prismaError) {
    console.error(prismaError)
  }
}

async function remover() {
  try {
    await prisma.virtual_users.deleteMany({
      where: {
        created_time: {
          lt: current_timestamp - day * process.env.NEVER_LOGIN_REMOVE
        },
        last_login: 0
      }
    })

    await prisma.virtual_users.deleteMany({
      where: {
        AND: [
          {
            last_login: {
              lt: current_timestamp - day * process.env.LAST_LOGIN_REMOVE
            }
          },
          {
            last_login: {
              not: 0
            }
          }
        ]
      }
    })
  } catch (prismaError) {
    console.error(prismaError)
  }
}
