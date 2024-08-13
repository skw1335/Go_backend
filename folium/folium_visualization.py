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
    
sp = px.scatter(coffee_shops, 'lon', 'lat', title='A Scatter plot of the latitude and longitude of coffee shops in boston')


#Base map
mark = folium.Map(location=[42.3472373, -71.1142421,], tiles ='cartodbpositron', zoom_start = 12)

#Add plugin, in this case we are using MarkerCluster

for idx, row in coffee_shops.iterrows():
    Marker([row['lat'], row['lon']],
           popup = row.key).add_to(mark)

mark.save("map.html")


bubble = folium.Map(location=[42.3472373, -71.1142421], tiles = 'cartodbpositron', zoom_start = 12)

mc = MarkerCluster()
for idx, row in coffee_shops.iterrows():
    mc.add_child(Marker([row['lat'], row['lon']]))
bubble.add_child(mc)

bubble.save("bubble.html")
