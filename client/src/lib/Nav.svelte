<script>
  import TiPower from 'svelte-icons/ti/TiPower.svelte'
  import TiUser from 'svelte-icons/ti/TiUser.svelte'
  import FaListUl from 'svelte-icons/fa/FaListUl.svelte'
  import { link, replace } from 'svelte-spa-router'
  import active from 'svelte-spa-router/active'
  import request from '../request'
  import { lastCode } from '../stores.js'

  let lastAnswer = 0

  lastCode.subscribe((value) => {
    lastAnswer = value
  })

  const logout = async () => {
    await request(`${import.meta.env.VITE_API_URL}/auth/logout`)
    replace('/login')
  }
</script>

<div class="navbar">
  <div class="top inner">
    <div class="navitem" use:active={{ path: '/users', className: 'active' }}>
      <a class="navlink" use:link href="/users"
        ><div class="imgb"><TiUser /></div>
        <div class="caption">Users</div></a
      >
    </div>

    <div class="navitem" use:active={{ path: '/domains', className: 'active' }}>
      <a class="navlink" use:link href="/domains"
        ><div class="imgb"><FaListUl /></div>
        <div class="caption">Domains</div></a
      >
    </div>
  </div>

  <div class="bottom inner">
    <div
      class="navitem"
      class:hidden={lastAnswer === 401 || lastAnswer === 0}
      on:click={logout}
    >
      <div class="imgb"><TiPower /></div>
      <div class="caption">Logout</div>
    </div>
  </div>
</div>

<style>
  .hidden {
    display: none !important;
  }
  .navbar {
    width: 100%;
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .navbar > .top {
    flex: 1;
  }
  .navbar > .bottom {
    flex: none;
  }
  .caption {
    font-size: 14px;
    color: white;
    text-align: center;
    padding: 5px;
  }
  .navlink {
    text-decoration: none;
  }
  .navitem {
    padding: 12px 0 12px 0;
  }
  .navitem:hover {
    background-color: rgba(162, 238, 238, 0.2);
    cursor: pointer;
  }
  .imgb {
    color: white;
    padding-left: 22px;
    width: 48px;
    height: 48px;
  }
  :global(.navitem.active) {
    background-color: rgba(162, 238, 238, 0.2);
  }
</style>
