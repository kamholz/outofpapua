<script>
  export let headword;
  export let gloss;
</script>

<form>
  Headword: <input type="text" name="headword" bind:value={headword}><br>
  Gloss: <input type="text" name="gloss" bind:value={gloss}><br>
  <input type="submit" value="Search">
</form>
