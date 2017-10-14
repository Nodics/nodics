/*
    this file will hold Schema definitions and naming convension is like
    module.exports.<database> - this property should match with database definition provided in 
    configuration file /config/common/properties.js
*/
module.exports = {
    //Database name
    user: {
        //Collection name
        user: {
            super: 'base',
            model: true,
            service: true,
            definition: {
                firstName: "String",
                lastName: "String",
                name: {
                    type: "String",
                    default: 'Himkar Dwivedi'
                }
            }
        },
        person: {
            super: 'user',
            model: true,
            service: true,
            definition: {
                displayName: "String"
            }
        }
    }
}