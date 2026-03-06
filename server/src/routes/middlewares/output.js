BigInt.prototype.toJSON = function () {
  return this.toString()
}

const output = (req, res, next) => {
  if (res.appResponse) {
    res.status(res.appResponse.result).json(res.appResponse.data)
    res.end()
  } else {
    next()
  }
}

export default output
