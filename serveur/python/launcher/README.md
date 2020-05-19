How to wrote the config.json :
"download_uri" : it's the uri of the link where to download mbox files.

Example for ivoa.net mbox archives : "http://mail.iova.net/pipermail/"

"elastic_search_url" : it's the url where elastic search is hosted

Example for my localhost Elastic Search : "http://localhost:9200"

"mbox_dir" : it's the absolute path of the folder where you want to download the mbox archives

Example for my case : "/home/enzo/Bureau/grimoire/vo-grimoire/serveur/python/mbox"

"mailing_lists" : it's the array of all the mailing lists that you want to index

Example for "Data Model" mailing list :
{
  "label":"Data Model",
  "index_name":"dm",
  "prefix":"dm_",
  "download_mbox":"edu.mbox/edu.mbox"
}
