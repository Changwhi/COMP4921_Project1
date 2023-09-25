const database = include('databaseConnection');

async function createUser(postData) {
	let createUserSQL = `
	INSERT INTO user
	(email, password, user_type_id)
	VALUES (:email, :passwordHash, 
	(SELECT user_type_id
	FROM user_type
	WHERE user_type = "user"));
	`;

	let params = {
		email: postData.email,
		passwordHash: postData.passwordHash
	}
	
	try {
		const results = await database.query(createUserSQL, params);

        console.log("Successfully created user");
		console.log(results[0]);
		return true;
	}
	catch(err) {
		console.log("Error inserting user");
        console.log(err);
		return false;
	}
}

async function getUsers(getData) {
	let getUsersSQL = `
		SELECT username, password, email, user_id, user_type_id
		FROM user;
	`;

	let params =  {

	}

	
	try {
		const results = await database.query(getUsersSQL);

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



module.exports = {createUser, getUsers };