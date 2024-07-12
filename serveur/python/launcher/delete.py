from elasticsearch import Elasticsearch
es = Elasticsearch([{'host':'localhost', 'port':'9200'}])
es.indices.delete(index='ivoa_all_temp_mails', ignore=[400, 404])
es.indices.delete(index='ivoa_all_new_mails', ignore=[400, 404])
es.indices.put_settings(index="_all", body={ "index.blocks.read_only_allow_delete": "false"})


