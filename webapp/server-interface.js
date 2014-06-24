var q = require('q');

var serverInterface = {
    getTop : function(type, count, filter){

        var deferred = q.defer();

        deferred.resolve( {
            items: [
                { id: "saasdasd", name: "name", score: 10},
                { id: "saasdasd1", name: "name1", score: 10},
                { id: "saasdasd2", name: "name2", score: 9},
                { id: "saasdasd3", name: "name3", score: 8},
                { id: "saasdasd4", name: "name4", score: 6},
                { id: "saasdasd5", name: "name5", score: 5},
                { id: "saasdasd6", name: "name6", score: 6},
                { id: "saasdasd7", name: "name7", score: 10},
                { id: "saasdasd8", name: "name8", score: 10}

            ]
        });



        // ......


        return deferred.promise;

    },

    getEntries : function(entryIds){

        var deferred = q.defer();

        // ......


        return deferred.promise;
    }


}