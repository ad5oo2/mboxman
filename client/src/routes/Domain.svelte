<script>
  import { location, replace } from 'svelte-spa-router'
  import request from '../request'
  import MdSave from 'svelte-icons/md/MdSave.svelte'
  import MdKeyboardBackspace from 'svelte-icons/md/MdKeyboardBackspace.svelte'

  const o = {
    id: {
      name: 'ID',
      value: 0,
      errors: []
    },
    name: {
      name: 'Domain name',
      value: '',
      errors: []
    },
    active: {
      name: 'Active',
      value: true,
      errors: []
    }
  }

  const id = parseInt($location.split('/').pop())

  const fetchData = (async () => {
    if (!id) return o

    const response = await (
      await request(`${import.meta.env.VITE_API_URL}/domains/${id}`)
    ).json()

    for (let k in response) {
      if (o.hasOwnProperty(k)) o[k].value = response[k]
    }
  })()

  const submitData = async (event) => {
    event.target.disabled = true
    event.preventDefault()
    const form = document.getElementById('form-data')
    // @ts-ignore
    let formData = new FormData(form)

    formData.get('active') == 'on'
      ? formData.set('active', '1')
      : formData.set('active', '0')

    for (let k in o) if (o[k].hasOwnProperty('errors')) o[k].errors = []

    try {
      const answer = await request(
        id
          ? `${import.meta.env.VITE_API_URL}/domains/${id}`
          : `${import.meta.env.VITE_API_URL}/domains`,
        {
          method: id ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          // @ts-ignore
          body: new URLSearchParams(formData)
        }
      )
      if (!answer.ok) {
        const errors = await answer.json()
        for (let e of errors) {
          if (o.hasOwnProperty(e.param)) {
            o[e.param].errors = [...o[e.param].errors, e.msg]
          }
        }
      } else {
        replace('/domains')
      }
    } catch (e) {
      throw e
    } finally {
      event.target.disabled = false
    }
  }
</script>

<div class="header">
  <h1>
    Domain {#if id}update{:else}create{/if}
  </h1>
</div>

{#await fetchData}
  <div>
    <h2 class="loading">Loading...</h2>
  </div>
{:then}
  <div class="form-container">
    <form id="form-data">
      <input type="hidden" id="id" name="id" bind:value={o.id.value} />
      <div class="form-field">
        <div class="label">{o.name.name}</div>
        <div class="input">
          <input type="text" id="name" name="name" bind:value={o.name.value} />
        </div>
        <div class="error">
          {#each o.name.errors as error}
            <span><strong>&#10007;</strong> {error}</span>
          {/each}
        </div>
      </div>
      <div class="form-field">
        <div class="label">{o.active.name}</div>
        <div class="input">
          <input
            type="checkbox"
            id="active"
            name="active"
            bind:checked={o.active.value}
          />
        </div>
        <div class="error">
          {#each o.active.errors as error}
            <span><strong>&#10007;</strong> {error}</span>
          {/each}
        </div>
      </div>
      <div class="form-actions">
        <button class="submit icon-row" on:click={submitData}>
          <div class="icon"><MdSave /></div>
          <div class="text">
            {#if id}Update{:else}Create{/if}
          </div>
        </button>
        <button class="link icon-row" on:click={() => replace('/domains')}>
          <div class="icon primary-color"><MdKeyboardBackspace /></div>
          <div class="text">Back</div>
        </button>
      </div>
    </form>
  </div>
{:catch error}
  <div>
    <h2 class="error">Request failed</h2>
  </div>
{/await}

<style>
</style>
