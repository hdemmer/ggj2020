
function createWS(onMessage)
{
    var wsScheme = "wss://";
    if (window.location.protocol == "http:") { wsScheme = "ws://"; }
    var url = wsScheme + window.location.host+'/ws';

    var self = {};
    self.isDestroyed = false;
    self.isConnected = false;
    self.lastError = null;
    
    var ws = new WebSocket(url);
    ws.onerror = (ev)=>{
        console.error('ws error ' + JSON.stringify(ev));
        self.lastError = ev;
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
            // TODO: reconnect
        }
    };

    self.onmessage = ()=>{};
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

window.ws = createWS();
window.ws.onmessage = (msg)=>{
    console.log(msg);
};
