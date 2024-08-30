import math
import numpy
import pandas as pd 
import geocoder
import plotly.express as px

import geopandas as gpd 
import folium
from folium import Circle, Marker, Popup, IFrame
from folium.plugins import HeatMap, MarkerCluster, LocateControl

coffee_shops = gpd.read_file('../data_harvest/data.json')

print(coffee_shops.columns.to_list())


coffee_shops['lon'] = coffee_shops.geometry.apply(lambda p: p.x)
coffee_shops['lat'] = coffee_shops.geometry.apply(lambda p: p.y)


#Base map
mark = folium.Map(location=[42.3472373, -71.1142421,], tiles ='cartodbpositron', zoom_start = 12)

#Add plugin, in this case we are using MarkerCluster

for idx, row in coffee_shops.iterrows():
    Marker([row['lat'], row['lon']],
           popup = row.key).add_to(mark)

mark.save("map.html")
## Bubble map

tooltip_columns = ['Name', 'Review', 'Ratings', 'Address']
bubble = folium.Map(location=[42.3472373, -71.1142421], tiles = 'cartodbpositron', zoom_start = 12)

mc = MarkerCluster()
for idx, row in coffee_shops.iterrows():
    popup_html = f"""
    <div style="font-family: Arial; font-size: 12px; color: black;">
    </div>
    """

    tooltip_text = '<br>'.join([f"{elem}: {row[elem]}" for elem in tooltip_columns])
    
    iframe = IFrame(popup_html, width=250, height=100)

    popup = Popup(iframe, max_width=2650)
    
    mc.add_child(Marker(
        [row['lat'], row['lon']],
        tooltip = folium.Tooltip(tooltip_text),
        popup=popup
        ))
bubble.add_child(mc)

bubble.save("bubble.html")
