/*
    this file will hold Schema definitions and naming convension is like
    module.exports.<database> - this property should match with database definition provided in 
    configuration file /config/common/properties.js
*/
module.exports = {
    default: {
        base: {
            super: 'none',
            model: false,
            service: false,
            definition: {
                code: {
                    type: 'String',
                    unique: true,
                    required: true
                },
                creationDate: { 
                    type: 'Date', 
                    default: new Date(+new Date() + 7*24*60*60*1000)
                },
                updatedDate: { 
                    type: 'Date', 
                    default: new Date(+new Date() + 7*24*60*60*1000)
                },
                testProperty: {
                    type: 'String',
                    default: 'Dwivedi Himkar'
                }
            }
        }
    }
}