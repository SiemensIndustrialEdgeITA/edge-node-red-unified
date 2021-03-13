var net = require('net');

module.exports = function(RED) {
    function HmiRuntimeWriteTagsNode(config) {
        RED.nodes.createNode(this,config);

        var node = this;
        var rt_socket_client;

        // JSON object for output message of this node
        var msg = { payload: "" }

        var connected = false;
        var firstTime = true;

        function RTconnectSocket(){

          // create connection to RT unix socket
          rt_socket_client = net.createConnection("/tempcontainer/HmiRuntime")
            rt_socket_client.on("connect", function() {
              node.log('Socket connection to /tempcontainer/HmiRuntime successfully established.')
              // connection is established, subscribe for tags now
              connected = true;
            });
            rt_socket_client.on('error', function(error) {
              if (firstTime){
                node.log('Waiting for Socket connection to /tempcontainer/HmiRuntime ...')
                firstTime = false;
              }
              setTimeout( RTconnectSocket,1000);
            })
            rt_socket_client.on("data", function(data) {
              // This was only needed for "debugging" to see the answer from RT Socket
              //processData(data);
            });
            rt_socket_client.on("end", function(data) {
              // connection has been lost (happens when RT shuts down)
              node.log('Socket connection has been closed. Try to reconnect.')
              firstTime = true;
              setTimeout( RTconnectSocket,1000);
            });

        }

        node.on('input', function(msg) {

          if (connected)
          {

            var write_tags_object = {Message:"WriteTag",Params:{Tags:[]},ClientCookie:"myRequest2"};

            // iterate thru all objects in payload of message and add them to write command
            msg.payload.forEach(function (item, index) {
              write_tags_object.Params.Tags.push(item);
            });

            var write_tags_cmd = JSON.stringify(write_tags_object);
            write_tags_cmd += '\n';

            rt_socket_client.write(write_tags_cmd);

          }
        });

        /* This was only needed for "debugging" to see the answer from RT Socket
            TODO: maybe there is a better way in Node where we can output such messages
        function processData(data){
          var msg_out = { payload: {} }
          msg_out.payload = JSON.parse(String.fromCharCode.apply(String, data));
          node.send(msg_out);
        }
        */

        RTconnectSocket();
    }
    RED.nodes.registerType("hmi-write-tags",HmiRuntimeWriteTagsNode);
}