module.exports = {
    temp: function () {
        console.log(NODICS.getSearchModels('profile', 'default'));
        SERVICE.DefaultImportService.importInitData({
            tenant: 'default',
            modules: NODICS.getActiveModules()
        }).then(success => {
            NODICS.LOG.info('Nodics Import Success');
        }).catch(error => {
            NODICS.LOG.error('Nodics Import error : ', error);
        });
        SERVICE.DefaultImportService.importLocalData({
            inputPath: {
                rootPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data',
                dataPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/data',
                headerPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/headers',
                successPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/success',
                errorPath: '/Users/himkar.dwivedi/apps/HimProjects/nodics/tmp/data/error'
            },
            outputPath: {
                //rootPath: '' //Optional value, if not available will be taken from running server
            }
        }).then(success => {
            SERVICE.DefaultImportService.processImportData({
                tenant: 'default',
                inputPath: {
                    rootPath: NODICS.getServerPath() + '/' + CONFIG.get('data').dataDirName + '/import',
                    dataType: 'local',
                    postFix: 'data'
                }
            }).then(success => {
                NODICS.LOG.info('Nodics Import Success');
            }).catch(error => {
                NODICS.LOG.error('Nodics Import error : ', error);
            });
            NODICS.LOG.info('Nodics Import Success');
        }).catch(error => {
            NODICS.LOG.error('Nodics Import error : ', error);
        });
        NODICS.LOG.info('Nodics Import Success');
    }
};