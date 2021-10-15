from os.path import basename, splitext
import yaml, pandas, sys, sqlalchemy, json
from sqlalchemy import *
##
# Скрипт заточен под формат с data.mos.ru
##

# подключаем конфиг
config = yaml.safe_load(open(".config.yml"))


# создаем "подключение" к БД
engine = create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )


# Функция возвращает словарь колонка:тип_данных_sql_alchemy для  указанного DataFrame
def get_args_for_table_from_column_names(data):

    dtypedict = {}
    for i,j in zip(data, data.dtypes):
        if "object" in str(j) or "str" in str(j):
            dtypedict.update({i: sqlalchemy.types.VARCHAR(length=255)})
                                 
        if "datetime" in str(j):
            dtypedict.update({i: sqlalchemy.types.DateTime()})

        if "float" in str(j):
            dtypedict.update({i: sqlalchemy.types.Float(precision=14, asdecimal=True)})

        if "int" in str(j):
            dtypedict.update({i: sqlalchemy.types.INT()})

    return dtypedict
# узнаем id квадрата, в котором находится объект
# data - DataFrame с таблицей coordinates 
def get_zid(coordX,coordY,data):
    zid = int(data.query("min_x < @coordX < max_x and min_y < @coordY < max_y").iloc[0]['cell_zid'])
    return zid

def main(args):
    json_path = args[0]
    table_name = splitext(basename(json_path))[0]
    try:
        with open(json_path) as json_file:
            list = json.load(json_file)
    except IOError as e:
        print('File not found')
        exit()
    coordinates_dt = pandas.read_sql('select * from coordinates', index_col=['min_x','min_y','max_x','max_y'] ,con=engine)
    
    columns = args[1:]
    dt = []
    for item in list:
        row = {}
        for column in columns:
            row[column] = item[column]
        row['coorX'] = item['geodata_center']['coordinates'][0]
        row['coorY'] = item['geodata_center']['coordinates'][1]
        row['zid'] = get_zid(row['coorX'], row['coorY'], coordinates_dt)
        dt.append(row)
    
    if not inspect(engine).has_table(table_name):
        # создаем список аргументов для sqlalchemy, разбирая типы даных data
        dt = pandas.DataFrame(dt)
        args_for_table = get_args_for_table_from_column_names(dt)
        # Создаем таблицу. 
        dt.to_sql(table_name, engine, if_exists='append', index=False, method='multi', dtype=args_for_table)
        


    

            




if __name__ == "__main__":
    ## передаем путь к json в качестве первого  параметра. Передаем название полей, которые хотим видеть в качестве желаемых колонок таблицы
    if sys.argv[1]:
        main(sys.argv[1:])
    else:
        print('Give me path to json as argument!')