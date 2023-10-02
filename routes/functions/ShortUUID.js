const { v4 } = require("uuid");

function ShortUUID() {
    const hexString = v4();
    console.log("hex:   ", hexString);
    // remove hyphen
    const hexStringUndecorated = hexString.replace(/-/g, "");
    
    const base64String = Buffer
      .from(hexStringUndecorated, 'hex')
      .toString('base64url')
    console.log("base64:", base64String);
    
    return base64String;
}


module.exports = {ShortUUID}