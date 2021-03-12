<script>
import SelectBudget from "../SelectBudget.svelte";

/* The reason readOnly is defined here and passed to SelectBudget is
 * Make sure that it's a boolean and does not change anytime or anyhow
 * If sent like `<SelectBudget readonly=false />` it /can/ be refactored to `"false"`
 * which breaks functionality in a confusing way, because the value is false, but is a string */
const readOnly = false;
</script>

<SelectBudget {readOnly} />
