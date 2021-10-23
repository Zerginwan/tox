from os.path import basename, splitext
import yaml, pandas, sys, openpyxl, sqlalchemy
from sqlalchemy import *

# итоговая таблица
table_name = 'neighbours'
# таблица с нужными ячейками
table_name_from = 'adm_zones'
# координаты
table_name_coordinates = 'coordinates'
# подключаем конфиг
config = yaml.safe_load(open(".config.yml"))


# создаем "подключение" к БД
engine = create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )

# словарь с запросами на соседа
neighbours_rules = {
    # up-left
    "neighbour_1": "min_x == @r_max_x and max_y == @r_min_y ",
    # up
    "neighbour_2": "min_x == @r_max_x and max_y == @r_max_y ",
    # up-right
    "neighbour_3": "min_x == @r_max_x and min_y == @r_max_y ",
    # left
    "neighbour_4": "min_x == @r_min_x and max_y == @r_min_y ",
    # right
    "neighbour_5": "min_x == @r_min_x and min_y == @r_max_y ",
    # down-left
    "neighbour_6": "max_x == @r_min_x and max_y == @r_min_y ",
    # down
    "neighbour_7": "max_x == @r_min_x and max_y == @r_max_y ",
    # down-right
    "neighbour_8": "max_x == @r_min_x and min_y == @r_max_y "
}
# функция для генерации типовстолбцов в таблице. всем float, кроме cell_zid
def get_dtype():
    dtype = {
        'cell_zid': sqlalchemy.types.INT()
    }
    for rule_name in neighbours_rules:
        dtype.update({rule_name: FLOAT(precision=14, asdecimal=True)})
    return dtype

def main():
    # проверяем, что етсь такая таблица
    if not inspect(engine).has_table(table_name):
        # грузим интересующие нас клетки.
        data = pandas.read_sql_query(
            "SELECT * FROM %s WHERE cell_zid IN (SELECT DISTINCT cell_zid FROM %s )" % (table_name_coordinates, table_name_from), 
            con=engine
        )
        # новый список - из него потом сделаем таблицу
        dt = []
        # пробегаем по строкам с клетками
        for ser in data.iterrows():
            row = {"cell_zid": int(ser[1]['cell_zid'])}
            r_max_x = ser[1]['max_x']
            r_max_y = ser[1]['max_y']
            r_min_y = ser[1]['min_y']
            r_min_x = ser[1]['min_x']
            # пробегаем по правилам и находим соседей. Включаем соседей в строку
            for rule_name in neighbours_rules:
                row[rule_name] = data.query(neighbours_rules[rule_name]).iloc[0]['cell_zid']
            # добавляем строку в новый список
            dt.append(row)
        # превращаем список в датафрейм
        dt = pandas.DataFrame(dt)
        # пишем датафрейм в таблицу
        dt.to_sql(table_name, engine, if_exists='append', index=False, index_label='cell_zid', method='multi', dtype=get_dtype())
    else:
        print('Table %s exists already' % table_name)

if __name__ == "__main__":
        main()

