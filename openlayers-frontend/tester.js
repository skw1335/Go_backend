import MVT from 'ol/format/MVT';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import {Map, View} from 'ol';
import {fromLonLat} from 'ol/proj';


const api_key = 'pk.eyJ1Ijoic2t3MTMzNSIsImEiOiJjbHhrbzh3bjcwM2U2MmpwdGs2dW9rd2VwIn0.sP8c7ShOG2tMIhCJzEcJaQ'

const map = new Map({
  target: 'map-container',
  layers: [
    new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: `./data/deduped_data.json`,
      }),
    }),
    new MapboxVectorLayer({
      styleUrl: 'mapbox://styles/mapbox/streets-v12',
      accessToken: api_key,
    })
  ],

  view: new View({
    center: fromLonLat([42.3470106,-71.08414840]),
    zoom: 2,
  }),
});
