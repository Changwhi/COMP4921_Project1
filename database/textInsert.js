const { text } = require("express");

const mySqlDatabase = include('databaseConnectionSQL');

async function createText(textData) {
    let createTextSQL = `
    INSERT INTO text (text_title, text_content, text_UUID)
    VALUES (:text_title, :text_content, :text_uuid);
	`;

	let params = {
		text_title: textData.title,
		text_content: textData.content,
        text_uuid: textData.textUUID,
	}

	try {
		await mySqlDatabase.query(createTextSQL, params);
        console.log("Successfully created text!!!!!!!!!!!!!!!!!!");
		return true;
	}
	catch(err) {
        console.log("Error inserting text!!!!!!!!!!!!!!!!!!!");
        console.log(err);
		return false;
	}

}

async function getText() {
	let getTextSQL = `
		SELECT text_title, text_content, text_UUID
		FROM text
        WHERE (
		 SELECT user_id
         FROM user
         WHERE user_id = 1
		);
	`;

	try {
		const results = await mySqlDatabase.query(getTextSQL);

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