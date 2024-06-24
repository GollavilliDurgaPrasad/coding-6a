const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'covid19India.db')

let db = null

const intilizeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000`)
    })
  } catch (e) {
    console.log(`Db Error ${e.message}`)
    process.exit(1)
  }
}

intilizeDatabaseAndServer()
const dbresponsetocamelcasess = dbobject => {
  return {
    districtId: dbobject.district_id,
    districtName: dbobject.district_name,
    stateId: dbobject.state_id,
    cases: dbobject.cases,
    cured: dbobject.cured,
    active: dbobject.active,
    deaths: dbobject.deaths,
  }
}

const dbresponsetocamelcase = dbobject => {
  return {
    stateId: dbobject.state_id,
    stateName: dbobject.state_name,
    population: dbobject.population,
  }
}

const dbresponsetocamelcases = dbobject => {
  return {
    stateId: dbobject.state_id,
    stateName: dbobject.state_name,
    population: dbobject.population,
  }
}

// GET the all states
app.get('/states/', async (request, response) => {
  const statequery = `
      select
       * 
       from
          state;`
  const resultArray = await db.all(statequery)
  response.send(resultArray.map(each => dbresponsetocamelcase(each)))
})
/// Get state using stateId

app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const sqlquery = `  SELECT * FROM state where state_id=${stateId};`
  const results = await db.get(sqlquery)
  response.send(dbresponsetocamelcases(results))
})
///Add thd district into the district table
app.post('/districts/', async (request, response) => {
  const details = request.body
  const {districtName, stateId, cases, cured, active, deaths} = details
  const query = ` INSERT INTO district (district_name, state_id, cases, cured, active, deaths)
  VALUES(
    '${districtName}',
     ${stateId},
     ${cases},
     ${cured},
     ${active},
     ${deaths}

  );`
  const dbresponse = await db.run(query)
  response.send('District Successfully Added')
})

///GET district using district Id
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = ` SELECT * FROM  district where district_id=${districtId}`
  const result = await db.get(query)
  response.send(dbresponsetocamelcasess(result))
})
///DELETE the district using district id
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = ` DELETE FROM district WHERE district_id=${districtId}`
  const dbresponse = await db.run(query)
  response.send('District Removed')
})
// update the district using districtId
app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const details = request.body
  const {districtName, stateId, cases, cured, active, deaths} = details
  const query = `UPDATE district SET 
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured= ${cured},
    active = ${active},
    deaths = ${deaths}
      ;`
  const dbresponse = await db.run(query)
  response.send('District Details Updated')
})
//api 7
app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const query = ` SELECT SUM(cases) SUM(cured) SUM(active) SUM(deaths) FROM  district WHERE state_id=${stateId}`
  const stats = await db.get(query)
  console.log(stats)
  response.send({
    totalCases: stats['SUM(cases)'],
    totalCured: stats['SUM (cured)'],
    totalActive: stats['SUM(active)'],
    totalDeaths: stats['SUM(deaths)'],
  })
})

//API 8
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getDistrictIdQuery = `
    select state_id from district
    where district_id = ${districtId};
    `
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery)
  const getStateNameQuery = `
    select state_name as stateName from state
    where state_id = ${getDistrictIdQueryResponse.state_id};
    `
  const getStateNameQueryResponse = await database.get(getStateNameQuery)
  response.send(getStateNameQueryResponse)
})

module.exports = app
