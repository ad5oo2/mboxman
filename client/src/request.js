import { replace } from 'svelte-spa-router'
import { lastCode } from './stores.js'

const request = async (url, data = {}) => {
  if (!data.headers) data.headers = {}
  data.credentials = 'include'

  data.headers = {
    ...data.headers,
    api: 1
  }

  const result = await fetch(url, data)
  lastCode.set(result.status)
  if (result.status == 401) {
    replace('/login')
  }
  return result
}

export default request
