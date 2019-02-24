## FireLog - fire satellite data on demand
This project was created during the hackathon "Fenixhack" in Loulé, Portugal

### How to read run it
Install docker-compose and run `docker-compose up`
This will start three containers: elasticsearch, api and cron. The cron job will run every 10 minutes to fetch the satellite data and save it into elasticsearch.

### API
The api has only one endpoint, /api/v1/fires?lat={lat}&lon={lon}&radius={radius in km}
