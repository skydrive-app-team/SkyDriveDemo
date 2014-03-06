/**
 * Created by sergey.vlasov on 3/3/14.
 */
function DbManager (name){
    var DB_NAME = name,
        db,

        create = function(){
            /*try{
            indexedDB.deleteDatabase(DB_NAME);
            console.log('db delete');
            }catch (e){}
            console.log('create');*/
            var idbRequest = indexedDB.open(DB_NAME, 2);
            idbRequest.onupgradeneeded =
                function(event) {
                    db = event.target.result;
                    // Create an objectStore to hold information about our customers. We're
                    // going to use "ssn" as our key path because it's guaranteed to be
                    // unique.
                    var objectStore = db.createObjectStore("loadState", { keyPath: "id" });
                    // Create an index to search customers by name. We may have duplicates
                    // so we can't use a unique index.
                    objectStore.createIndex("state", "state", { unique: false });
                    objectStore.createIndex("url", "url", { unique: false });
                    objectStore.createIndex("localPath", "localPath", { unique: false });
                    console.log('create ok');
                };
        },

        add = function(data) {
            console.log('>>>add Start');
            if(db) {
                var transaction = db.transaction(["loadState"], "readwrite");
                // Do something when all the data is added to the database.
                transaction.oncomplete = function(event) {
                    console.log('transaction ok');
                    //alert("All done!");
                };

                transaction.onerror = function(event) {
                    replace(data.id, data);
                    console.log('transaction err');
                    // Don't forget to handle errors!
                };

                var objectStore = transaction.objectStore("loadState");
                var request = objectStore.add(data);
                request.onsuccess = function(event) {
                    console.log('>>> add ok');
                    // event.target.result == customerData[i].ssn;
                };

                request.error=function(){
                    console.log('>>> add error');
                    // event.target.result == customerData[i].ssn;
                };
            }else {
                console.log('>>>add else');
                var idbRequest = indexedDB.open(DB_NAME, 2);
                idbRequest.onerror = onError;
                idbRequest.onsuccess = function(event){
                    db = event.target.result;
                    add(data);
                }
            }
        },

        readOne = function(id, onsuccess){
            if(db){
                db.transaction("loadState").objectStore("loadState").get(id).onsuccess = function(event) {
                    //console.log('ret ',event.target.result);
                    onsuccess(event.target.result);
                };
            }else {
                var idbRequest = indexedDB.open(DB_NAME, 2);
                idbRequest.onerror = onError;
                idbRequest.onsuccess = function(event){
                    db = event.target.result;
                    readOne(id,onsuccess);
                    //console.log(readOne(id));
                }
            }
        },

        remove = function(id) {
            if (db) {
                var request = db.transaction(["loadState"], "readwrite")
                    .objectStore("loadState")
                    .delete(id);
                request.onsuccess = function(event) {
                    console.log('remove ok');
                };
            } else {
                var idbRequest = indexedDB.open(DB_NAME, 2);
                idbRequest.onerror = onError;
                idbRequest.onsuccess = function(event){
                    db = event.target.result;
                    remove(id);
                    //console.log(readOne(id));
                }
            }
        },

        replace = function(id, newObj) {
            if (db) {
                var request = db.transaction(["loadState"], "readwrite")
                    .objectStore("loadState")
                    .delete(id);
                request.onsuccess = function(event) {
                    add(newObj);
                };
            } else {
                var idbRequest = indexedDB.open(DB_NAME, 2);
                idbRequest.onerror = onError;
                idbRequest.onsuccess = function(event) {
                    db = event.target.result;
                    replace(id, newObj);
                }
            }
        },

        deleteDB = function(){
            indexedDB.deleteDatabase(DB_NAME);
            console.log('db delete');
        },

        onError = function(err) {
            console.log('Error: ' + err);
        };

    return {
        create : create,
        add : add,
        read: readOne,
        remove: remove,
        replace: replace,
        deleteDB: deleteDB
    }
}