const readline = require('readline');
const net = require('net');
const PIPE_PATH = '/tempcontainer/HmiRuntime';

module.exports = function(RED) {
  function HmiRuntimeWriteTagsNode(config) {
    RED.nodes.createNode(this, config);

    const node = this;

    // JSON object for output message of this node
    const msg = { payload: {} };


    const client = net.connect(PIPE_PATH, function() {
      node.log('Client: on connection');

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
      // Unified request
      node.on('input', function(inputMessage) {
        // Check input and format to handover
        const tagNames = inputMessage.TagNames.split(' ');
        const tagValues = [];
        inputMessage.TagValues.split('"').forEach((value, i) => {
          if (i % 2 === 1) {
            tagValues.push(value);
          } else if (value) {
            value.trim().split(' ').forEach(splitValue => tagValues.push(parseFloat(splitValue)));
          }
        });

        const tags = tagValues.map((value, index) => { return { Name: tagNames[index], Value: value }; });

        const writeTagsObject = { Message: 'WriteTag', Params: { Tags: tags }, ClientCookie: 'NodeRedCookieForWriteTags' };
        // convert JSON object to string and add \n
        const writeTagsCmd = JSON.stringify(writeTagsObject) + '\n';
        // write
        client.write(writeTagsCmd);
      });
    });

    client.on('end', function() {
      node.log('on end');
    });
  }
  RED.nodes.registerType('hmi-write-tags', HmiRuntimeWriteTagsNode);
};
