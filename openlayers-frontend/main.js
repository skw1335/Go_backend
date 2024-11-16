import GeoJSON from 'ol/format/GeoJSON.js';
import ImageTile from 'ol/source/ImageTile.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Icon, Stroke, Style, Text,} from 'ol/style.js';
import {Cluster, Vector as VectorSource} from 'ol/source.js';
import {LineString, Point, Polygon} from 'ol/geom.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {createEmpty, extend, getHeight, getWidth} from 'ol/extent.js';
import {fromLonLat} from 'ol/proj.js';

const circleDistanceMultiplier = 1;
const circleFootSeparation = 28;
const circleStartAngle = Math.PI / 2;


//Define values for convexHull Fill/Stroke based on how many members
//are in the location

//Color definition for clarity: A color represented as a short array [red, green, blue, alpha]. red, green, and blue should be integers in the range 0..255 inclusive. alpha should be a float in the range 0..1 inclusive. If no alpha value is given then 1 will be used.
//
//Red

const convexHullFillLarge = new Fill({
  color: 'rgba(255, 53, 10, 0.4)',
});

//Yellow
const convexHullFillMedium = new Fill({
  color: 'rgba(255, 153, 0, 0.4)',
});

//Blue 
const convexHullFillSmall = new Fill ({
  color: 'rgba(0, 53, 255, 0.4)',
});

//Red
const convexHullStrokeLarge = new Stroke({
  color: 'rgba(255, 53, 10, 1)',
  width: 1.5,
});

//Yellow
const convexHullStrokeMedium = new Stroke({
  color: 'rbga(255, 153, 102, 1)',
  width: 1.5,
});

//Blue 
const convexHullStrokeSmall = new Stroke({
  color: 'rgba(0, 53, 255, 1)',
  width: 1.5,
});

//Red
const outerCircleFillLarge = new Fill({
  color: 'rgba(255, 53, 10, 0.3)',
});
const innerCircleFillLarge = new Fill({
  color: 'rgba(255, 65, 10, 0.7)',
});

//Yellow
const outerCircleFillMedium = new Fill({
  color: 'rgba(255, 153, 102, 0.3)',
});
const innerCircleFillMedium = new Fill({
  color: 'rgba(255, 165, 102, 0.7)',
});

//Blue
const outerCircleFillSmall = new Fill({
  color: 'rgba(0, 53, 255, 0.3)',
});
const innerCircleFillSmall = new Fill({
  color: 'rgba(0, 53, 255, 0.7)',
});
const textFill = new Fill({
  color: '#fff',
});
const textStroke = new Stroke({
  color: 'rgba(0, 0, 0, 0.6)',
  width: 3,
});

const innerCircleLarge = new CircleStyle({
  radius: 14,
  fill: innerCircleFillLarge,
});
const outerCircle = new CircleStyle({
  radius: 20,
  fill: outerCircleFillLarge,
});

const innerCircleMedium = new CircleStyle({
  radius: 14,
  fill: innerCircleFillMedium,
});
const outerCircleMedium = new CircleStyle({
  radius: 20,
  fill: outerCircleFillMedium,
});

const innerCircleSmall = new CircleStyle({
  radius: 14,
  fill: innerCircleFillSmall,
});
const outerCircleSmall = new CircleStyle({
  radius: 20,
  fill: outerCircleFillSmall,
});

const mapIcon = new Icon({
  src: './data/marker-.svg',
});

function clusterMemberStyle(clusterMember) {
	return new Style({
		geometry: clusterMember.getGeometry(),
		image: mapIcon,
	});
}

let clickFeature, clickResolution;
/**
 * Style for clusters with features that are too close to each other, activated on click.
 * @param {Feature} cluster A cluster with overlapping members.
 * @param {number} resolution The current view resolution.
 * @return {Style|null} A style to render an expanded view of the cluster members.
 */


/**
 * Computes the convex hull of a binary image using Andrew's Monotone Chain Algorithm
 * http://www.algorithmist.com/index.php/Monotone_Chain_Convex_Hull
 * @param {Array<Array<number>>} points - An array of points (two elements arrays)
 * @param {object} [options]
 * @param {boolean} [options.sorted=false]
 * @return {Array<Array<number>>} Coordinates of the convex hull in clockwise order
 */

function monotoneChainConvexHull(points, options = {}) {
    if (!options.sorted) {
        points.sort(byXThenY);
    }

    const n = points.length;
    const result = new Array(n * 2);
    var k = 0;

    for (var i = 0; i < n; i++) {
        const point = points[i];
        while (k >= 2 && cw(result[k - 2], result[k - 1], point) <= 0) {
            k--;
        }
        result[k++] = point;
    }

    const t = k + 1;
    for (i = n - 2; i >= 0; i--) {
        const point = points[i];
        while (k >= t && cw(result[k - 2], result[k - 1], point) <= 0) {
            k--;
        }
        result[k++] = point;
    }

    return result.slice(0, k - 1);
}

function cw(p1, p2, p3) {
    return (p2[1] - p1[1]) * (p3[0] - p1[0]) - (p2[0] - p1[0]) * (p3[1] - p1[1]);
}

function byXThenY(point1, point2) {
    if (point1[0] === point2[0]) {
        return point1[1] - point2[1];
    }
    return point1[0] - point2[0];
}


function clusterCircleStyle(cluster, resolution) {
  if (cluster !== clickFeature || resolution !== clickResolution) {
    return null;
  }
  const clusterMembers = cluster.get('features');
  const centerCoordinates = cluster.getGeometry().getCoordinates();

  // Determine the stroke color based on the number of members
  let convexHullStroke;
  if (clusterMembers.length <= 5) {
	  convexHullStroke = convexHullStrokeSmall;
  } else if (clusterMembers.length <= 20) {
	  convexHullStroke = convexHullStrokeMedium;
  } else {
	  convexHullStroke = convexHullStrokeLarge;
  }

  return generatePointsCircle(
    clusterMembers.length,
    cluster.getGeometry().getCoordinates(),
    resolution,
  ).reduce((styles, coordinates, i) => {
    const point = new Point(coordinates);
    const line = new LineString([centerCoordinates, coordinates]);

    // Add the line style with the determined stroke color
    styles.unshift(
      new Style({
        geometry: line,
        stroke: new Stroke({
		color: convexHullStroke, //Set the stroke color dynamically
		width: 1.5, 
	}),
      }),
    );
    styles.push(
      clusterMemberStyle(
        new Feature({
          ...clusterMembers[i].getProperties(),
          geometry: point,
        }),
      ),
    );
    return styles;
  }, []);
}

/**
 * From
 * https://github.com/Leaflet/Leaflet.markercluster/blob/31360f2/src/MarkerCluster.Spiderfier.js#L55-L72
 * Arranges points in a circle around the cluster center, with a line pointing from the center to
 * each point.
 * @param {number} count Number of cluster members.
 * @param {Array<number>} clusterCenter Center coordinate of the cluster.
 * @param {number} resolution Current view resolution.
 * @return {Array<Array<number>>} An array of coordinates representing the cluster members.
 */


function generatePointsCircle(count, clusterCenter, resolution) {
	const circumference = 
		circleDistanceMultiplier * circleFootSeparation * (2 + count);
	let legLength = circumference / (Math.PI * 2); //radius from circumference, legLength = radius
	const angleStep = (Math.PI * 2) / count;
	const res = [];
	let angle;

	legLength = Math.max(legLength, 35) * resolution; // min distance to geto ustide the cluster , 35 val is adjustable

	for (let i = 0; i < count; i++) {
		//Clockwise, like spiral.
		angle = circleStartAngle + i * angleStep;
		res.push([
			clusterCenter[0] + legLength * Math.cos(angle),
			clusterCenter[1] + legLength * Math.sin(angle), 
		]);
	}

	return res; 
}

let hoverFeature; 
/**
 * Style for convex hulls of clusters, activated on hover.
 * @param {Feature} cluster The cluster feature.
 * @return {Style|null} Polygon style for the convex hull of the cluster.
 */
function clusterHullStyle(cluster) {
	if (cluster !== hoverFeature) {
		return null;
	}
	const originalFeatures = cluster.get('features');
	const points = originalFeatures.map((feature) =>
		feature.getGeometry().getCoordinates(),
	);
	//set convexHullFill color based on the number of points in the cluster
	let hullFillColor; 
	let hullFillStroke;

	const numPoints = points.length; 
	
	if (numPoints <= 5) {
		hullFillColor = 'rgba(0, 0, 255, 0.4)'; //Blue for small clusters 
		hullFillStroke = 'rgba(0, 0, 255, 1)'; //Blue for small clusters 

	} else if (numPoints <= 15) {
		hullFillColor = 'rgba(255, 255, 0, 0.4)'; //Yellow for medium clusters
		hullFillStroke = 'rgba(255, 255, 0, 1)'; //Yellow for medium clusters

	} else {
		hullFillColor = 'rgba(255, 10, 10, 0.4)'; //Red for large clusters
		hullFillStroke = 'rgba(255, 10, 10, 1)'; //Red for large clusters

	}

	const convexHullFill = new Fill({
		color: hullFillColor,
	});

	const convexHullStroke = new Stroke({
		color: hullFillStroke, 
		width: '1.5' 
	});

	return new Style({
		geometry: new Polygon([monotoneChainConvexHull(points)]),
		fill: convexHullFill,
		stroke: convexHullStroke, 
	});
}

function clusterStyle(feature) {
  const size = feature.get('features').length;
  if (size > 1) {
    return [
      new Style({
        image: outerCircle,
      }),
      new Style({
        image: innerCircle,
        text: new Text({
          text: size.toString(),
          fill: textFill,
          stroke: textStroke,
        }),
      }),
    ];
  }
  const originalFeature = feature.get('features')[0];
  return clusterMemberStyle(originalFeature);
}

const vectorSource = new VectorSource({
	format: new GeoJSON(),
	url: './data/deduped_data.json'
});



const clusterSource = new Cluster({
  distance: 35,
  source: vectorSource,
});

const clusterHulls = new VectorLayer({
	source: clusterSource,
	style: clusterHullStyle,
});

const clusters = new VectorLayer({
	source: clusterSource,
	style: clusterHullStyle,
});

const clusterCircles = new VectorLayer({
	source: clusterSource,
	style: clusterCircleStyle,
});

const api_key = 'pk.eyJ1Ijoic2t3MTMzNSIsImEiOiJjbHhrbzh3bjcwM2U2MmpwdGs2dW9rd2VwIn0.sP8c7ShOG2tMIhCJzEcJaQ'

const raster = new MapboxVectorLayer({
   styleUrl: 'mapbox://styles/mapbox/streets-v12',
   accessToken: api_key,
});


const map = new Map({
	layers: [raster, clusterHulls, clusters, clusterCircles],
	target: 'map',
	view: new View({
		center: [0,0],
		zoom: 2, 
		maxZoom: 19,
	  	showFullExtent: true,
	}),
});


map.on('pointermove', (event) => {
  clusters.getFeatures(event.pixel).then((features) => {
    if (features[0] !== hoverFeature) {
      // Display the convex hull on hover.
      hoverFeature = features[0];
      clusterHulls.setStyle(clusterHullStyle);
      // Change the cursor style to indicate that the cluster is clickable.
      map.getTargetElement().style.cursor =
        hoverFeature && hoverFeature.get('features').length > 1
          ? 'pointer'
          : '';
    }
  });
});

map.on('click', (event) => {
  clusters.getFeatures(event.pixel).then((features) => {
    if (features.length > 0) {
      const clusterMembers = features[0].get('features');
      if (clusterMembers.length > 1) {
        // Calculate the extent of the cluster members.
        const extent = createEmpty();
        clusterMembers.forEach((feature) =>
          extend(extent, feature.getGeometry().getExtent()),
        );
        const view = map.getView();
        const resolution = map.getView().getResolution();
        if (
          view.getZoom() === view.getMaxZoom() ||
          (getWidth(extent) < resolution && getHeight(extent) < resolution)
        ) {
          // Show an expanded view of the cluster members.
          clickFeature = features[0];
          clickResolution = resolution;
          clusterCircles.setStyle(clusterCircleStyle);
        } else {
          // Zoom to the extent of the cluster members.
          view.fit(extent, {duration: 500, padding: [50, 50, 50, 50]});
        }
      }
    }
  });
});



