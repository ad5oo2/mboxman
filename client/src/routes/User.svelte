<script>
  import request from '../request'
  import { location, replace } from 'svelte-spa-router'
  import { fade } from 'svelte/transition'
  import MdDelete from 'svelte-icons/md/MdDelete.svelte'
  import MdSave from 'svelte-icons/md/MdSave.svelte'
  import MdKeyboardBackspace from 'svelte-icons/md/MdKeyboardBackspace.svelte'

  let domains = []
  let confirmation_active = false

  const o = {
    id: {
      name: 'ID',
      value: 0,
      errors: []
    },
    local_part: {
      name: 'Username',
      value: '',
      errors: []
    },
    domain_id: {
      name: 'Domain',
      value: null,
      errors: []
    },
    password: {
      name: 'Password',
      value: '',
      errors: []
    },
    name: {
      name: 'Name',
      value: '',
      errors: []
    },
    quota: {
      name: 'Quota',
      value: import.meta.env.VITE_DEFAULT_NEW_USER_QUOTA,
      errors: []
    },
    active: {
      name: 'Active',
      value: true,
      errors: []
    },
    last_login: {
      name: 'Last seen',
      value: 0,
      errors: []
    },
    reset_inactivity: {
      name: 'Reset inactivity',
      value: false,
      errors: []
    }
  }

  const id = parseInt($location.split('/').pop())

  const fetchData = (async () => {
    domains = await (
      await request(`${import.meta.env.VITE_API_URL}/domains`)
    ).json()

    if (!o.domain_id.value) {
      o.domain_id.value = domains.find(
        (element) =>
          element.name == import.meta.env.VITE_DEFAULT_NEW_USER_DOMAIN
      )?.id
    }

    if (!id) return o

    const response = await (
      await request(`${import.meta.env.VITE_API_URL}/users/${id}`)
    ).json()

    for (let k in response) {
      if (o.hasOwnProperty(k)) o[k].value = response[k]
    }
  })()

  const deleteUser = async (event) => {
    event.preventDefault()
    try {
      await request(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        method: 'DELETE'
      })
      replace('/users')
    } catch (e) {
      throw e
    }
  }

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
          ? `${import.meta.env.VITE_API_URL}/users/${id}`
          : `${import.meta.env.VITE_API_URL}/users`,
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
        replace('/users')
      }
    } catch (e) {
      throw e
    } finally {
      event.target.disabled = false
    }
  }

  const generatePassword = async (event) => {
    event.preventDefault()
    o.password.value = ''
    const chars = [
      '0123456789',
      'abcdefghijklmnopqrstuvwxyz',
      '!@#$%^&*()',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    ]

    let password = ''
    let prevType = 0
    for (let i = 0; i < 12; i++) {
      const getType = () => {
        const t = Math.floor(Math.random() * chars.length)
        if (t === prevType) return getType()
        prevType = t
        return t
      }

      const currentType = getType()

      let randomSymbol = Math.floor(Math.random() * chars[currentType].length)
      password += chars[currentType].substring(randomSymbol, randomSymbol + 1)
    }
    o.password.value = password
  }
</script>

<div class="header">
  <h1>
    User {#if id}update{:else}create{/if}
  </h1>
</div>

{#await fetchData}
  <div>
    <h2 class="loading">Loading...</h2>
  </div>
{:then}
  <div class="form-container">
    <form id="form-data" autocomplete="off">
      <input type="hidden" id="id" name="id" bind:value={o.id.value} />
      <div class="form-field">
        <div class="label">{o.local_part.name}</div>
        <div class="input">
          <input
            type="text"
            id="local_part"
            name="local_part"
            bind:value={o.local_part.value}
          />
        </div>
        <div class="error">
          {#each o.local_part.errors as error}
            <span><strong>&#10007;</strong> {error}</span>
          {/each}
        </div>
      </div>
      <div class="form-field">
        <div class="label">{o.domain_id.name}</div>
        <div class="input">
          <select
            id="domain_id"
            name="domain_id"
            bind:value={o.domain_id.value}
          >
            {#each domains as domain}
              <option value={domain.id}>{domain.name}</option>
            {/each}
          </select>
        </div>
        <div class="error">
          {#each o.domain_id.errors as error}
            <span><strong>&#10007;</strong> {error}</span>
          {/each}
        </div>
      </div>
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
        <div class="label">{o.password.name}</div>
        <div class="input">
          <input
            type="text"
            id="password"
            name="password"
            class="cpassword"
            bind:value={o.password.value}
          />
          <div style="margin-top: 5px;">
            {#if o.password.value}
              <span style="font-size: 0.8em;"
                >Generated and inserted. <span
                  class="link"
                  on:click={() => (o.password.value = '')}
                  >Reset and generate a new one</span
                >
              </span>
            {:else}
              <span class="link" on:click={generatePassword}
                >Generate new password</span
              >
            {/if}
          </div>
        </div>
        <div class="error">
          {#each o.password.errors as error}
            <span><strong>&#10007;</strong> {error}</span>
          {/each}
        </div>
      </div>
      <div class="form-field">
        <div class="label">{o.quota.name}</div>
        <div class="input">
          <input
            type="text"
            id="quota"
            name="quota"
            style="width: 80px;"
            bind:value={o.quota.value}
          />&nbsp;<span class="hint">Megabytes</span>
        </div>
        <div class="error">
          {#each o.quota.errors as error}
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
      {#if Math.floor((Math.floor(Date.now() / 1000) - o.last_login.value) / 86400) > import.meta.env.VITE_USER_LAST_LOGIN_ALERT_DAYS && o.id.value !== 0 && o.last_login.value !== 0}
        <div class="form-field">
          <div class="label">{o.reset_inactivity.name}</div>
          <div class="input">
            <input
              type="checkbox"
              id="reset_inactivity"
              name="reset_inactivity"
              bind:checked={o.reset_inactivity.value}
            />
          </div>
          <div class="error">
            {#each o.reset_inactivity.errors as error}
              <span><strong>&#10007;</strong> {error}</span>
            {/each}
          </div>
        </div>
      {/if}
      <div class="form-actions">
        <button class="submit icon-row" on:click={submitData}>
          <div class="icon"><MdSave /></div>
          <div class="text">
            {#if id}Update{:else}Create{/if}
          </div>
        </button>
        <button class="link icon-row" on:click={() => replace('/users')}>
          <div class="icon primary-color"><MdKeyboardBackspace /></div>
          <div class="text">Back</div></button
        >
        {#if id}
          <div style="float: right;">
            {#if !confirmation_active}
              <div class="confirmation-button" in:fade={{ duration: 200 }}>
                <button
                  class="danger icon-row"
                  on:click={() => (confirmation_active = true)}
                >
                  <div class="icon"><MdDelete /></div>
                  <div class="text">Delete user</div></button
                >
              </div>
            {:else}
              <div in:fade={{ duration: 200 }} class="confirmation">
                <button class="danger" on:click={deleteUser}>Yes</button>
                <button
                  class="link"
                  on:click={() => (confirmation_active = false)}>No</button
                >
              </div>
            {/if}
          </div>
        {/if}
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
