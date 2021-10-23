import time
from datetime import timedelta
def workload_oracle(object_type_id: int, year: int = 2021, addition_objects:list[list[float,float,int]] = []):
    '''
    Функция расчета весов соответсвия стандартам по всем областям в выбранном приближении

    object_type_id - переменная типа объекта, по которому считаются требования (mfc, polyclinic_child, etc...),
                берется из objects.id

    year    - население за какой год мы берем. Нужно для обсчета "будущего". По-умолчанию 2021г.
    
    addition_objects - список из  list [ lon, lat, zid ] координаты и сектор дополнительных объектов

    '''
    from pandas.core.frame import DataFrame
    import yaml, pandas
    from sqlalchemy import create_engine, inspect
    # подключаем конфиг
    config = yaml.safe_load(open(".config.yml"))
    # создаем "подключение" к БД
    # TODO закомментировать при сборке
    engine = create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )
    # загружаем из базы конфиг для объекта
    type_config = pandas.read_sql_query(
                "SELECT * FROM objects WHERE id = %i;" % object_type_id, 
                con=engine
            )
    # превращаем конфиг из dt в удобный словарь
    type_config = type_config.iloc[0].to_dict()

    # функция для получения id всех секторов в интересующем нас радиусе
    def get_sectors_in_radius(cell_zid, range: int):
        '''
        функция для получения id всех секторов в интересующем нас радиусе

        range - радиусс в метрах
        '''
        # запрос - первращаем lon-lat point центра сектора в lon-lat geography. Ищем дистанцию меньше range
        cell_zid = int(cell_zid)
        query = '''
        SELECT DISTINCT cell_zid
            FROM sectors s
            WHERE 
                ST_DISTANCE(
                    ST_SetSRID(
                        ST_Point(s.center_lon, s.center_lat)
                        ,4326
                    )::geography, 
                    (seleCT ST_SetSRID(
                                ST_Point(center_lon, center_lat),
                                4326
                            ) 
                        FROM sectors 
                        WHERE cell_zid = %i 
                    )::geography
                )  <= (%i + 50 )
                '''
        
        # забираем из базы список
        temp_cells_df = pandas.read_sql_query(
                query  % (cell_zid, range), 
                con=engine
            )
        # возвращаем списком
        return temp_cells_df['cell_zid'].values
    # функция накидывания веса на сектора
    def add_weight(row:pandas.Series):
        # запрос - первращаем zid сектора с объектом в lon-lat geography. Ищем "соседей" с дистанцией до центра <= range + 50
        neighbour_sectors = get_sectors_in_radius(row['zid'], type_config['range'])
        # считаем общее население соседей объекта
        all_population = 0
        for n_sector in neighbour_sectors:
            val = cells_df.query('cell_zid == @n_sector')['population'].values
            if val.size > 0:
                all_population += int(val[0])
        # индекс коэффицент заполненности сектора
        if all_population > 0:
            weight = type_config['population_req'] / all_population
        
        # добавляем 
        for n_sector in neighbour_sectors:
            cells_df[cells_df['cell_zid'] == n_sector]['weight'].add(weight)

    # функция находит индекс удовлетворенности в зависимоти от населения и возвращает Series из одного элемента
    def find_index_pop(row:pandas.Series):
        for i in range(len(weight_dict)):
            if weight_dict[i]['min_treshhold'] >= row['weight']:
                return pandas.Series(weight_dict[i]['id'])
    
    
    # объявляем словарь для ответа
    answer = {"warnings": None, "errors": None}
    # формируем колонку населения
    query_pop_add = []
    for flag in type_config['population_flags']:
        query_pop_add.append("SUM(cl.%s)" % flag)
    query_pop_add = ' + '.join(query_pop_add)
    # Проверяем существование таблицы за нужный год. Если ее нет - ставим 2021 и пишем warning
    if not inspect(engine).has_table("%i_CLocation" % year):
        if not answer['warnings']:
            answer['warnings'] = []
        answer['warnings'].append("Таблица населения за %i год отсутсвует. Данные пришли за 2021 год." % year)
        year = 2021

    # забираем все нужные нам сектора
    cells_df = pandas.read_sql_query(
            '''
            SELECT 
                s.cell_zid as cell_zid,
                s.geometry as geometry,
                s.center_lon as center_lon,
                s.center_lat as center_lat,
                array_agg(a.adm_zid) as adm_zid,
                array_agg(a.area_peresechenia_s_admzone_kv_km) as area_peresechenia_s_admzone_kv_km,
                array_agg(a.adm_name) as adm_name,
                array_agg(a.okrug_name) as okrug_name,
                array_agg(a.sub_ter) as sub_ter,
                array_agg(a.okrug_okato) as okrug_okato,
                CASE
                    WHEN %s > 0 THEN %s
                    ELSE 0
                END AS population
            FROM adm_zones AS a 
            JOIN sectors AS s ON a.cell_zid = s.cell_zid
            JOIN "%i_CLocation" AS cl ON cl.cell_zid = s.cell_zid
            GROUP BY s.cell_zid;
            ''' % ( query_pop_add, query_pop_add, year),
            con=engine
        )
    cells_df['weight'] = 0
    # забираем все нужные нам объекты
    objects_df = pandas.read_sql_query(
            "SELECT * FROM ""%s"";" % type_config['table_name'],
            con=engine, index_col='index'
        )
    
    #добавляем "добавленные вручную" объекты для расчета
    for addon in addition_objects:
        objects_df.append(pandas.Series(addon),ignore_index=True)
    
    # загружаем из базы константы для индексов, чтобы moda выдавала нормальные значения, а у карты была читабельная инфографика
    weight_dict = pandas.read_sql_query(
                "SELECT * FROM affinity_indexes ORDER BY id ASC;" , 
                con=engine
            ).to_dict('records')
    # если тип ограничения - range, то начисляем веса на сектора и вычисляем наиболее часто встречающееся число
    if type_config['range_type'] == 'range':
        # добавляем веса всем секторам в радиусе какого-либо объекта
        start_time1 = time.monotonic()
        objects_df.apply(add_weight, axis=1)
        end_time1 = time.monotonic()
        print('add_weight')
        print(timedelta(seconds=end_time1 - start_time1))
        # считаем индекс
        start_time2 = time.monotonic()
        cells_df['index_pop'] = cells_df.apply(find_index_pop, axis=1)
        end_time2 = time.monotonic()
        print('index_pop')
        print(timedelta(seconds=end_time2 - start_time2))
        # print(cells_df)
        # start_time3 = time.monotonic()
        # adms_df = cells_df.groupby('adm_zid')['index_pop'].agg(pandas.Series.mode)
        # end_time3 = time.monotonic()
        # print('index_pop_adm_zone')
        # print(timedelta(seconds=end_time3 - start_time3))
        # print(adms_df)
        # 
        # start_time4 = time.monotonic()
        # cells_df['index_pop_okato'] = cells_df.groupby('okrug_okato',axis=0)['index_pop'].mode()
        # end_time4 = time.monotonic()
        # print('index_pop_okato')
        # print(timedelta(seconds=end_time4 - start_time4))
        
        answer['data'] = {}
        answer['data'].update({"objects":objects_df.to_json(orient='records')})
        answer['data'].update({"sectors":cells_df.to_json(orient='records')})
        return answer
    


   # # в дальнейшем строка цикла превращается в наличие объекта в списке, 
    # # осторитрованного по требованиям к объекту:
    # #    - требования по нахождению в районе;
    # #    - требования по дистанции доступности и количеству населения, на покрытой территории
    
    # if object == 'mfc':
        
    # # здесь будет короткий цикл из двух тел на поиск номеров    
        
    # else object == 'polyclinic_child':
    #     answer = {}    
        
    #     # если требований по секторам нет
    #     if sector_id == 0:
            
    #         # перебираем значения в списке объектов
    #         for id in object_id:
            
    #             # объявляем переменную для подсчета охваченного населения
    #             total_pop = 0
                
    #             # определяем занятый объектом сектор
    #             object_sector = object.query('index == id')['zid']
                
    #             # создаем переменную, которую заполняем номерами секторов покрытия
    #             workload_range = moscow_fishnet.loc[moscow_fishnet['cell_zid'] == object_sector]['cross']
            
    #             # пробегаем по всем секторам, охваченным объектом, чтобы наполнить total_pop
    #             for sector in workload_range:
    #                 total_pop += int(pop_data[pop_filter])
        
    #             for object in objects_list:
               
    #                 # список секторов, охваченных объектом
    #                 terr_list = []
        
    #                 # количество населения в охваченных секторах, для расчета норматива
    #                 total_pop = 0
              
    #                 for terr in terr_list:
    #                     total_pop += int(2021_CLocation.query('cell_zid == terr')['customers_cnt_home'])
        
    #                     # расчитываем соответствие фактического населения требованиям
    #                     # требования к объектам хранятся в object_req и фильтруются по типу объекта
    #                     # формируем требования по населению 
        
    #                     pop_req = object_req.query('type == @object')['pop']
        
    #                     # и соотношение фактического населения и требования
        
    #                     req_pop_filter = total_pop / pop_req
        
    #                     if req_pop_filter >= pop_req * 1.2:
    #                         answer['score_of_object' + id] = 0
    #                     elif req_pop_filter >= pop_req * 0.96:
    #                         answer['score_of_object' + id] = 1
    #                     elif req_pop_filter >= pop_req * 0.71:
    #                         answer['score_of_object' + id] = 2
    #                     elif req_pop_filter >= pop_req * 0.31:
    #                         answer['score_of_object' + id] = 3
    #                     else:
    #                         answer['score_of_object' + id] = 4
        
    #     # если же список секторов не пуст    
    #     else:
    #         for id in sector_id:
            
    #             # определяем переменную для подсчета охваченного населения
    #             total_pop = 0
                
    #             # находим объект, расположенный в секторе
    #             object_sector = object.query('zid == id')['zid']
    #             if object_sector is not None:
    #                 # список секторов из ренджа    
    #                 # TODO make_cross()
    #                 workload_range = moscow_fishnet.loc[moscow_fishnet['cell_zid'] == object_sector]['cross']
            
    #                 # пробегаем по всем секторам, охваченным объектом, чтобы наполнить total_pop
    #                 for sector in workload_range:
    #                     total_pop += int(pop_data[pop_filter])
        
    #                 for object in objects_list:
               
    #                     # список секторов, охваченных объектом
    #                     terr_list = []
        
    #                     # количество населения в охваченных секторах, для расчета норматива
    #                     total_pop = 0
              
    #                     for terr in terr_list:
    #                         total_pop += int(2021_CLocation.query('cell_zid == terr')['customers_cnt_home'])
        
    #                         # расчитываем соответствие фактического населения требованиям
    #                         # требования к объектам хранятся в object_req и фильтруются по типу объекта
    #                         # формируем требования по населению 
        
    #                         pop_req = object_req.query('type == @object')['pop']
        
    #                         # и соотношение фактического населения и требования
        
    #                         req_pop_filter = total_pop / pop_req
        
    #                         if req_pop_filter >= pop_req * 1.2:
    #                             answer['score_of_object' + id] = 0
    #                         elif req_pop_filter >= pop_req * 0.96:
    #                             answer['score_of_object' + id] = 1
    #                         elif req_pop_filter >= pop_req * 0.71:
    #                             answer['score_of_object' + id] = 2
    #                         elif req_pop_filter >= pop_req * 0.31:
    #                             answer['score_of_object' + id] = 3
    #                         else:
    #                             answer['score_of_object' + id] = 4 
                
    #             # если в секторе нет объектов, дополняем ответ указанием номера пустого сектора
                
    #             except:
    #                 answer['empty_sectors'].append(id)
            
    #         # возвращаем ответ    
                   
    #         return answer


if __name__ == "__main__":
    
    start_time = time.monotonic()
    
    print(workload_oracle(object_type_id=2))
    end_time = time.monotonic()
    print(timedelta(seconds=end_time - start_time))