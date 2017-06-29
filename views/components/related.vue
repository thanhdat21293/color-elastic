<template>
    <div class="related" v-if="collections.length > 0">
		<h3 class="text-center">Related Palette </h3>
        <div class="row collection" v-for="collection in collections">
			<palletrelated :collection="collection"></palletrelated>
    	</div>
	</div>
	<div v-else></div>
</template>
<script>
    // Vue
    export default {
        props : [ "collections" ]
    }
</script>