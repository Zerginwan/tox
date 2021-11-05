from sqlalchemy.sql.expression import column, table


import ast


def get_doc(id:int, zone_type: str = 'adm_zone', object_type_id_list: list[int] = [1,2] ):
    '''
    Функция возвращет файл с отчетом 
    
    id - cell_zid или ОКАТО объекта
    
    zone_type - тип зоны. 'sector'||'adm_zone'||'okrug'.

    object_type_id_list - список с id типов объектов, по которым нужно составить записку.

    '''
    from pandas.core.frame import DataFrame
    import yaml, pandas, markdown, os
    from sqlalchemy import create_engine, inspect
    import datetime
    from pathlib import Path
    from string import Template
    from docx import Document
    from htmldocx import HtmlToDocx
    from sqlalchemy.sql.expression import text

    now = datetime.datetime.now()
    year = now.year
    # создаем "подключение" к БД
    # подключаем конфиг
    config = yaml.safe_load(open(".config.yml"))
    # TODO закомментировать при сборке
    # engine = create_engine("postgresql://{username}:{password}@{host}:{port}/{database}".format(**config['db']) )
    # объявляем словарь для ответа
    answer = {"warnings": None, "errors": None}

    if zone_type == 'sector':
        docx_path_file = '%i.docx' % id
    else:
        docx_path_file = '%s_%i.docx' % (zone_type, id)
    docx_path = './temp_files/' + docx_path_file
    if Path(docx_path).is_file():
        os.remove(docx_path)

    weight_dict = pandas.read_sql_query(
                    "SELECT * FROM affinity_indexes ORDER BY id ASC;" , 
                    con=engine
                ).to_dict('records')
    report_config = pandas.read_sql_query(
                    "SELECT * FROM reports ORDER BY id ASC;", 
                    con=engine
                )
    object_config = pandas.read_sql_query(
                    "SELECT * FROM objects ORDER BY id ASC;", 
                    con=engine
                )
    

    head_config = {
        "zone_type_display": report_config.query('value == @zone_type')['zone_type_display'].values[0],
        "okato_or_index": id,
        "addon_after_id": report_config.query('value == @zone_type')['addon_after_id'].values[0],
        "name": ''
    }
    if zone_type != 'sector':
        name = engine.execute(text("SELECT	{} AS name FROM adm_zones WHERE {} = {}".format(report_config.query('value == @zone_type')['column_with_name'].values[0], report_config.query('value == @zone_type')['column_with_id'].values[0], id)  )).fetchone()['name']
        head_config.update({"name": name})
        
    final_template = Template(Path('templates/report_head.md').read_text(encoding='utf-8')).substitute(**head_config)
    for object_type_id in object_type_id_list:
        if not (object_config.query('id == @object_type_id')['range_type'].values[0] != 'range' and zone_type == 'sector'):

            final_template += '\n'
            if Path('templates/%i.md' % object_type_id).is_file():
                column = report_config.loc[report_config['value'] == zone_type , 'column_with_id'].values[0]
                o_config = {"index_pop_display": engine.execute(text("SELECT a.display AS display FROM affinity_indexes AS a JOIN preset_%i_2021_%ss AS p ON p.%s = %i AND p.index_pop = a.id" % (object_type_id, zone_type, column, id) )).fetchone()['display'] }
                final_template += Template(Path('templates/%i.md' % object_type_id).read_text(encoding='utf-8')).substitute(**o_config)
            else:
                if not isinstance(answer['warnings'], list):
                    answer['warnings'] = []
                answer['warnings'].append('Warning! File templates/%i.md not found. Can\'t create template for object_type with name %s ' % (object_type_id, ))

    document = Document()
    new_parser = HtmlToDocx()
    new_parser.add_html_to_document(markdown.markdown(final_template), document)
    document.save(docx_path)
    answer['data'] = '/py/report/' + docx_path_file
    return answer
    
    # return answer
if __name__ == "__main__":
    print(get_doc(id=45263000, zone_type='okrug'))