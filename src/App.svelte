<script lang="ts">
	// Populate categories store
	// TODO: move this to a more suitable place?
	import category from './controllers/category';
	import { categoryStore } from './stores/categoryStore';

	category.getCategories().then((categories) => {
		categoryStore.set(categories);
	});
</script>
