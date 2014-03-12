/**
 * Created by sergey.vlasov on 3/3/14.*/
(function(){
    var OneDriveDB = function(DB,tablename) {
        var db = DB,
            tableName = tablename,
            getObjectStore = function(){
                console.log(tableName);
                return  db.transaction([tableName], "readwrite").objectStore(tableName);

            },
            addItem = function(data, onsuccess, onerror) {
                var transaction = db.transaction([tableName], "readwrite"),
                    objectStore = transaction.objectStore(tableName),
                    request = objectStore.add(data);

                transaction.onerror = function() {
                    console.log('db    replase');
                    replaceItem(data.id, data);
                };

                request.onsuccess = onsuccess;
                request.onerror = onerror;
            },

            readItem = function(id, onsuccess){
                getObjectStore().get(id).onsuccess = function(event) {
                    onsuccess(event.target.result);
                };
            },

            removeItem = function(id, onsuccess, onerror) {
                var request = getObjectStore().delete(id);
                request.onsuccess = onsuccess;
                request.onerror = onerror;
            },

            replaceItem = function(id, newObj, onsuccess, onerror) {
                var request = getObjectStore().delete(id);
                request.onsuccess = function() {
                    addItem(newObj, onsuccess, onerror);
                };
                request.onerror = onerror;
            };

        return {
            addItem : addItem,
            readItem: readItem,
            removeItem: removeItem,
            replaceItem: replaceItem
        };
    };

    window.DbManager = window.DbManager || {
        createDB: function(nameDB, tableName, keyPath, parametersArray, onSuccess){
            console.log('start ok'+ nameDB);
            var idbRequest = indexedDB.open(nameDB, 2);
            console.log('create start');
            idbRequest.onupgradeneeded =
                function(event) {
                    console.log('create start');
                    var db = event.target.result,
                        objectStore = db.createObjectStore(tableName, { keyPath: keyPath });
                    console.log('create 3333');
                    parametersArray.forEach(function(nameIndex){
                        console.log(nameIndex);
                        objectStore.createIndex(nameIndex, nameIndex, { unique: false });
                    });
                    console.log('create ok');
                };
            idbRequest.onsuccess = function(event){
                console.log('ok');
                onSuccess(new OneDriveDB(event.target.result, tableName));
            }
        },

        deleteDB : function(nameDB) {
            indexedDB.deleteDatabase(nameDB);
            console.log('del ok');
            }
        };
}());
