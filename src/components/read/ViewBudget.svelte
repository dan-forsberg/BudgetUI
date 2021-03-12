<script lang="ts">
import SelectBudget from "../SelectBudget.svelte";
/* The reason readOnly is defined here and passed to SelectBudget is
 * Make sure that it's a boolean and does not change anytime or anyhow
 * If sent like `<SelectBudget readonly=true />` it /can/ be refactored to "true"
 * which breaks functionality in a confusing way, because the value is true, but is a string */
const readOnly = true;
</script>

<SelectBudget {readOnly} />
