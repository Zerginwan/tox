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
    # TODO закомментировать при сборке
    engine = create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )
    # объявляем словарь для ответа
    answer = {"warnings": None, "errors": None}
    # Бежим по объектам
    for o_id in object_type_id_list:
        table_name = "preset_%i_%i" %(o_id, year)
        # проверяем наличие пресета для объекта
        if inspect(engine).has_table(table_name):
            
    
    # return answer
if __name__ == "__main__":
    get_doc(1)