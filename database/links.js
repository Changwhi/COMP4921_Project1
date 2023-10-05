
const mySqlDatabase = include('databaseConnectionSQL');

async function addURL(data) {
  try {
    let dateSQL = `select curdate()`
    let date = await mySqlDatabase.query(dateSQL)
    console.log(date[0][0]['curdate()'])
    let uuidSQL = `select uuidGenerator()`;
    let uuid = await mySqlDatabase.query(uuidSQL);
    console.log('generated ', uuid[0][0]['uuidGenerator()'])

    let insertImageSQL = `
    INSERT INTO links(original_url,short_url_uuid,created,active,hits,last_hit,user_id)
    VALUES (:original_url,:short_url_uuid, DATE(NOW()),:active,:hits,:last_hit,:user_id);
	`;

    let params = {
      original_url: data.url,
      short_url_uuid: uuid[0][0]['uuidGenerator()'],
      //created: date[0][0]['curdate()'],
      active: 1,
      hits: 0,
      last_hit: null,
      user_id: data.user_id,
    }

    await mySqlDatabase.query(insertImageSQL, params);
    console.log("Successfully created URL");
    return true;
  }
  catch (err) {
    console.log("Error inserting URL");
    console.log(err);
    return false;
  }
}


async function getURL(data) {
  try {
    let insertImageSQL = `
    SELECT original_url from links where short_url_uuid= ?`;
    let params = [data.uuid]
    let responseData = await mySqlDatabase.query(insertImageSQL, params);
    console.log("Successfully retrieved column");
    return responseData;
  }
  catch (err) {
    console.log("Error retrieving column");
    console.log(err);
    return false;
  }
}

async function getListOfURL(data) {
  try {
    let insertImageSQL = `
    SELECT * from links where user_id = ?`;
    let params = [data.user_id]
    let responseData = await mySqlDatabase.query(insertImageSQL, params);
    console.log("Successfully retrieved links");
    return responseData;
  }
  catch (err) {
    console.log("Error retrieving links");
    console.log(err);
    return false;
  }
}


module.exports = { addURL, getListOfURL, getURL }

