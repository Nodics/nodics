/*
    Nodics - Enterprice API management framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    moduleName: 'mdulName',

    get: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        FACADE.FacadeName.get(inputParam);
    },

    get: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        };
        FACADE.FacadeName.get(inputParam);
    },
    getById: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        }
        FACADE.FacadeName.getById(inputParam);
    },
    getByCode: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        }
        FACADE.FacadeName.getByCode(inputParam);
    },
    save: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        }
        FACADE.FacadeName.save(inputParam);
    },
    removeById: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        }
        FACADE.FacadeName.removeById(inputParam);
    },
    removeByCode: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        }
        FACADE.FacadeName.removeByCode(inputParam);
    },
    update: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        }
        FACADE.FacadeName.update(inputParam);
    },
    saveOrUpdate: function(req, res) {
        let inputParam = {
            req: req,
            res: res
        }
        FACADE.FacadeName.saveOrUpdate(inputParam);
    }
}