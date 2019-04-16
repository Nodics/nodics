module.exports = { core: [ 'gCore', 'cronjob', 'nems', 'profile' ],
  ems: [ 'gEms', 'emsClient', 'activemq', 'kafka' ],
  framework: 
   [ 'gFramework',
     'default',
     'nConfig',
     'nCommon',
     'nDatabase',
     'database',
     'mongodb',
     'elasticdb',
     'cassandradb',
     'nService',
     'nPipeline',
     'nEvent',
     'nFacade',
     'nController',
     'cache',
     'nodeCache',
     'redisCache',
     'hazelcastCache',
     'nCache',
     'nRouter',
     'nData',
     'dataCore',
     'import',
     'jsImport',
     'jsonImport',
     'csvImport',
     'excelImport',
     'nImport',
     'export',
     'jsExport',
     'jsonExport',
     'csvExport',
     'excelExport',
     'nExport',
     'nTest',
     'system' ],
  nCache: [ 'cache', 'nCache', 'nodeCache', 'redisCache', 'hazelcastCache' ],
  nData: 
   [ 'ndata',
     'coreData',
     'import',
     'jsImport',
     'jsonImport',
     'csvImport',
     'excelImport',
     'nImport',
     'export',
     'jsExport',
     'jsonExport',
     'csvExport',
     'excelExport',
     'nExport' ],
  nExport: [],
  nImport: [],
  database: [ 'nDatabase', 'database', 'mongodb', 'elasticdb', 'cassandradb' ],
  search: [ 'search', 'elastic', 'gSearch' ],
  tools: [ 'gTools', 'powerTool' ] };