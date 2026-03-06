<script>
  import MdSave from 'svelte-icons/md/MdSave.svelte'
  import request from '../request'
  import { replace } from 'svelte-spa-router'
  const o = {
    token: {
      name: 'Token',
      value: '',
      errors: []
    }
  }

  const submitData = async (event) => {
    event.target.disabled = true
    event.preventDefault()
    const form = document.getElementById('form-data')
    // @ts-ignore
    let formData = new FormData(form)
    for (let k in o) if (o[k].hasOwnProperty('errors')) o[k].errors = []
    try {
      const answer = await request(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: 'POST',
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
        replace('/')
      }
    } catch (err) {
      throw err
    } finally {
      event.target.disabled = false
    }
  }
</script>

<div class="header">
  <h1>Input access token</h1>
  <span>It will be stored and may be used on this browser continuously</span>
</div>

<div class="form-container">
  <br />
  <form id="form-data" autocomplete="off" on:submit={submitData}>
    <div class="form-field">
      <div class="label">{o.token.name}</div>
      <div class="input">
        <input type="text" id="token" name="token" bind:value={o.token.value} />
      </div>
      <div class="error">
        {#each o.token.errors as error}
          <span><strong>&#10007;</strong> {error}</span>
        {/each}
      </div>
    </div>
  </form>
  <div class="form-actions">
    <button class="submit icon-row" on:click={submitData}>
      <div class="icon"><MdSave /></div>
      <div class="text">Save</div>
    </button>
  </div>
</div>
