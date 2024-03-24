<script lang="ts" setup>
import MapControl from "./MapControl.vue";

import "../../packages/control-bto/index.css";
import { BackToOriginControl } from "../../packages/control-bto/index";

function onLoaded() {
    return () => new BackToOriginControl({
        easeToOptions: {
            center: [121, 30.5],
            zoom: 6
        }
    }) as any;
}
</script>

<template>
    <MapControl :on-loaded="onLoaded"></MapControl>
</template>