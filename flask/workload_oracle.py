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
    import yaml, pandas, numpy
    from sqlalchemy import create_engine, inspect
    from collections import Counter

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
    
    # функция для определние среднего значения index_pop по округам и районам
    def pop_index_mode_from_another_df_by_cell_zid(data,another_df: pandas.DataFrame):
            filter = data['cell_zid']
            if filter:
                    if not isinstance(filter, (list)):
                        filter =  [filter]
            return Counter(list(another_df.query('cell_zid in @filter')['index_pop'])).most_common(1)[0][0]
    def pop_index_mode_from_another_df_by_adm_zid(data,another_df: pandas.DataFrame):
            filter = data['adm_zid']
            if filter:
                    if not isinstance(filter, (list)):
                        filter =  [filter]
            return Counter(list(another_df.query('adm_zid in @filter')['index_pop'])).most_common(1)[0][0]
    #меняем полигоны на массив координат дял фронта
    def reshape_polygon_to_list(data):
        return numpy.array(data['geometry'])
    
    def object_counter(data, another_df: pandas.DataFrame):
            for l in data['cell_zid']:
                if l:
                    if not isinstance(l, (list)):
                        l =  [l]
                    return another_df.query('zid in @l')['zid'].count()


    # объявляем словарь для ответа
    answer = {"warnings": None, "errors": None}
    # формируем колонку населения
    query_pop_add = []
    if type_config['population_flags']:
        for flag in type_config['population_flags']:
            query_pop_add.append("SUM(cl.%s)" % flag)
        query_pop_add = ' + '.join(query_pop_add)
    else:
        query_pop_add = '-1'
    
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
        
        objects_df.apply(add_weight, axis=1)
        # считаем индекс
        cells_df['index_pop'] = cells_df.apply(find_index_pop, axis=1)

        # собираем отдельный объект по адм.районам
        adms_df = pandas.read_sql_query(
            "SELECT adm_zid, MAX(adm_name) as adm_name, array_agg(cell_zid) as cell_zid FROM adm_zones GROUP BY adm_zid;",

            con=engine
        )
        
        # считаем индекс для районов
        adms_df['index_pop'] =        adms_df.apply(pop_index_mode_from_another_df_by_cell_zid, another_df=cells_df, axis=1)
        
        #собираем отдельный объект по округам
        okrugs_df = pandas.read_sql_query(
            "SELECT okrug_okato, MAX(okrug_name) as okrug_name, array_agg(adm_zid) as adm_zid, array_agg(adm_name) as adm_name, array_agg(cell_zid) as cell_zid FROM adm_zones GROUP BY okrug_okato;",
            con=engine
        )
        # считаем индекс для округов
        okrugs_df['index_pop'] = okrugs_df.apply(pop_index_mode_from_another_df_by_adm_zid, another_df=adms_df, axis=1)

        cells_df['geometry'] = cells_df.apply(reshape_polygon_to_list,axis=1)
        
        answer['data'] = {}
        answer['data'].update({"objects":objects_df.to_json(orient='records')})
        answer['data'].update({"sectors":cells_df.to_json(orient='records')})
        answer['data'].update({"adm_zones":adms_df.to_json(orient='records')})
        answer['data'].update({"okrugs":okrugs_df.to_json(orient='records')})
        return answer
    else:
        
        adms_df = pandas.read_sql_query(
            "SELECT adm_zid, MAX(adm_name), array_agg(cell_zid) as cell_zid FROM adm_zones GROUP BY adm_zid;",

            con=engine
        )
        adms_df['index_pop'] = 0

        adms_df['index_pop'] = adms_df.apply(object_counter, another_df=objects_df, axis=1)

        # 
        okrugs_df = pandas.read_sql_query(
            "SELECT okrug_okato,MAX(okrug_name) as okrug_name, array_agg(adm_zid) as adm_zid, array_agg(adm_name) as adm_name FROM adm_zones GROUP BY okrug_okato;",
            con=engine
        )
        okrugs_df['index_pop'] = adms_df.apply(pop_index_mode_from_another_df_by_adm_zid, another_df=adms_df, axis=1)

        
        answer['data'] = {}
        answer['data'].update({"objects":objects_df.to_json(orient='records')})
        answer['data'].update({"adm_zones":adms_df.to_json(orient='records')})
        return answer
        