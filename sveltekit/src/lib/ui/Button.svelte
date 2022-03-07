<script lang='ts'>
	export let color = '#bebebe',
		fontColor = 'black',
		hoverColor = '#6497bd',
		disabled = false;
</script>

<div class='button'
		 tabindex='0'
		 style='--button-bg: {color}; --button-fg: {fontColor}; --button-hover: {hoverColor}'
		 class:disabled={disabled}
		 on:click>
	<slot />
</div>

<style>
    .button {
        border: 2px solid #444;
        text-shadow: 1px 1px 2px black;
				box-sizing: border-box;
    }

		.button:focus {
				border: 2px solid #111;
				box-shadow: inset 3px 3px 5px #555;
		}

		.button:active {
        box-shadow: inset -3px -3px 5px #555;
		}

    .disabled {
        opacity: 0.75;
    }
</style>