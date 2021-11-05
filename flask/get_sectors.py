from sqlalchemy.sql.expression import table
import sys, ast


def get_sectors():
    '''
    Функция возвращет сектора 

    '''
    from pandas.core.frame import DataFrame
    import yaml, pandas, numpy
    from sqlalchemy import create_engine, inspect
    def reshape_polygon_to_list(data):
        r = numpy.array(data['geometry'])
        r = ast.literal_eval(r.tolist())
        
        return r
    # создаем "подключение" к БД
    # def save_as_list(data):
    #     print(data, file=sys.stderr)
    #     print(type(data), file=sys.stderr)
    # подключаем конфиг
    config = yaml.safe_load(open(".config.yml"))
    # TODO закомментировать при сборке
    # engine = create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )
    # объявляем словарь для ответа
    answer = {"warnings": None, "errors": None}
    # Бежим по объектам
    if inspect(engine).has_table('sectors'):
        sectors_df = pandas.read_sql_query(
                "SELECT cell_zid, geometry FROM sectors;",
                con=engine
            )
        sectors_df['geometry'] = sectors_df.apply(reshape_polygon_to_list,axis=1)
        # sectors_df.apply(save_as_list,axis=1)
        answer['data'] = {}
        print(sectors_df['geometry'], file=sys.stderr)
        answer['data'].update({"sectors":sectors_df.to_json(orient='records')})
    else:
        answer.update({"errors": "No table 'sectors' was found or something else went wrong!"})
    
    return answer
        
    
    # return answer
if __name__ == "__main__":
    print(get_sectors())