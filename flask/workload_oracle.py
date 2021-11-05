from numpy.core.defchararray import count, index
from pandas.core import series
from pandas.core.algorithms import value_counts
from pandas.core.series import Series
from sqlalchemy.sql.expression import text
import itertools


def workload_oracle(object_type_id: int, year: int = 2021, additional_objects:list[dict] = [], to_database: bool = False, index_pop_principe: str = 'moda' ):
    '''
    Функция расчета весов соответсвия стандартам по всем областям в выбранном приближении

    object_type_id - переменная типа объекта, по которому считаются требования (mfc, polyclinic_child, etc...),
                берется из objects.id

    year    - население за какой год мы берем. Нужно для обсчета "будущего". По-умолчанию 2021г.
    
    additional_objects - список из  dict { lon:float, lat:float, zid:int = None } координаты и сектор дополнительных объектов

    to_database - создать предcгенеренную базу базу с готовыми результатами.

    index_pop_principe - покрас "вышестоящего" слова в зависимости от содержания "нижестоящего".
        "moda" или "average". 
        moda - самое часто-встречающееся
        average - среднее с округлением вниз

    '''
    from pandas.core.frame import DataFrame
    import yaml, pandas, numpy, sqlalchemy, ast
    from collections import Counter

    # подключаем конфиг
    config = yaml.safe_load(open(".config.yml"))

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
                )  <= (%i + 100 )
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
        neighbour_sectors = get_sectors_in_radius(int(row['zid']), type_config['range'])
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
            cells_df.loc[cells_df['cell_zid'] == n_sector,'weight'] =  cells_df[cells_df['cell_zid'] == n_sector]['weight'] + weight
    # функция находит индекс удовлетворенности в зависимоти от населения и возвращает Series из одного элемента
    def find_index_pop(row:pandas.Series):
        for i in range(len(weight_dict)):
            if  row['weight'] >= weight_dict[i]['min_treshhold']:
                return weight_dict[i]['id']


    # 2 функции для определние наиболее распространенного значения index_pop по округам и районам
    # okrugs_df['index_pop'] = adms_df.apply(index_pop_mode_from_another_df, another_df=adms_df,index='adm_zid', axis=1)
    def index_pop_mode_from_another_df(data,another_df: pandas.DataFrame, index: str):
            filter = data[index]
            if isinstance(filter,str):
                filter = list(map(int, filter.replace('{','').replace('}','').split(',')))
            if filter:
                    if not isinstance(filter, (list)):
                        filter = [filter]
            if index_pop_principe == 'average':
                l = another_df.query('%s in @filter' % index )['index_pop'].tolist()
                c = int(float(sum(l)) / max(len(l), 1))
                return c
            elif index_pop_principe == 'moda':
                return Counter(another_df.query('%s in @filter' % index )['index_pop'].tolist()).most_common(1)[0][0]
    # def index_pop_mode_from_another_df_with_series(data,another_df: pandas.DataFrame, index: str):
    #         filter = data[index]
    #         if isinstance(filter,str):
    #             filter = list(map(int, filter.replace('{','').replace('}','').split(',')))
    #         filter = set(filter)
    #         return Counter(another_df.loc[another_df[index].isin(filter),'index_pop'].to_list()).most_common(1)[0][0]


    #меняем полигоны на массив координат дял фронта
    def reshape_polygon_to_list(data):
        r = numpy.array(data['geometry'])
        r = r.tolist()
        r = r.replace('(','[').replace(')',']')
        return r
    # Подсчитываем количество объектов в адм-зоне
    # adms_df['index_pop'] = adms_df.apply(object_counter, another_df=objects_df, axis=1)
    def object_counter_by_cell(data, another_df: pandas.DataFrame):
        all_cells_list = []
        for l in data['cell_zid']:
            all_cells_list.append(l)
        count = another_df.query('zid in @all_cells_list')['zid'].count()

        if count > 1:
            r = 5
        elif count > 0:
            r = 3
        else:
            r = 1
        return r
    def object_counter_by_adm_zone(data, another_df: pandas.DataFrame):
        all_cells_list = []
        for l in data['cell_zid']:
            if not isinstance(l, (list)):
                l =  [l]
            all_cells_list.append(l)
        all_cells_list = Series(list(itertools.chain.from_iterable(all_cells_list)))
        bool_list = another_df['zid'].apply(is_list_in_series, series=all_cells_list).values.tolist()
        count = another_df.loc[bool_list]['zid'].count()
        if count > 1:
            r = 5
        elif count > 0:
            r = 3
        else:
            r = 1
        return r
    # по широте и долготе находим zid
    def get_zid_for_object(object:dict) -> int:
        # zid -  это cell_zid сектора
        if type_config['range_type'] == 'range':
            return engine.execute(text("SELECT cell_zid AS zid FROM sectors WHERE ST_Contains(geometry::geometry, point( :lon , :lat )::geometry)"),object).fetchone()['zid']
        # zid - это список adm_zid
        elif type_config['range_type'] == 'adm_zone':
            zid = engine.execute(text("SELECT array_agg(a.adm_zid) AS zid FROM adm_zones AS a JOIN sectors AS s ON s.cell_zid = a.cell_zid AND ST_Contains(s.geometry::geometry, point( :lon , :lat )::geometry) GROUP BY a.adm_zid;"),object).fetchone()['zid']
            if isinstance(zid,int):
                zid = [zid]
            return zid
    # находить пересечения
    def is_list_in_series(list,series) -> bool:
        return series.isin(list).any()

    def str_to_list(s):
        return list(map(int, s.replace('{','').replace('}','').split(',')))





    # создаем "подключение" к БД
    # TODO закомментировать при сборке
    engine = sqlalchemy.create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )
    # загружаем из базы конфиг для объекта
    type_config = pandas.read_sql_query(
                "SELECT * FROM objects WHERE id = %i;" % object_type_id, 
                con=engine
            ).loc[0].to_dict()
        
    # таблица с пресетом
    table_name_prefix = "preset_%i_%i_" %(object_type_id, year)

    # объявляем словарь для ответа
    answer = {"data":{},"warnings": None, "errors": None}
    # забираем все нужные нам объекты
    objects_df = pandas.read_sql_query(
            "SELECT * FROM ""%s"";" % type_config['table_name'],
            con=engine, index_col='index'
        )
    answer['data'].update({"objects":objects_df.to_json(orient='records')})
    answer_objects = ['adm_zones', 'okrugs']
    # Если rane_type = range, нам нужны еще и сектора
    if type_config['range_type'] == 'range':
        answer_objects.append('sectors')

    # загружаем из базы константы для индексов, чтобы moda выдавала нормальные значения, а у карты была читабельная инфографика
    weight_dict = pandas.read_sql_query(
                    "SELECT * FROM affinity_indexes ORDER BY id DESC;" , 
                    con=engine
                ).to_dict('records')
    
    # если есть доп-объекты, которые не учтены в пресете (ддобавлены на карту пользователем)
    if len(additional_objects) > 0:
        
        # если есть доп-объекты, то считаем только ячейки, которые их касаются
        if len(additional_objects) > 0:
            # выгружаем пресеты, чтобы посчитать новое на их основе
            preset_dict = {}
            # бегаем по нужным объектам - сектора, адм-зоны, округа, выгружаем их пресеты
            for a_obj in answer_objects:
                # определяем имя таблицы с пресетом
                table_name = table_name_prefix + a_obj
                #загружаем в датафрейм
                if sqlalchemy.inspect(engine).has_table(table_name):
                    preset_dict[a_obj] = pandas.read_sql_query(
                            "SELECT * FROM \"%s\";" % table_name, 
                            con=engine
                        )
                else:
                    #  если нет таблицы - ошибка
                    answer['error'] = ["Data from preset not found: not table with name %s" % table_name]
                    can_do_preset = False
                    break
            # находим zid - берем или из объекта, или находим по координатам
            for k,v in enumerate(additional_objects):
                if 'cell_zid' in v.keys() and v['cell_zid']:
                    if type_config['range_type'] == 'range':
                        zid = v['cell_zid']
                    else:
                        zid = [v['cell_zid']]
                else:
                    zid = get_zid_for_object(v)

                if zid:
                    additional_objects[k].update({"zid": zid})
                else:
                    additional_objects.remove(v)
            # создает объект для ответа
            answer['data']['new'] = {}
            # Если есть пререквизит по радиусу, то нам нужны сектора
            # находим список нужных секторов
            recalculated_objects_index_list = []
            if type_config['range_type'] == 'range':
                for a in additional_objects:
                    recalculated_objects_index_list.append(get_sectors_in_radius(a['zid'], type_config['range']))
                # берем уникальные нужные сектора
                recalculated_objects_index_list = list(set(numpy.concatenate(recalculated_objects_index_list)))
            elif type_config['range_type'] == 'adm_zone':
                for a in additional_objects:
                    recalculated_objects_index_list.append(a['zid'])
                recalculated_objects_index_list = list(set(itertools.chain.from_iterable(recalculated_objects_index_list)))

            # выбираем датафрейм с нужными секторами
            additional_objects_df = DataFrame(additional_objects)
            # text -> list
            preset_dict['adm_zones']['cell_zid'] =  preset_dict['adm_zones']['cell_zid'].apply(str_to_list)
            preset_dict['okrugs']['adm_zid'] =  preset_dict['okrugs']['adm_zid'].apply(str_to_list)

            # для радиуса пересчитываем сектора и адм-зоны    
            if type_config['range_type'] == 'range':
                cells_df = preset_dict['sectors'].query('cell_zid in @recalculated_objects_index_list')
                # ищем новые адм-зоны и округа
                # формируем списки для выборок
                new_c_list = cells_df['cell_zid'].tolist()
                a_list = list(set(itertools.chain.from_iterable(cells_df['adm_zid'].apply(str_to_list).tolist())))
                o_list = list(set(itertools.chain.from_iterable(cells_df['okrug_okato'].apply(str_to_list).tolist())))
                # нашли затронутые
                adms_df = preset_dict['adm_zones'].query('adm_zid in @a_list')
                okrugs_df = preset_dict['okrugs'].query('okrug_okato in @o_list')

                # пересчитываем вес
                additional_objects_df.apply(add_weight, axis=1)

                # считаем индекс
                cells_df['index_pop'] = cells_df.apply(find_index_pop, axis=1)
                cells_df['adm_zid'] = cells_df['adm_zid'].apply(str_to_list)
                cells_df['okrug_okato'] = cells_df['okrug_okato'].apply(str_to_list)
                
                # записываем в ответ
                answer['data']['new'].update({"sectors":cells_df.to_json(orient='records')})
                
                # посчитали заново затронутые районы
                c_list = list(itertools.chain.from_iterable(adms_df['cell_zid'].tolist()))
                old_and_new_cells = preset_dict['sectors'].query('cell_zid in @c_list')
                old_and_new_cells['adm_zid'] = old_and_new_cells['adm_zid'].apply(str_to_list)
                old_and_new_cells.loc[old_and_new_cells['cell_zid'].isin(cells_df['cell_zid'])] = cells_df
                adms_df['index_pop'] = adms_df.apply(index_pop_mode_from_another_df, another_df=old_and_new_cells,index='cell_zid', axis=1)
            # для адм-зон пересчитываем только адм-зоны
            elif type_config['range_type'] == 'adm_zone':
                adms_df = preset_dict['adm_zones'].query('adm_zid in @recalculated_objects_index_list')
                adms_df['index_pop'] = adms_df.apply(object_counter_by_adm_zone, another_df=additional_objects_df, axis=1)
                # посчитали заново затронутые округа
                bool_list = preset_dict['okrugs']['adm_zid'].apply(is_list_in_series, series=adms_df['adm_zid']).values.tolist()
                okrugs_df = preset_dict['okrugs'].loc[bool_list]
                
                
            old_and_new_a_list = list(set(itertools.chain.from_iterable(okrugs_df['adm_zid'].tolist())))
            old_and_new_adms = preset_dict['adm_zones'].query('adm_zid in @old_and_new_a_list')
            old_and_new_adms.loc[old_and_new_adms['adm_zid'].isin(adms_df['adm_zid'])] = adms_df
            
            okrugs_df['index_pop'] = okrugs_df.apply(index_pop_mode_from_another_df, another_df=old_and_new_adms,index='adm_zid', axis=1)

            # дописываем ответ
            answer['data']['new'].update({"adm_zones":adms_df.to_json(orient='records')})
            answer['data']['new'].update({"okrugs":okrugs_df.to_json(orient='records')})


                    
                
        # если это типовой запрос - просто берем пресет
    elif not to_database:
        for a_obj in answer_objects:
            table_name = table_name_prefix + a_obj
            if sqlalchemy.inspect(engine).has_table(table_name):
                answer['data'][a_obj] = pandas.read_sql_query(
                        "SELECT * FROM \"%s\";" % table_name, 
                        con=engine
                    ).to_json(orient='records')
                answer['warnings'] = ['Data from preset']
            else:
                answer['warnings'] = ["Data from preset not found: not table with name %s" % table_name]
                can_do_preset = False
                break
    # если нет возможности просто взять пресет - считаем все и сразу
    else:

        # формируем колонку населения
        query_pop_add = []
        if type_config['population_flags']:
            for flag in type_config['population_flags']:
                query_pop_add.append("SUM(cl.%s)" % flag)
            query_pop_add = ' + '.join(query_pop_add)
        else:
            query_pop_add = '-1'

        # Проверяем существование таблицы за нужный год. Если ее нет - ставим 2021 и пишем warning
        if not sqlalchemy.inspect(engine).has_table("%i_CLocation" % year):
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
                    array_agg(a.adm_okato) as adm_okato,
                    array_agg(a.adm_name) as adm_name,
                    array_agg(a.okrug_name) as okrug_name,
                    array_agg(a.okrug_okato) as okrug_okato,
                    CASE
                        WHEN %s > 0 THEN %s
                        ELSE 0
                    END AS population
                FROM adm_zones AS a 
                JOIN sectors AS s ON a.cell_zid = s.cell_zid
                JOIN "%i_CLocation" AS cl ON cl.cell_zid = s.cell_zid
                GROUP BY s.cell_zid
                HAVING %s > 50
                ;
                ''' % ( query_pop_add, query_pop_add, year, query_pop_add),
                con=engine
            )
        cells_df['weight'] = 0
        #добавляем "добавленные вручную" объекты для расчета
        # TODO пока не работает. Передлеать на что-то не такое долгое
        # for addon in additional_objects:
            # objects_df.append(pandas.Series(addon),ignore_index=True)


        # если тип ограничения - range, то начисляем веса на сектора и вычисляем наиболее часто встречающееся число
        if type_config['range_type'] == 'range':
            # добавляем веса всем секторам в радиусе какого-либо объекта

            objects_df.apply(add_weight, axis=1)

            # считаем индекс
            cells_df['index_pop'] = cells_df.apply(find_index_pop, axis=1)

            # собираем отдельный объект по адм.районам
            adms_df = pandas.read_sql_query(
                '''SELECT 
                    adm_zid, 
                    MAX(adm_name) as adm_name, 
                    MAX(adm_okato) as adm_okato, 
                    array_agg(cell_zid) as cell_zid 
                FROM adm_zones 
                GROUP BY adm_zid;''',

                con=engine
            )

            # считаем индекс для районов
            adms_df['index_pop'] =        adms_df.apply(index_pop_mode_from_another_df, another_df=cells_df, index='cell_zid', axis=1)

            #собираем отдельный объект по округам
            okrugs_df = pandas.read_sql_query(
                "SELECT okrug_okato, MAX(okrug_name) as okrug_name, array_agg(DISTINCT adm_zid) as adm_zid, array_agg(DISTINCT adm_name) as adm_name, array_agg(DISTINCT adm_okato) as adm_okato, array_agg(DISTINCT cell_zid) as cell_zid FROM adm_zones GROUP BY okrug_okato;",
                con=engine
            )
            # считаем индекс для округов
            okrugs_df['index_pop'] = okrugs_df.apply(index_pop_mode_from_another_df, another_df=adms_df,index='adm_zid', axis=1)

            cells_df['geometry'] = cells_df.apply(reshape_polygon_to_list,axis=1)

            answer['data'].update({"sectors":cells_df.to_json(orient='records')})
            answer['data'].update({"adm_zones":adms_df.to_json(orient='records')})
            answer['data'].update({"okrugs":okrugs_df.to_json(orient='records')})

        else:
            
            adms_df = pandas.read_sql_query(
                "SELECT adm_zid, MAX(adm_name), MAX(adm_okato) as adm_okato, array_agg(DISTINCT cell_zid) as cell_zid FROM adm_zones GROUP BY adm_zid;",

                con=engine
            )
            adms_df['index_pop'] = 0

            adms_df['index_pop'] = adms_df.apply(object_counter_by_cell, another_df=objects_df, axis=1)

            # 
            okrugs_df = pandas.read_sql_query(
                "SELECT okrug_okato,MAX(okrug_name) as okrug_name, array_agg(DISTINCT adm_zid) as adm_zid FROM adm_zones GROUP BY okrug_okato;",
                con=engine
            )
            okrugs_df['index_pop'] = okrugs_df.apply(index_pop_mode_from_another_df, another_df=adms_df,index='adm_zid', axis=1)

            
            answer['data'].update({"adm_zones":adms_df.to_json(orient='records')})
            answer['data'].update({"okrugs":okrugs_df.to_json(orient='records')})

    # если нужно забписать в базу - записываем в базу
    if to_database:
        to_db = {"sectors": cells_df, "adm_zones":adms_df, "okrugs": okrugs_df}
        if type_config['range_type'] == 'range':
            to_db.update({"sectors": cells_df})
        for a_obj in answer_objects:
            table_name = table_name_prefix + a_obj
            to_db[a_obj].to_sql(table_name, engine, if_exists='replace', index=False, method='multi')
    # иначе возвращаем как есть
    else:
        return answer


if __name__ == "__main__":
    for i in range(16):
        print(i)
        # workload_oracle(1,year=(2021+i), to_database=True)
        workload_oracle(2,year=(2021+i), to_database=True)
    # workload_oracle(1,year=2021,additional_objects=[{"lat": 37.595637, "lon": 55.609184,"cell_zid":113292}, {"lat": 37.630394, "lon": 55.577490}])
