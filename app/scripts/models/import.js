'use strict';

/**
 *
 */
angular.module('wcagReporter')
.factory('wcagReporterImport',
function($rootScope, evalModel, currentUser, reportStorage, importV1, changeLanguage) {
    var jsonld = window.jsonld;

    function objectCollide(obj1, obj2) {
        Object.keys(obj1).forEach(function (prop) {
            if (typeof obj1[prop] !== 'function' &&
                typeof obj2[prop] !== 'undefined') {
                obj1[prop] = obj2[prop];
            }
        });
    }


    function compactEach(callback) {
        var testCallback;
        var results = [];
        var calls = 0;
        var evalType = evalModel.context['@vocab'] + evalModel.type;
        var personType = currentUser['@context']['@vocab'] + currentUser.type;

        testCallback = function (err, compacted) {
            results.push(compacted);
            if (results.length === calls) {
                callback(results);
            }
        };

        return function (evalObj) {
            calls += 1;

            if (evalObj['@type'] &&
                    evalObj['@type'].indexOf(evalType) !== -1) {
                // Compact with the evaluation context
                jsonld.compact(evalObj,
                        evalModel.context, testCallback);

            } else if (evalObj['@type'] &&
                    evalObj['@type'].indexOf(personType) !== -1) {
                // Compact with the FOAF context
                jsonld.compact(evalObj,
                        currentUser['@context'], testCallback);
            } else {
                results.push(evalObj);
            }
        };
    }


    /**
     * Inject evaluation data into the reporter
     * @param {[Object]} evalData
     */
    function updateEvalModel(evalData) {
        if (evalData.evaluationScope) {
            objectCollide(evalModel.scopeModel, evalData.evaluationScope);
        }

        evalModel.id = evalData.id;
        evalModel.type = evalData.type;

        evalModel.sampleModel.importData(evalData);

        evalModel.reportModel.importData(evalData);

        evalModel.auditModel.importData(evalData);
        evalModel.exploreModel.importData(evalData);
        evalModel.otherData = evalData.otherData;
    }

    var importModel = {

        storage: reportStorage,

        /**
         * Import an evaluation from a JSON string
         * @param  {string} json Evaluation
         */
        fromJson: function (json) {
            importModel.fromObject(angular.fromJson(json));
        },

        getFromUrl: function () {
            return reportStorage.get()
            .then(function (data) {
                importModel.fromJson(data);
                return data;
            });
        },

        fromObject: function (evalData) {
            // Check if an old format needs to be converted:
            if (angular.isArray(evalData['@graph']) &&
                typeof evalData['@graph'][0] === 'object' &&
                evalData['@graph'][0].type.toLowerCase() === 'evaluation') {
                // Fix an older import format
                evalData['@graph'] = importV1(evalData['@graph']);
            }
            jsonld.expand(evalData, function(err, expanded) {
                if (err) {
                    console.error(err);
                }
                importModel.fromExpanded(expanded);
            });
        },

        fromExpanded: function (evalData) {
            evalData.forEach(compactEach(function(results) {
                var evaluation = results.reduce(function (result, data) {
                    if (data.type === 'Evaluation') {
                        if (typeof result !== 'undefined') {
                            throw new Error('Only one evaluation object allowed in JSON data');
                        }
                        return data;
                    }
                    return result;
                }, undefined);

                if (!evaluation) {
                    throw new Error('No evaluation found in data');
                }

                // If the creator has an id, give that id to the current user
                if (typeof evaluation.creator === 'string' &&
                evaluation.creator.indexOf('_:') === 0) {
                    currentUser.id = evaluation.creator;
                }
                evaluation.creator = currentUser;
                var foundUser = false;
                // Find the first Person that matches the ID of the current user
                results.forEach(function (data) {
                    if (!foundUser && data.type === 'Person' &&
                    data.id === currentUser.id) {

                        // overwrite the current user with the new data
                        angular.extend(currentUser, data);
                        foundUser = true;
                    }
                });

                // Take all data that isn't the evaluation or the current user
                evaluation.otherData = results.reduce(function (otherData, data) {
                    if (data !== evaluation && data.id !== currentUser.id) {
                        otherData.push(data);
                    }
                    return otherData;
                }, [currentUser]);

                if (evaluation.lang) {
                    // This is a workaround for what seems to be a bug in the 
                    // JSON-LD lib. It outputs ['e', 'n'] instead of 'en', so we 
                    // join to fix this.
                    if (angular.isArray(evaluation.lang)) {
                        evaluation.lang = evaluation.lang.join('');
                    }
                    changeLanguage(evaluation.lang);
                }
                // Put the evaluation as the first on the list
                $rootScope.$apply(function () {
                    updateEvalModel(evaluation);
                });
            }));
        }
    };

    return importModel;
});