const auth = (req, res, next) => {
  const openPaths = process.env.UNAUTH_PATHS.split(';')

  if (openPaths.includes(req.path)) return next()

  const token = req.cookies?.token

  if (token == process.env.TOKEN) return next()

  res.status(401)
  res.end()
}

export default auth
