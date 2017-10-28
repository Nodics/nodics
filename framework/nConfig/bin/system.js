var _ = require('lodash');
const path = require('path');
const fs = require('fs');
const util = require('util');

module.exports = {
    getActiveModules: function(options) {
        let modules = [];
        let moduleGroupsFilePath = options.SERVER_PATH + '/config/modules.js';
        let serverProperty = require(options.SERVER_PATH + '/config/common/properties.js');
        if (!fs.existsSync(moduleGroupsFilePath) || serverProperty.activeModules.updateGroups) {
            var nodicsModulePath = [];
            this.collectModulesList(options.SERVER_PATH, options.NODICS_HOME, nodicsModulePath);
            let mergedFile = {};
            nodicsModulePath.forEach(function(modulePath) {
                if (fs.existsSync(modulePath + '/config/properties.js')) {
                    mergedFile = _.merge(mergedFile, require(modulePath + '/config/properties.js'));
                }
            });
            if (!_.isEmpty(mergedFile.moduleGroups)) {
                if (fs.existsSync(moduleGroupsFilePath)) {
                    fs.unlinkSync(moduleGroupsFilePath);
                }
                fs.writeFileSync(moduleGroupsFilePath, 'module.exports = ' + util.inspect(mergedFile.moduleGroups) + ';', 'utf8');
            }
        }
        let moduleData = require(moduleGroupsFilePath);
        //pushing framework modules
        modules = moduleData.framework;
        serverProperty.activeModules.groups.forEach((groupName) => {
            if (!moduleData[groupName]) {

            }
            modules = modules.concat(moduleData[groupName]);
        });
        //pushing application modules
        modules = modules.concat(serverProperty.activeModules.modules);
        return modules;
    },
    prepareOptions: function(options) {
        if (!options) {
            console.warn('   WARNING: Please set NODICS_HOME into environment variable.');
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
            options.activeModules = this.getActiveModules(options);
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

    collectModulesList: function(serverPath, folder, modulePathList) {
        const hasPackageJson = fs.existsSync(path.join(folder, 'package.json'));
        if (hasPackageJson) {
            modulePathList.push(folder);
        }
        for (let subFolder of this.subFolders(folder)) {
            if (subFolder !== serverPath) {
                this.collectModulesList(serverPath, subFolder, modulePathList);
            }
        }
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
        this.collectModulesList(config.SERVER_PATH, config.NODICS_HOME, nodicsModulePath);
        //Adding list of Custom Active modules
        this.collectModulesList(config.SERVER_PATH, config.SERVER_PATH, serverModulePath);

        nodicsModulePath = nodicsModulePath.concat(serverModulePath);
        var counter = 0;
        nodicsModulePath.forEach(function(modulePath) {
            var moduleFile = require(modulePath + '/package.json');
            if (NODICS.isModuleActive(moduleFile.name)) {
                metaData[moduleFile.name] = moduleFile;
                if (!moduleFile.index) {
                    console.error('   ERROR: Please update index property in package.json for module : ', moduleFile.name);
                    process.exit(1);
                }
                if (isNaN(moduleFile.index)) {
                    console.error('   ERROR: Property index contain invalid value in package.json for module : ', moduleFile.name);
                    process.exit(1);
                }
                let indexData = {};
                let moduleMetaData = {};

                moduleMetaData.metaData = moduleFile;
                moduleMetaData.modulePath = modulePath;
                NODICS.addModule(moduleMetaData);

                indexData.index = moduleFile.index;
                indexData.name = moduleFile.name;
                indexData.path = modulePath;
                moduleIndex.push(indexData);
            }
        });
        config.moduleIndex = this.sortModulesByIndex(moduleIndex);
        config.metaData = metaData;
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

    getAllMethods: function(envScripts) {
        return Object.getOwnPropertyNames(envScripts).filter(function(prop) {
            return typeof envScripts[prop] == 'function';
        });
    },

    isBlank: function(value) {
        return !Object.keys(value).length;
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
                    console.log(' =>Starting Server for module : ', moduleName, ' on PORT : ', httpPort);
                    value.app.listen(httpPort);
                }
            });
        }
    }
};