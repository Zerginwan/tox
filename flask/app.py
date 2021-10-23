#!flask/bin/python
from flask import Flask, request
import yaml
from workload_oracle import workload_oracle 

config = yaml.safe_load(open(".config.yml"))

# cache = MemcachedCache(['%s:%s'%(config['memcached']['host'],config['memcached']['port'])])


app = Flask('flask')

# /py открыта всем
@app.route('/py/magic', methods=['GET','POST'])
def external():
    if request.method == 'GET':
        return request.args.get('type')
    if request.method == 'POST':
        data = request.get_json()
        return data

# /internal недоступна извне
@app.route('/internal', methods=['GET','POST'])
def internal():
    if request.method == 'GET':
        return request.args.get('type')
    if request.method == 'POST':
        
        # rv = cache.get('my-item')
        # cache.set('my-item', rv, timeout=config['memcached']['expiration'])
        
        data = request.get_json()
        return data


if __name__ == '__main__':
    app.run(debug=True)