import math
import numpy
import pandas as pd 

import plotly.express as px

import geopandas as gpd 
import folium
from folium import Circle, Marker
from folium.plugins import HeatMap, MarkerCluster

coffee_shops = gpd.read_file('../data_harvest/data.json')


print(coffee_shops.columns.to_list())


coffee_shops['lon'] = coffee_shops.geometry.apply(lambda p: p.x)
coffee_shops['lat'] = coffee_shops.geometry.apply(lambda p: p.y)
    
px.scatter(coffee_shops, 'lon', 'lat', title='A Scatter plot of the latitude and longitude of coffee shops in boston')
