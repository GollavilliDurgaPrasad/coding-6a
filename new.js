///GET district using district Id
app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const query = ` SELECT * FROM  district where district_id=${districtId}`
  const result = await db.get(query)
  response.send(dbresponsetocamelcasess(result))
})
