<script lang="ts">
    import divider from "@/assets/divider.svg?raw";
    let { text } = $props();
</script>

<div class="flex items-center my-5">
    <div class="relative flex justify-center items-center">
        <span>{@html divider}</span>
        <span class="text-red-400 text-xs px-2 text-center"> {text} </span>
        <span class="-scale-100">{@html divider}</span>
    </div>
</div>
