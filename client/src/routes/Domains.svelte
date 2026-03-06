<script>
  import { replace } from 'svelte-spa-router'
  import { onMount } from 'svelte'
  import SortIcon from '../lib/SortIcon.svelte'
  import request from '../request'

  let items = []
  let url = `${import.meta.env.VITE_API_URL}/domains`
  let fetchError = false
  let sort_direction = 'asc'
  let sort_attr = 'name'

  const sort = async (attr) => {
    sort_attr = attr
    if (sort_direction === 'asc') {
      sort_direction = 'desc'
    } else {
      sort_direction = 'asc'
    }
    await fetchData(`${url}?sort_attr=${attr}&sort_direction=${sort_direction}`)
  }

  const fetchData = async (url) => {
    fetchError = false
    items = []
    try {
      const response = await request(url)
      items = await response.json()
    } catch (e) {
      fetchError = true
    }
  }

  onMount(async () => {
    await fetchData(url)
  })
</script>

<div class="header">
  <h1>Domains</h1>
  <span>List of all managed domains</span>
</div>

<table class="table">
  <tr class="header table-row">
    <td>
      <span class="sortable" on:click={async () => await sort('name')}
        >Domain name</span
      >
      <SortIcon {sort_direction} visible={sort_attr == 'name'} />
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
      {#if fetchError == false}
        <h2 class="loading">Loading...</h2>
      {:else}
        <h2 class="error">Request failed</h2>
      {/if}
    </div>
  {:else}
    {#each items as item (item.id)}
      <tr
        class="item table-row"
        class:inactive={item.active === 0}
        on:click={() => replace(`/domain/${item.id}`)}
      >
        <td>{item.name}</td>
        <td>{item.active === 1 ? 'Y' : 'N'}</td>
      </tr>
    {/each}
  {/if}
</table>

<style>
</style>
