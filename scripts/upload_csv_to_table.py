from posixpath import basename
from os.path import basename, splitext
import yaml, pandas, sys
import sqlalchemy
from sqlalchemy import *

# подключаем конфиг
config = yaml.safe_load(open(".config.yml"))


# создаем "подключение" к БД
engine = create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )


# Функция возвращает словарь колонка:тип_данных_sql_alchemy для  указанного DataFrame
def get_args_for_table_from_column_names(data):

    dtypedict = {}
    for i,j in zip(data.columns.tolist(), data.dtypes):
        if "object" in str(j) or "str" in str(j):
            dtypedict.update({i: sqlalchemy.types.VARCHAR(length=255)})
                                 
        if "datetime" in str(j):
            dtypedict.update({i: sqlalchemy.types.DateTime()})

        if "float" in str(j):
            dtypedict.update({i: sqlalchemy.types.Float(precision=6, asdecimal=True)})

        if "int" in str(j):
            dtypedict.update({i: sqlalchemy.types.INT()})

    return dtypedict

def main(csv_path):
    try:
        # sep - разделитель в csv 
        # header - строка с названиями хэдеров
        # пропускать пустые строки
        data = pandas.read_csv(csv_path,sep=',',header=0,skip_blank_lines=True)
        table_name = splitext(basename(csv_path))[0]
    except IOError as e:
        print('File not found')
    
    # если нет такой таблицы, создаем ее
    # таблица называется так же, как назван csv-файл.
    if not inspect(engine).has_table(table_name):
        # создаем список аргументов для sqlalchemy, разбирая типы даных data
        args_for_table = get_args_for_table_from_column_names(data)
        # Создаем таблицу. Если такая уже есть - добавляем к ней данные
        print(args_for_table)
        data.to_sql(table_name, engine, if_exists='append', index=False, method='multi', dtype=args_for_table)
        





if __name__ == "__main__":
    ## передаем путь к csv в качестве первого и единственного параметра.
    if sys.argv[1]:
        main(sys.argv[1])
    else:
        print('Give me path to csv as argument!')


