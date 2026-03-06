const exclude = (models, ...keys) => {
  if (Array.isArray(models)) {
    for (let i = 0; i < models.length; i++) {
      for (let key of keys) {
        delete models[i][key]
      }
    }
  } else {
    for (let key of keys) {
      delete models[key]
    }
  }
  return models
}

export default exclude
