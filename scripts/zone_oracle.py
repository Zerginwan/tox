import pandas as pd
import json
import csv 
import numpy as np
import openpyxl
import geopandas as gpd

# ядро скрипта, считающее по районам
def mfc_oracle(territory=moscow_admzones['adm_zid']):
    '''
    territory - один район, группу районов, по умолчанию все районы, принимает лист значений 
    номеров.
    '''
# формируем словарь на выдачу функции
    if isinstance(territory, (int, float)):
        zone_buffer =  [territory]
    elif isinstance(territory, (list)):
        zone_buffer =  territory
    else:
        zone_buffer = territory.tolist()

# создаем ответ
    answer = {}


# пробегаем циклом по всем территориям
    
    for number in zone_buffer:
    # счетчик МФЦ в района

        object_counter = 0
        object_list = [] # список объектов на территории

# пробегаем циклом по всем гео-точкам МФЦ
        for point in mfc_geo['geometry']: 

            

# если в зоне района есть точка, возвращает точку и увеличивает счетчик МФЦ в районе
            if moscow_admzones.query('adm_zid == @number')['geometry'].contains(point).sum() > 0:
                object_counter += 1 # moscow_admzones.query('adm_zid == @number')['geometry'].contains(point).sum()
                object_list.append(mfc_geo.index[mfc_geo['geometry'] == point][0])
                                                 
                
                answer['Количество МФЦ в районе ' + str(number)] = object_counter
                answer['Список МФЦ в районе '+ str(number)] = object_list
                                                 
            
    return answer  
