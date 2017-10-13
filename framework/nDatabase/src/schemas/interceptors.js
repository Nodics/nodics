/*
 * These are self executable processes, so need to be defined in this way
 */
module.exports = {
    default: {
        preSaveInterceptor: function (schema) {
            //console.log('!!!! PreSave ' + schema);
            schema.pre('save', function (next) {
                //console.log('%%% This is custome PreSave methods');
                if (next && typeof next === "function") {
                    console.log('function1111111111111111');
                    next();
                }
            });
        },

        preSave1Interceptor: function (schema) {
            //console.log('!!!! PreSave ' + schema);
            schema.pre('save', function (next) {
                //console.log('%%% This is custome Pre1Save methods');
                if (next && typeof next === "function") {
                    console.log('function222222222222222');
                    next();
                }
            });
        },

        postSaveInterceptor: function (schema) {
            //console.log('!!!! PostSave ');
            schema.post('save', function (next) {
                //console.log('%%% This is custome PostSave methods');
                if (next && typeof next === "function") {
                    next();
                }
            });
        }
    }
}