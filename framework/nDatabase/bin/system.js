module.exports = {
    validateDatabaseConfiguration: function(dbName){
        var flag = true;
        if(!dbName){
            dbName = 'default';
        }
        if(!CONFIG.database){
            console.error('Databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }
        if(!CONFIG.database[dbName]){
            console.error('Default databse configuration not found. Please configure in properties.js file.');
            flag = false;
        }        
        return flag;
    },
    getDatabase: function(name){
        if(DB[name]){            
            return DB[name];
        }else{
            //console.log('Database configuration for :'+name+' not found, returning default');
            return DB['default'];
        }
    },

    createModelName: function(modelName){
        var name = modelName.toUpperCaseFirstChar() + 'Model';
        return name;
    },

    getModelName: function(modelName){
        var name = modelName.toUpperCaseFirstChar().replace("Model", "");
        return name;
    },

    validateSchemaDefinition: function(modelName, schemaDefinition){
        let flag = true;
        if(!schemaDefinition.super){
            console.error('Invalid schema definition for : ' + modelName + ', please define super attribute');
            flag = false;
        }else if(!schemaDefinition.definition){
            console.error('Invalid schema definition for : ' + modelName + ', please define definition attribute');
            flag = false;
        }
    }   
}