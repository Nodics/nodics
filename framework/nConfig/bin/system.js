var _ = require('lodash');
const path = require('path');
const fs = require('fs');

module.exports = {
    currentTanent: 'default',
    prepareOptions: function(options) {
        if (!options) {
            console.error('   ERROR: Please set NODICS_HOME into environment variable.')
            options = {};
            options.SERVER_PATH = process.env.SERVER_PATH || process.cwd();
            options.NODICS_HOME = process.env.NODICS_HOME || path.resolve(process.cwd(), '..');
            options.NODICS_ENV = process.env.NODICS_ENV || 'local';
            options.activeModules = ['ALL'];
            if (process.argv) {
                options.argv = process.argv;
            }
        } else {
            if (!options.SERVER_PATH) {
                options.SERVER_PATH = process.env.SERVER_PATH || process.cwd();
            }
            if (!options.NODICS_HOME) {
                options.NODICS_HOME = process.env.NODICS_HOME || path.resolve(process.cwd(), '..');
            }
            if (!options.NODICS_ENV) {
                options.NODICS_ENV = process.env.NODICS_ENV || 'local';
            }
            if (!options.activeModules) {
                options.activeModules = ['ALL'];
            } else {
                options.activeModules = ['framework', 'ncommon', 'nconfig', 'user'].concat(options.activeModules);
            }
            if (process.argv) {
                options.argv = process.argv;
            }
        }
        return options;
    },

    subFolders: function(folder) {
        return fs.readdirSync(folder)
            .filter(subFolder => fs.statSync(path.join(folder, subFolder)).isDirectory())
            .filter(subFolder => subFolder !== 'node_modules' && subFolder !== 'templates' && subFolder[0] !== '.')
            .map(subFolder => path.join(folder, subFolder));
    },

    collectModulesList: function(properties, folder, modulePathList) {
        let config = properties || CONFIG.getProperties();
        const hasPackageJson = fs.existsSync(path.join(folder, 'package.json'));
        if (hasPackageJson) {
            modulePathList.push(folder);
        }
        for (let subFolder of this.subFolders(folder)) {
            if (subFolder !== config.SERVER_PATH) {
                this.collectModulesList(config, subFolder, modulePathList);
            }
        }
    },

    isModuleActive: function(properties, moduleName) {
        let config = properties || CONFIG.getProperties();
        let flag = false;
        if (config.activeModules[0] === 'ALL') {
            flag = true;
        } else if (config.activeModules.indexOf(moduleName) > -1) {
            flag = true;
        }
        return flag;
    },

    sortModulesByIndex: function(moduleIndex) {
        moduleIndex = _.groupBy(moduleIndex, function(element) {
            return parseInt(element.index);
        });
        return moduleIndex;
    },

    getModulesMetaData: function(properties) {
        let _self = this;
        let config = properties || CONFIG.getProperties();
        let modules = NODICS.getModules();
        let moduleIndex = [];
        let metaData = {};
        var nodicsModulePath = [],
            serverModulePath = [];
        //Get list of OOTB Active modules
        this.collectModulesList(properties, config.NODICS_HOME, nodicsModulePath);
        //Adding list of Custom Active modules
        this.collectModulesList(properties, config.SERVER_PATH, serverModulePath);

        nodicsModulePath = nodicsModulePath.concat(serverModulePath);
        var counter = 0;
        nodicsModulePath.forEach(function(modulePath) {
            var moduleFile = require(modulePath + '/package.json');
            if (_self.isModuleActive(properties, moduleFile.name)) {
                metaData[moduleFile.name] = moduleFile;
                let moduleMetaData = {};
                moduleMetaData.metaData = moduleFile;
                moduleMetaData.modulePath = modulePath;
                NODICS.addModule(moduleMetaData);
                if (!moduleFile.index) {
                    console.error('   ERROR: Please update index property in package.json for module : ', moduleFile.name);
                    process.exit(1);
                }
                if (isNaN(moduleFile.index)) {
                    console.error('   ERROR: Property index contain invalid value in package.json for module : ', moduleFile.name);
                    process.exit(1);
                }
                let indexData = {};
                indexData.index = moduleFile.index;
                indexData.name = moduleFile.name;
                indexData.path = modulePath;
                moduleIndex.push(indexData);
            }
        });
        config.moduleIndex = this.sortModulesByIndex(moduleIndex);
        config.metaData = metaData;
        //NODICS.setModules(modules);
    },

    loadFiles: function(config, fileName, frameworkFile) {
        let _self = this;
        let mergedFile = frameworkFile || {};
        let moduleIndex = config.moduleIndex;
        Object.keys(moduleIndex).forEach(function(key) {
            var value = moduleIndex[key][0];
            var filePath = value.path + fileName;
            if (fs.existsSync(filePath)) {
                console.log('   INFO: Loading file from : ' + filePath);
                var commonPropertyFile = require(filePath);
                mergedFile = _.merge(mergedFile, commonPropertyFile);
            }
        });
        return mergedFile;
    },

    startServers: function() {
        if (CONFIG.get('server').runAsSingleModule) {
            if (!NODICS.getModules().default || !NODICS.getModules().default.app) {
                console.error('   ERROR: Server configurations has not be initialized. Please verify.');
                process.exit(CONFIG.get('errorExitCode'));
            }
            const httpPort = SYSTEM.getServerPort('default');
            console.log('=>  Starting Server for module : default on PORT : ', httpPort);
            NODICS.getModules().default.app.listen(httpPort);
        } else {
            let modules = NODICS.getModules();
            if (this.isBlank(NODICS.getModules())) {
                console.error('   ERROR: Please define valid active modules');
                process.exit(CONFIG.get('errorExitCode'));
            }
            _.each(modules, function(value, moduleName) {
                if (value.metaData && value.metaData.publish) {
                    if (!value.app) {
                        console.error('   ERROR: Server configurations has not be initialized for module : ', moduleName);
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    const httpPort = SYSTEM.getServerPort(moduleName);
                    if (!httpPort) {
                        console.error('   ERROR: Please define listening PORT for module: ', moduleName);
                        process.exit(CONFIG.get('errorExitCode'));
                    }
                    console.log('=>  Starting Server for module : ', moduleName, ' on PORT : ', httpPort);
                    value.app.listen(httpPort);
                }
            });
        }
    },

    getAllMethods: function(envScripts) {
        return Object.getOwnPropertyNames(envScripts).filter(function(prop) {
            return typeof envScripts[prop] == 'function';
        });
    },

    isBlank: function(value) {
        return !Object.keys(value).length;
    }
};