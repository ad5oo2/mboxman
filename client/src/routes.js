import Login from './routes/Login.svelte'
import Dashboard from './routes/Dashboard.svelte'
import Domains from './routes/Domains.svelte'
import Domain from './routes/Domain.svelte'
import Users from './routes/Users.svelte'
import User from './routes/User.svelte'
import NotFound from './routes/NotFound.svelte'

const routes = {
  '/login': Login,
  '/': Dashboard,
  '/domains/': Domains,
  '/domain/:id': Domain,
  '/users': Users,
  '/user/:id': User,
  '*': NotFound
}

export { routes }
