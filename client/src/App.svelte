<script>
  import Router from 'svelte-spa-router'
  import { routes } from './routes.js'
  import Nav from './lib/Nav.svelte'
</script>

<div class="app">
  <div class="nav-container">
    <Nav />
  </div>
  <div class="content-wrapper">
    <div class="content-container">
      <Router {routes} />
    </div>
  </div>
</div>

<style>
  .app {
    display: flex;
  }
  .app > .nav-container {
    flex-shrink: 0;
    width: 92px;
    min-height: 100vh;
    background-color: rgba(8, 114, 114, 0.909);
  }
  .app > .content-wrapper {
    width: 100%;
    background-color: aliceblue;
  }
  .app > .content-wrapper > .content-container {
    max-width: 1200px;
    padding: 1rem;
  }
</style>
