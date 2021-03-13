var net = require('net');

module.exports = function(RED) {
    function HmiRuntimeReadAlarmsNode(config) {
        RED.nodes.createNode(this,config);

        var node = this;

        // JSON object for tag subscription
        var subscribe_alarms_object = {Message:"SubscribeAlarm",Params:{SystemNames:["RUNTIME_1"],Filter:"",LanguageId:1033},ClientCookie:"NodeRedCookieForSubscribeAlarms"}

        // JSON object for output message of this node
        var msg = { payload: {} }

        var rt_socket_client;
        var firstTime = true;

        function RTconnectSocket(){

          // create connection to RT unix socket
          rt_socket_client = net.createConnection("/tempcontainer/HmiRuntime")

          rt_socket_client.on("connect", function() {
            node.log('Socket connection to /tempcontainer/HmiRuntime successfully established.')

            // connection is established, subscribe for tags now
            subscribeAlarms();
          });
          rt_socket_client.on('error', function(error) {
            if (firstTime){
              node.log('Waiting for Socket connection to /tempcontainer/HmiRuntime ...')
              firstTime = false;
            }
            setTimeout( RTconnectSocket,1000);
          })
          rt_socket_client.on("data", function(data) {
            processData(data);
          });
          rt_socket_client.on("end", function(data) {
            // connection has been lost (happens when RT shuts down)
            node.log('Socket connection has been closed. Try to reconnect.')
            firstTime = true;
            setTimeout( RTconnectSocket,1000);
          });
        }

        function subscribeAlarms(){

          // At the moment there is no user input; we just subscribe for all alarms

          // convert JSON object to string and add \n
          var subscribe_cmd = JSON.stringify(subscribe_alarms_object);
          subscribe_cmd += '\n';

          // subscribe
          rt_socket_client.write(subscribe_cmd);
        }

        function processData(data){
          // convert input from Socket to JSON object
          rt_msg_json = JSON.parse(String.fromCharCode.apply(String, data))

          // we just send the whole object from RT to output
          msg.payload = rt_msg_json;

          node.send(msg);
        }

        RTconnectSocket();
    }
    RED.nodes.registerType("hmi-subscribe-alarms",HmiRuntimeReadAlarmsNode);
}