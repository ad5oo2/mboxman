<script>
  import { replace } from 'svelte-spa-router'
  import request from '../request'
  import MdAddCircleOutline from 'svelte-icons/md/MdAddCircleOutline.svelte'
  import MdSearch from 'svelte-icons/md/MdSearch.svelte'
  import MdNavigateNext from 'svelte-icons/md/MdNavigateNext.svelte'
  import MdNavigateBefore from 'svelte-icons/md/MdNavigateBefore.svelte'
  import SortIcon from '../lib/SortIcon.svelte'
  import { onMount } from 'svelte'

  let items = []
  let haveNext = false
  let fetchError = false
  let request_done = false
  let sort_attr = 'email'
  let sort_direction = 'asc'
  let search_value = ''
  let page = 1
  let local_per_page = localStorage.getItem('per_page')
  let per_page = local_per_page
    ? local_per_page
    : import.meta.env.VITE_PAGE_SIZE

  const setPerPage = () => {
    localStorage.setItem('per_page', per_page)
    fetchData()
  }

  const sort = async (attr) => {
    page = 1
    sort_attr = attr
    if (sort_direction === 'asc') {
      sort_direction = 'desc'
    } else {
      sort_direction = 'asc'
    }
    await fetchData()
  }

  const last_seen = (user) => {
    const now = Math.floor(Date.now() / 1000)

    const res = {
      text: '',
      days: 0,
      never_days: 0
    }

    if (user.last_login == 0) {
      res.text = 'never'
      res.days = 0
      res.never_days = Math.floor((now - user.created_time) / 86400)
      return res
    }

    const diff = Math.floor((now - user.last_login) / 86400)

    if (diff === 0) {
      res.text = 'recently'
    } else if (diff === 1) {
      res.text = 'yesterday'
    } else {
      res.text = `${diff} days ago`
    }
    res.days = diff
    return res
  }

  $: fetchData = async () => {
    request_done = false
    let url = `${
      import.meta.env.VITE_API_URL
    }/users?sort_attr=${sort_attr}&sort_direction=${sort_direction}&search=${search_value}&page=${page}&per_page=${per_page}`
    fetchError = false
    haveNext = false
    items = []
    try {
      const response = await request(url)
      items = await response.json()
    } catch (e) {
      fetchError = true
    } finally {
      request_done = true
      if (items.length > per_page) {
        haveNext = true
        items.pop()
      }
    }
  }

  onMount(async () => {
    await fetchData()
  })
</script>

<div class="header">
  <h1>Users</h1>
  <span>All users list</span>
</div>

<div class="toprow">
  <div class="start">
    <button class="submit icon-row" on:click={() => replace('/user/new')}>
      <div class="icon">
        <MdAddCircleOutline />
      </div>
      <div class="text">Add user</div>
    </button>
  </div>

  <div class="item">
    <span class="label">Items per page: </span>&nbsp;
    <div class="input">
      <select
        id="per_page"
        name="per_page"
        style="height: 3em;"
        bind:value={per_page}
        on:change={setPerPage}
      >
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>

  <div class="item">
    <input
      class="search-field"
      style="width: auto; margin-right: 5px;"
      bind:value={search_value}
    />
    <button
      class="submit icon-row"
      on:click={async () => {
        page = 1
        await fetchData()
      }}
    >
      <div class="icon">
        <MdSearch />
      </div>
      <div class="text">Search</div></button
    >
  </div>
</div>

<table class="table">
  <tr class="table-row header">
    <td>
      <span class="sortable" on:click={async () => await sort('email')}
        >Email</span
      >
      <SortIcon {sort_direction} visible={sort_attr == 'email'} />
    </td>
    <td>
      <span class="sortable" on:click={async () => await sort('name')}
        >Name</span
      >
      <SortIcon {sort_direction} visible={sort_attr == 'name'} />
    </td>
    <td>
      <span class="sortable" on:click={async () => await sort('quota')}
        >Quota</span
      >
      <SortIcon {sort_direction} visible={sort_attr == 'quota'} />
    </td>
    <td>
      <span class="sortable" on:click={async () => await sort('quota_used')}
        >Usage</span
      >
      <SortIcon {sort_direction} visible={sort_attr == 'quota_used'} />
    </td>
    <td>
      <span class="sortable" on:click={async () => await sort('last_login')}
        >Last seen</span
      >
      <SortIcon {sort_direction} visible={sort_attr == 'last_login'} />
    </td>
    <td>
      <span class="sortable" on:click={async () => await sort('active')}
        >Active</span
      >
      <SortIcon {sort_direction} visible={sort_attr == 'active'} />
    </td>
  </tr>
  {#if items.length == 0}
    <div>
      {#if !request_done}
        <h2 class="loading">Loading...</h2>
      {:else if fetchError}
        <h2 class="error">Request failed</h2>
      {:else}
        <h2 class="loading">No more items</h2>
      {/if}
    </div>
  {:else}
    {#each items as item (item.id)}
      {@const ls = last_seen(item)}
      <tr
        class="table-row item"
        class:inactive={item.active === 0}
        on:click={() => replace(`/user/${item.id}`)}
      >
        <td>{item.email}</td>
        <td>{item.name}</td>
        <td>{item.quota} MB</td>
        <td class:warning={item.quota_used > 85}
          >{Math.floor(item.quota_used)}%</td
        >
        <td
          class:warning={ls.days >=
            import.meta.env.VITE_USER_LAST_LOGIN_ALERT_DAYS ||
            ls.never_days >= import.meta.env.VITE_NOT_LOGGED_AFTER_CREATE}
          >{ls.text}</td
        >
        <td>{item.active === 1 ? 'Y' : 'N'}</td>
      </tr>
    {/each}
  {/if}
</table>

<div class="pager icon-row">
  <button
    class="submit icon-row"
    disabled={page === 1}
    on:click={async () => {
      page -= 1
      await fetchData()
    }}
  >
    <div class="icon"><MdNavigateBefore /></div>
    <div class="text">Prev</div></button
  >
  <span class="hint" style="margin: 0 10px">Page {page}</span>
  <button
    class="submit icon-row"
    disabled={!haveNext}
    on:click={async () => {
      page += 1
      await fetchData()
    }}
  >
    <div class="icon"><MdNavigateNext /></div>
    <div class="text">Next</div></button
  >
</div>

<style>
  .label {
    font-size: 0.9em;
  }
  .toprow {
    width: 100%;
    display: flex;
    align-content: center;
    margin-bottom: 10px;
  }
  .toprow > .start {
    flex: 1;
  }
  .toprow > .item {
    margin-left: 30px;
    display: flex;
    align-items: center;
  }
</style>
