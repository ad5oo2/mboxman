<script>
  import { replace } from 'svelte-spa-router'
  $: replace('/users')
</script>

<div class="header">
  <h1>System dashboard</h1>
  <span>Metrics may be displayed with small lag</span>
</div>
