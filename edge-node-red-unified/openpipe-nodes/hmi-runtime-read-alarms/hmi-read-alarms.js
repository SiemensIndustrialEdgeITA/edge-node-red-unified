const readline = require('readline');
const net = require('net');
const PIPE_PATH = '/tempcontainer/HmiRuntime';

module.exports = function(RED) {
  function HmiRuntimeReadAlarmsNode(config) {
    RED.nodes.createNode(this, config);

    // JSON object for output message of this node
    const msg = { payload: {} };

    const node = this;

    const client = net.connect(PIPE_PATH, function() {
      node.log('Socket connection to /tempcontainer/HmiRuntime successfully established.');

      const rl = readline.createInterface({
        input: client,
        crlfDelay: Infinity
      });
      // Unified response
      rl.on('line', (line) => {
        try
        {
          msg.payload = JSON.parse(line);
          node.send(msg);
        }
        catch(e)
        {
          console.log(e);
        }
      });

      //Unified request
      node.on('input', function(inputMessage) {
        //Evaluate parameter from node
        const systemnames = inputMessage.SystemName.split(' ');
        const languageIdParse = parseInt(inputMessage.LanguageId, 10);
        // add all user defined tags to JSON object for subscription
        const readAlarmsObject = { Message: 'ReadAlarm', Params: { SystemNames: systemnames, Filter: inputMessage.Filter, LanguageId: languageIdParse }, ClientCookie: 'NodeRedCookieForReadAlarms' };
        // convert JSON object to string and add \n
        const readAlarmsCmd = JSON.stringify(readAlarmsObject) + '\n';
        // subscribe
        client.write(readAlarmsCmd);
      });
    });
    client.on('end', function() {
      node.log('Socket connection has been closed. Try to reconnect.');
    });
  }
  RED.nodes.registerType('hmi-read-alarms', HmiRuntimeReadAlarmsNode);
};
