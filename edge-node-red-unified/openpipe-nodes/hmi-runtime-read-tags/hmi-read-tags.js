const readline = require('readline');
const net = require('net');
const PIPE_PATH = '/tempcontainer/HmiRuntime';

module.exports = function(RED) {
  function HmiRuntimeReadTagsNode(config) {
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
        const tags = inputMessage.TagNames.split(' ');
        const readTagsObject = { Message: 'ReadTag', Params: { Tags: tags }, ClientCookie: 'NodeRedCookieForReadTags' };
        node.log('Read for Tags: ' + tags);
        const readTagsCmd = JSON.stringify(readTagsObject) + '\n';
        client.write(readTagsCmd);
      });
    });
    client.on('end', function() {
      node.log('Socket connection has been closed. Try to reconnect.');
    });
  }
  RED.nodes.registerType('hmi-read-tags', HmiRuntimeReadTagsNode);
};
