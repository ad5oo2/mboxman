import { sha512crypt } from 'sha512crypt-node'

const chars = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const genSalt = () => {
  let result = ''
  for (var i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const genPassword = (plain) => {
  return sha512crypt(plain, genSalt())
}

export default genPassword
