declare module '@maphubs/tokml' {
    export default function tokml(
        geojson: GeoJSON.Feature | GeoJSON.FeatureCollection,
        options?: {
            documentName?: string,
            documentDescription?: string,
            name: string,
            description: string,
            simplestyle: boolean,
            timestamp: string
        }): string
}