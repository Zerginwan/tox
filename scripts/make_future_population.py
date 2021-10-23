from pandas.core.frame import DataFrame
import yaml, pandas
from sqlalchemy import *
##
#
# Скрипт для генерации таблиц будущего населения
#
##

# подключаем конфиг
config = yaml.safe_load(open(".config.yml"))


# создаем "подключение" к БД
engine = create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )

# словарь с запросами на соседа
apply_dict = {2022:1.003993,2023:1.00735,2024:1.009902,2025:1.011821,2026:1.013079,2027:1.013888,2028:1.014465,2029:1.014871,2030:1.015149,2031:1.015317,2032:1.015392,2033:1.01543,2034:1.015481,2035:1.015791,2036:1.015797}
table_list = ["2021_CLocation","2021_Location"]

# бежим по имеющимся таблицам
for table in table_list:
    
    table_postfix = table.split('_')[1]
    print(table_postfix)
    # загружаем таблицу в датафрейм
    table_data = pandas.read_sql_query(
                "SELECT * FROM \"%s\";" % table, 
                con=engine
            )
    # Бежим по словарю с мультипликатором
    for year in apply_dict:
        print(year)
        result_table_name = str(year) + '_' + table_postfix
        # проверяем, что нет такой таблицы
        if not inspect(engine).has_table(result_table_name):
            columns = table_data.columns.tolist()
            result_data = DataFrame()
            indexed_labels = []
            # бежим по всем колонкам без "zid" в названии
            for column in columns:
                if "zid" not in column:
                    result_data[column] = table_data[column] * apply_dict[year]
                    result_data[column] = result_data[column].astype(int)
                else:
                    result_data[column] = table_data[column]
                    indexed_labels.append(column)
            print(result_data)
            result_data.to_sql(result_table_name, engine, if_exists='append', method='multi')
        else:
            print('Table %s exists already' % result_table_name)
