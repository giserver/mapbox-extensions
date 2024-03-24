<script lang="ts" setup>

import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

import maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { nextTick, onMounted, onUnmounted } from 'vue';

mapboxgl.accessToken = 'pk.eyJ1IjoiY29jYWluZWNvZGVyIiwiYSI6ImNrdHA1YjlleDBqYTEzMm85bTBrOWE0aXMifQ.J8k3R1QBqh3pyoZi_5Yx9w';

const props = defineProps<{
    onCreated?(map_box: mapboxgl.Map, map_libre: maplibre.Map): void,
    onLoaded?(map_box: mapboxgl.Map, map_libre: maplibre.Map): () => mapboxgl.IControl & maplibre.IControl;
}>();

let map_box: mapboxgl.Map;
let map_libre: maplibre.Map;

onMounted(() => {
    nextTick(() => {
        map_box = new mapboxgl.Map({
            container: "mapbox"
        });

        map_libre = new maplibre.Map({
            container: "maplibre",
            style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
        });

        props.onCreated?.(map_box, map_libre);

        const loadedFlags = [false, false];

        map_box.on('load', () => {
            loadedFlags[0] = true;
        });

        map_libre.on('load', () => {
            loadedFlags[1] = true;
        });

        let timeout = setInterval(() => {
            if (loadedFlags.every(x => x)) {
                clearInterval(timeout);
                const ctrl = props.onLoaded?.(map_box, map_libre);
                if (ctrl) {
                    map_box.addControl(ctrl());
                    map_libre.addControl(ctrl());
                }
            }
        }, 10)
    });
});

onUnmounted(() => {
    map_box.remove();
    map_libre.remove();
});
</script>

<template>
    <h3>mapbox</h3>
    <div class="map" id="mapbox"></div>

    <h3>maplibre</h3>
    <div class="map" id="maplibre"></div>
</template>

<style>
.map {
    height: 450px;
}
</style>