from os.path import basename, splitext
import yaml, pandas, sys, openpyxl, sqlalchemy
from sqlalchemy import *

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

def main(csv_path):
    try:
        # Если csv:
        # sep - разделитель в csv 
        # header - строка с названиями хэдеров
        # пропускать пустые строки
        if splitext(csv_path)[1] == '.csv':
            data = pandas.read_csv(csv_path,sep=',',header=0,skip_blank_lines=True)
        # Если xlsx:    
        # читаем только первую страницу
        elif splitext(csv_path)[1] == '.xlsx':
            data = pandas.read_excel(csv_path,header=0, engine='openpyxl')
        table_name = splitext(basename(csv_path))[0]
    except IOError as e:
        print('File not found')
        exit()
    
    # если нет такой таблицы, создаем ее
    # таблица называется так же, как назван csv-файл.
    if not inspect(engine).has_table(table_name):
        # создаем список аргументов для sqlalchemy, разбирая типы даных data
        args_for_table = get_args_for_table_from_column_names(data)
        # Создаем таблицу. 
        data.to_sql(table_name, engine, if_exists='append', index=False, method='multi', dtype=args_for_table)
    else:
        print('Table %s exists already' % table_name)
        





if __name__ == "__main__":
    ## передаем путь к csv/xlsx в качестве первого и единственного параметра.
    if sys.argv[1]:
        main(sys.argv[1])
    else:
        print('Give me path to csv as argument!')


