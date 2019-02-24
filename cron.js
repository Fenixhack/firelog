const es = require('./es.js')
const axios = require('axios')
const csv=require('csvtojson')
const crypto = require('crypto');
const satellites = require('./satellites')
var CronJob = require('cron').CronJob;

const db = new es()
 

const getSatData = async (sat)=>{
	console.log("Downloading data for satellite " + sat.name);
	const csvFile = (await axios.get(sat.url)).data
	console.log("Downloading finished for satellite " + sat.name);
	const satData = await csv().fromString(csvFile)
	.then(arr=>{
		console.log("Cleaning data for satellite  " + sat.name);
		const cleanArr = arr.map(dat=>{
			const fire = {location:{}}
			fire.location.lat = parseFloat(dat.latitude)
			fire.location.lon = parseFloat(dat.longitude)
			fire.daynight = dat.daynight
			fire.date = new Date(dat.acq_date + "T" + dat.acq_time.substr(0,2) + ":" + dat.acq_time.substr(2) +":00")
			fire.brightness = {
				bright:dat.brightness?parseFloat(dat.brightness):0,
				bright_ti4:dat.bright_ti4?parseFloat(dat.bright_ti4):0,
				bright_ti5:dat.bright_ti5?parseFloat(dat.bright_ti5):0,
				bright_t31:dat.bright_t31?parseFloat(dat.bright_t31):0
			}
			fire.scan = parseFloat(dat.scan)
			fire.track = parseFloat(dat.track)
			fire.satellite = sat.name + "-" + dat.satellite
			fire.confidence = dat.confidence
			fire.version = dat.version
			fire.frp = parseFloat(dat.frp)
			return fire
		})
		return cleanArr
	})
	return satData
}

const getAllSatData = async (sats) =>{
	let allData = []
	for (let i = 0; i < sats.length; i++) {
		const sat = sats[i]
		const satData = await getSatData(sat)
		allData = allData.concat(satData)
	}
	return allData
}


const indexToEs = async (satsData)=>{
	console.log("Creating bulk data");
	const bulkData = []
	satsData.forEach(dat=>{
		const id = crypto.createHmac('sha256', 'secret str')
        		 .update("d.satellite" + dat.location.lon.toString() + dat.location.lat.toString() + dat.date.toString())
             .digest('hex');
    bulkData.push({ "create" : { "_index" : "fires", "_type" : "_doc", "_id" : id } })
		bulkData.push(dat)
	})
	console.log("Indexing bulk data to Elasticsearch");
	const resp = await db.bulk(bulkData)
	console.log("Finished indexing");
	return new Promise((resolve,reject)=>resolve(resp))
}

const start = async ()=>{
	await db.connect()
	const satsData = await getAllSatData(satellites)
	return await indexToEs(satsData)
}

// Default = every 10 minutes
const cronMinutes = process.env.CRON_MINUTES?process.env.CRON_MINUTES:10

new CronJob(`0 */${cronMinutes} * * * *`, async () => {
	console.log('Starting cron job');
  await start()
	console.log('Finished cron job');
}, null, true);