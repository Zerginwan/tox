#!flask/bin/python
from flask import Flask, request
from pymemcache.client.base  import PooledClient
from pymemcache.client.retrying import RetryingClient
from pymemcache.exceptions import MemcacheUnexpectedCloseError
from werkzeug.utils import send_file
import yaml, json
from get_doc import get_doc
from workload_oracle import workload_oracle 
from get_sectors import get_sectors 


config = yaml.safe_load(open(".config.yml"))

# cache = MemcachedCache(['%s:%s'%(config['memcached']['host'],config['memcached']['port'])])

# запускаем app
app = Flask(__name__)
# подключаем кэш
base_client = PooledClient(
                (config['memcached']['host'],config['memcached']['port']), 
                max_pool_size = config['memcached']['max_pool_size'],
                no_delay=True)
# ретрай кэша
client = RetryingClient(
    base_client,
    attempts=3,
    retry_delay=0.01,
    retry_for=[MemcacheUnexpectedCloseError]
)

# # /py открыта всем
@app.route('/py/sectors', methods=['GET','POST'])
def external():
    if request.method == 'GET':
        answer = client.get('sectors')
        if answer is None:
            answer = get_sectors()
        client.set('sectors', answer)
        return answer

# /internal недоступна извне
@app.route('/internal', methods=['POST'])
def internal():
    if request.method == 'POST':
        
            args = []
            args.append(request.json['object_type_id'])
            args.append(request.json['year'])
            args.append(request.json['additional_objects'])
            # if len(args) < 4:
                # answer = client.get(str(args).replace(' ',''))
            # if answer is None:
            answer = workload_oracle(**request.json)
            # if len(args) < 4:    
                # client.set(str(args).replace(' ',''), answer)

            # rv = cache.get('my-item')
            # cache.set('my-item', rv, timeout=config['memcached']['expiration'])

            return answer
        

@app.route('/py/report', methods=['POST'])
def report():
    if request.method == 'POST':
        try:
            answer = get_doc(**request.json)
            return answer
        except Exception as e:
            return str(e)

@app.route('/py/report/<file>', methods=['GET'])
def get_report(file):
    return send_file('./temp_files/%s' % file)

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=80,debug=False)