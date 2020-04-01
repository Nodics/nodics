/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    loadActionResponseForWorkflowItem: function (request, response) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (request.loadActionResponse === undefined || request.loadActionResponse) {
                let itemModels = response.success.result;
                let actionResponseIds = _self.getActionResponseIds(itemModels);
                if (actionResponseIds.length > 0) {
                    SERVICE.DefaultActionResponseService.get({
                        tenant: request.tenant,
                        query: {
                            _id: {
                                $in: actionResponseIds
                            }
                        }
                    }).then(success => {
                        try {
                            if (success.result && success.result.length > 0) {
                                _self.assignResponseData(itemModels, success.result);
                            }
                            resolve(true);
                        } catch (error) {
                            reject(error);
                        }
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }
        });
    },

    getActionResponseIds: function (itemModels) {
        let actionResponseIds = [];
        if (itemModels && itemModels.length > 0) {
            itemModels.forEach(wtItem => {
                if (wtItem.actions && wtItem.actions.length > 0) {
                    wtItem.actions.forEach(actionItem => {
                        actionResponseIds.push(actionItem.responseId);
                    });
                }
            });
        }
        return actionResponseIds;
    },

    assignResponseData: function (itemModels, responseItems) {
        let _self = this;
        if (itemModels && itemModels.length > 0) {
            itemModels.forEach(wtItem => {
                if (wtItem.actions && wtItem.actions.length > 0) {
                    wtItem.actions.forEach(actionItem => {
                        let data = _self.getActionResponse(actionItem.responseId, responseItems);
                        if (data && !UTILS.isBlank(data)) {
                            actionItem.actionResponse = data;
                        } else {
                            throw new CLASSES.WorkflowError('Invalid response id: ' + actionItem.responseId + ' for item ' + wtItem.code);
                        }
                    });
                }
            });
        }
    },

    getActionResponse: function (responseId, responseItems) {
        for (let count = 0; count < responseItems.length; count++) {
            if (responseItems[count]._id.toString() === responseId.toString()) {
                return responseItems[count];
            }
        }
        return;
    }
};