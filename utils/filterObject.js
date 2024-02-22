//filtering the object i.e. Req body from the user to prevent attacks

const filterObject = (obj, ...allowedFields) => {
    const newObject = {};
    Object.keys(obj).forEach((el) => {
        if(allowedFields.includes(el)) newObject[el] = obj[el];
    })
    return newObject;
}


module.exports = filterObject;