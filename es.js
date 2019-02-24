const elasticsearch = require('elasticsearch');

module.exports = function() {
	let client = undefined

	this.connect = async () =>{
	  client = new elasticsearch.Client({
	      host: process.env.ELASTIC_URL?process.env.ELASTIC_URL:'localhost:9200',
	      timeout: 30000,
	      requestTimeout: 30000
	      // log: 'trace'
	  })

  	// Create fires index if it does not already exists
  	return this.createIndex('fires',{
  		"properties": {
        "location": {
          "type": "geo_point"
        }
      }
  	})
	}

  //this function will create an index with mappings
  this.createIndex = async (index, mapping) => {
    const exists = await client.indices.exists({index})
    if(!exists){
      console.log(index + " index does not exist, creating..")
    	await client.indices.create({index})
    	console.log('Adding mappings to index ' + index);
    	return client.indices.putMapping({
				index: index,
        type: "_doc",
        body: mapping
      });
    }else{
    	return new Promise((resolve,reject)=>resolve(null))
    }
  }
  this.bulk = async (bulkArray)=>{
  	return client.bulk({body:bulkArray})
  }

	this.getFires = async (lat, lon, radius) =>{

		const res = await client.search({
		  index: 'fires',
		  body: {
		    "query": {
		        "bool" : {
		            "must" : {
		                "match_all" : {}
		            },
		            "filter" : {
		                "geo_distance" : {
		                    "distance" : radius + "km",
		                    "location" : {
		                        "lat" : lat,
		                        "lon" : lon
		                    }
		                }
		            }
		        }
		    }
			}
		});

		return res.hits.hits.map(f=>f._source)
	}
}

