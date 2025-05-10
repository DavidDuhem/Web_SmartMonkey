<script>
    import TiThMenu from 'svelte-icons/ti/TiThMenu.svelte'
</script>

<button aria-label="Menu">
    <TiThMenu />
</button>

<style>

button{
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    width: 3rem;
    height: 3rem;
    background-color: rgba(0, 0, 0, 0);
    color: white;
    border: none;
}


@media (min-width: 900px) {
    button{
        display: none;
    }
}

</style>