const { text } = require("express");

const mySqlDatabase = include('databaseConnectionSQL');

async function createText(textData) {
    let createTextSQL = `
    INSERT INTO text_info (text_title, text_content, text_UUID)
    VALUES (:text_title, :text_content, :text_uuid);
	`;

	let createUserTextLink = `
	INSERT INTO user_text_info (user_id, text_info_id)
	VALUES (:user_ID, LAST_INSERT_ID());
    `;

	let params = {
		text_title: textData.title,
		text_content: textData.content,
        text_uuid: textData.textUUID,
		user_ID : textData.user_ID
	}

	try {
		await mySqlDatabase.query(createTextSQL, params);
		await mySqlDatabase.query(createUserTextLink, params);
        console.log("Successfully created text!!!!!!!!!!!!!!!!!!");
		return true;
	}
	catch(err) {
        console.log("Error inserting text!!!!!!!!!!!!!!!!!!!");
        console.log(err);
		return false;
	}

}

async function getText(getData) {
	let getTextSQL = `
		SELECT text_title, text_content, text_UUID
		FROM user_text_info
		JOIN user
		ON user_text_info.user_id = user.user_id
		JOIN text_info
		ON user_text_info.text_info_id = text_info.text_info_id
        WHERE user.user_id = :user_ID;
	`;

	let params = {
		user_ID: getData.user_ID
	}

	try {
		const results = await mySqlDatabase.query(getTextSQL, params);

        console.log("Successfully retrieved text data");
		console.log(results[0]);
		return results[0];
	}
	catch(err) {
		console.log("Error getting text data");
        console.log(err);
		return false;
	}
}

module.exports = {createText, getText}