from sqlalchemy.sql.expression import table


def get_doc(okato: int, zone_type: str = 'adm_zone', object_type_id_list: list[int] = [1,2] ):
    '''
    Функция возвращет файл с отчетом 
    
    okato - ОКАТО объекта
    
    type - тип объекта. Административный район (adm_zone) или округ.

    '''
    from pandas.core.frame import DataFrame
    import yaml, pandas, numpy
    from sqlalchemy import create_engine, inspect
    import datetime
    now = datetime.datetime.now()
    year = now.year
    # создаем "подключение" к БД
    # подключаем конфиг
    config = yaml.safe_load(open(".config.yml"))
    # TODO закомментировать при сборке
    engine = create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )
    # объявляем словарь для ответа
    answer = {"warnings": None, "errors": None}
    # Бежим по объектам

    weight_dict = pandas.read_sql_query(
                    "SELECT * FROM affinity_indexes ORDER BY id ASC;" , 
                    con=engine
                ).to_dict('records')
    print(weight_dict)
    # for o_id in object_type_id_list:
    #     type_config = pandas.read_sql_query(
    #             "SELECT * FROM objects WHERE id = %i;" % o_id, 
    #             con=engine
    #         ).loc[0].to_dict()
        
    # # таблица с пресетом
    #     table_name_prefix = "preset_%i_%i_" %(o_id, year)
    #     answer_objects = ['adm_zones', 'okrugs']
    # # Если rane_type = range, нам нужны еще и сектора
    #     if type_config['range_type'] == 'range':
    #         answer_objects.append('sectors')

    #     table_name = "preset_%i_%i" %(o_id, year)
    #     # проверяем наличие пресета для объекта
    #     if inspect(engine).has_table(table_name):
            
    #     else:
    #         answer['errors'] = ['no preset with %s table_name was found']
    #         break
            
    
    # return answer
if __name__ == "__main__":
    get_doc(1)