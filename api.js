const express = require('express')
const es = require('./es.js')
const app = express()
const db = new es()

const port = 80


const apiPrefix = '/api/v1'

app.listen(port, async () => {
	console.log('Connecting to elasticsearch...');
	await db.connect()
  console.log('Firelog started, listening to port ' + port);
});


app.get(apiPrefix + "/fires", (req, res, next) => {
	console.log("New fire query:", req.query)
	if(req.query.lat && req.query.lon ){
		const lat = req.query.lat
		const lon = req.query.lon
		const radius = parseInt(req.query.radius) || 5
		db.getFires(lat, lon, radius).then(fires=>{
			res.json(fires)
		}).catch(err=>{
			console.log(err)
 			res.json({'error':"Something wrong happend"});			
		})
	}else{
 		res.json({'error':"query parameters missing, should include 'lat', 'lon' and [optional] 'radius', default is 5 (km)"});
	}
});

// const start = async ()=>{
// 	new Promise((resolve,reject)=>resolve(null))
// }

// start().then(()=>{

// })