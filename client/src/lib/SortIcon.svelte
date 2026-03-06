<script>
  import TiArrowSortedDown from 'svelte-icons/ti/TiArrowSortedDown.svelte'
  import TiArrowSortedUp from 'svelte-icons/ti/TiArrowSortedUp.svelte'

  export let sort_direction
  export let visible
</script>

<div class="sorticon" class:hidden={!visible}>
  {#if sort_direction == 'desc'}
    <TiArrowSortedDown />
  {:else}
    <TiArrowSortedUp />
  {/if}
</div>

<style>
  .sorticon {
    display: inline-block;
    color: white;
    width: 12px;
    height: 12px;
  }
  .hidden {
    display: none;
  }
</style>
