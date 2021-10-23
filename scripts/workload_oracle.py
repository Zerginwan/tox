def workload_oracle(object=XX, object_id=XX, sector_id=XX):
    '''
    object - переменная содержащая датасет объекта, по которому считаются требования (mfc или polyclinic_child),
            
    object_id - номер конкретного объекта (или список номеров), по которому ведется поиск, по умолчанию 0. 
                Варианты: 0, 1 сектор, список секторов, все сектора.
    
    sector_id - номер/-а секторов, по которым ведется поиск, по умолчанию 0.
                Варианты: 0, 1 объект, список объектов, все объекты.
    '''

    # в дальнейшем строка цикла превращается в наличие объекта в списке, 
    # осторитрованного по требованиям к объекту:
    #    - требования по нахождению в районе;
    #    - требования по дистанции доступности и количеству населения, на покрытой территории
    
    if object == 'mfc':
        
    # здесь будет короткий цикл из двух тел на поиск номеров    
        
    else object == 'polyclinic_child':
        answer = {}    
        
        # если требований по секторам нет
        if sector_id == 0:
            
            # перебираем значения в списке объектов
            for id in object_id:
            
                # объявляем переменную для подсчета охваченного населения
                total_pop = 0
                
                # определяем занятый объектом сектор
                object_sector = object.query('index == id')['zid']
                
                # создаем переменную, которую заполняем номерами секторов покрытия
                workload_range = moscow_fishnet.loc[moscow_fishnet['cell_zid'] == object_sector]['cross']
            
                # пробегаем по всем секторам, охваченным объектом, чтобы наполнить total_pop
                for sector in workload_range:
                    total_pop += int(pop_data[pop_filter])
        
                for object in objects_list:
               
                    # список секторов, охваченных объектом
                    terr_list = []
        
                    # количество населения в охваченных секторах, для расчета норматива
                    total_pop = 0
              
                    for terr in terr_list:
                        total_pop += int(2021_CLocation.query('cell_zid == terr')['customers_cnt_home'])
        
                        # расчитываем соответствие фактического населения требованиям
                        # требования к объектам хранятся в object_req и фильтруются по типу объекта
                        # формируем требования по населению 
        
                        pop_req = object_req.query('type == @object')['pop']
        
                        # и соотношение фактического населения и требования
        
                        req_pop_filter = total_pop / pop_req
        
                        if req_pop_filter >= pop_req * 1.2:
                            answer['score_of_object' + id] = 0
                        elif req_pop_filter >= pop_req * 0.96:
                            answer['score_of_object' + id] = 1
                        elif req_pop_filter >= pop_req * 0.71:
                            answer['score_of_object' + id] = 2
                        elif req_pop_filter >= pop_req * 0.31:
                            answer['score_of_object' + id] = 3
                        else:
                            answer['score_of_object' + id] = 4
        
        # если же список секторов не пуст    
        else:
            for id in sector_id:
            
                # определяем переменную для подсчета охваченного населения
                total_pop = 0
                
                # находим объект, расположенный в секторе
                object_sector = object.query('zid == id')['zid']
                if object_sector is not None:
                    # список секторов из ренджа    
                    # TODO make_cross()
                    workload_range = moscow_fishnet.loc[moscow_fishnet['cell_zid'] == object_sector]['cross']
            
                    # пробегаем по всем секторам, охваченным объектом, чтобы наполнить total_pop
                    for sector in workload_range:
                        total_pop += int(pop_data[pop_filter])
        
                    for object in objects_list:
               
                        # список секторов, охваченных объектом
                        terr_list = []
        
                        # количество населения в охваченных секторах, для расчета норматива
                        total_pop = 0
              
                        for terr in terr_list:
                            total_pop += int(2021_CLocation.query('cell_zid == terr')['customers_cnt_home'])
        
                            # расчитываем соответствие фактического населения требованиям
                            # требования к объектам хранятся в object_req и фильтруются по типу объекта
                            # формируем требования по населению 
        
                            pop_req = object_req.query('type == @object')['pop']
        
                            # и соотношение фактического населения и требования
        
                            req_pop_filter = total_pop / pop_req
        
                            if req_pop_filter >= pop_req * 1.2:
                                answer['score_of_object' + id] = 0
                            elif req_pop_filter >= pop_req * 0.96:
                                answer['score_of_object' + id] = 1
                            elif req_pop_filter >= pop_req * 0.71:
                                answer['score_of_object' + id] = 2
                            elif req_pop_filter >= pop_req * 0.31:
                                answer['score_of_object' + id] = 3
                            else:
                                answer['score_of_object' + id] = 4 
                
                # если в секторе нет объектов, дополняем ответ указанием номера пустого сектора
                
                except:
                    answer['empty_sectors'].append(id)
            
            # возвращаем ответ    
                   
            return answer
