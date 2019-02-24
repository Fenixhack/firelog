## FireLog - fire satellite data on demand
This project was created during the hackathon "Fenixhack" in Loulé, Portugal

### How to read run it
Install docker-compose and run `docker-compose up`  
This will start three containers: elasticsearch, api(port 80) and cron. The cron job will run every 10 minutes to fetch the satellite data and save it into elasticsearch.

Elasticsearch will not function after first run, run these two commands and restart the container:  
`sudo chmod -R 777 elastic-data/`  
`sudo sysctl -w vm.max_map_count=262144`

### API
The api has only one endpoint, /api/v1/fires?lat={lat}&lon={lon}&radius={radius in km}
