
window.createWS = function()
{
    var wsScheme = "wss://";
    if (window.location.protocol == "http:") { wsScheme = "ws://"; }
    var url = wsScheme + window.location.host+'/ws';

    var self = {};
    self.isDestroyed = false;
    self.isConnected = false;
    
    var ws = new WebSocket(url);
    ws.onerror = (ev)=>{
        console.error('ws error ' + JSON.stringify(ev));
        window.ws = createWS();
    };
    ws.onopen = (ev)=>{
        self.isConnected = true;
    };
    ws.onmessage = (ev)=>{
        if (self.isDestroyed) { return; }
        self.onmessage(JSON.parse(ev.data));
    };
    ws.onclose = (ev)=>{
        self.isConnected = false;
        if (!self.isDestroyed)
        {
            // reconnect
            console.log('reconnecting ws')
            window.ws = window.createWS();
        }
    };

    self.onmessage = (msg)=>{
        if (msg)
        {
            var id = msg.id;
            if (id)
            {
                window.spawnEmoji(id);
            }
        }
    };
    
    self.send = function(msg){
        if (!self.isConnected)
        {
            console.error('Trying to send to ws, but not connected.');
            return;
        }
        ws.send(msg);
    }

    self.close = function(){
        self.isDestroyed = true;
        ws.close();
        ws = null;
    };

    return self;
}

window.ws = window.createWS();