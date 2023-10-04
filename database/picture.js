
const mySqlDatabase = include('databaseConnectionSQL');

async function insertImage(data) {
  try {
    // let dateSQL = `select curdate()`
    // let date = await mySqlDatabase.query(dateSQL)
    // console.log(date)
    let insertImageSQL = `
      UPDATE picture_info
      SET link = :link, public_id = :public_id
      WHERE picture_UUID = :picture_UUID;
    `;

    let params = {
      link: data.link,
      // created: date[0][0]['curdate()'],
      public_id: data.public_id,
      picture_UUID: data.picture_UUID,
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

async function addColumn(data) {
  try {
    // let dateSQL = `select curdate()`
    // let date = await mySqlDatabase.query(dateSQL)
    let uuidSQL = `select uuidGenerator()`;
    let uuid = await mySqlDatabase.query(uuidSQL);
    console.log(uuid[0][0]['uuidGenerator()'])

    let insertImageSQL = `
    INSERT INTO picture_info(name, picture_UUID, user_id, comment)
    VALUES (:name,:picture_UUID,:user_id, :comment);
	`;

    let params = {
      name: data.name,
      user_id: data.user_id,
      comment: data.comment,
      picture_UUID: uuid[0][0]['uuidGenerator()'],
    }

    await mySqlDatabase.query(insertImageSQL, params);
    console.log("Successfully created column");
    return true;
  }
  catch (err) {
    console.log("Error adding column");
    console.log(err);
    return false;
  }

}

async function getColumn(data) {
  try {
    // let dateSQL = `select curdate()`
    // let date = await mySqlDatabase.query(dateSQL)
    let insertImageSQL = `
    SELECT * from picture_info where user_id = ?`;
    let params = [data.user_id]
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

module.exports = { insertImage, getImage, addColumn, getColumn }

