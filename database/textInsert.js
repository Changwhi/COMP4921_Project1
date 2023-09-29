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
		const results = await mySqlDatabase.query(createTextSQL, params);

        console.log("Successfully created text!!!!!!!!!!!!!!!!!!");
		console.log(results[0]);
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
		FROM text;
	`;

	try {
		const results = await mySqlDatabase.query(getTextSQL);

        console.log("Successfully retrieved users");
		console.log(results[0]);
		return results[0];
	}
	catch(err) {
		console.log("Error getting users");
        console.log(err);
		return false;
	}
}

module.exports = {createText, getText}