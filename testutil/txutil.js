
module.exports = {
  findEventByNameOrThrow: function(tx, eventName) {

    var logs = tx.logs || [];
    for (var ii = 0; ii < logs.length; ii++) {
      if (logs[ii].event === eventName) {
        return logs[ii];
      }
    }

    throw "Could not find event: " + eventName;
  }
};