
const mySqlDatabase = include('databaseConnectionSQL');

async function insertImage(data) {

  try {

    let uuidSQL = `select uuidGenerator()`;
    let uuid = await mySqlDatabase.query(uuidSQL);
    console.log(uuid[0][0]['uuidGenerator()'])

    let dateSQL = `select curdate()`
    let date = await mySqlDatabase.query(dateSQL)
    console.log(date)
    let insertImageSQL = `
    INSERT INTO picture_info(link, picture_UUID,created)
    VALUES (:link, :picture_UUID,:created);
	`;

    let params = {
      link: data.link,
      picture_UUID: uuid[0][0]['uuidGenerator()'],
      created: date[0][0]['curdate()'],
    }

    await mySqlDatabase.query(insertImageSQL, params);
    console.log("Successfully created image");
    return true;
  }
  catch (err) {
    console.log("Error inserting image");
    console.log(err);
    return false;
  }

}

async function getImage(user_id) {
  let getImageSQL = `
		SELECT picture_id,link, picture_UUID
		FROMpicture_info
        WHERE (
		 SELECT user_id
         FROM user
         WHERE user_id = currentUser
		)
    value (:currentUser)
	`;

  let params = {
    currentUser: user_id,
  }

  try {
    const results = await mySqlDatabase.query(getImageSQL, params);

    console.log("Successfully retrieved image data");
    console.log(results[0]);
    return results[0];
  }
  catch (err) {
    console.log("Error getting image data");
    console.log(err);
    return false;
  }
}

module.exports = { insertImage, getImage }

