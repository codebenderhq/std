
const hmr = (pathname, request) => {
   if( request.headers.get("upgrade") === "websocket"  && pathname === '/hmr') {
    const { socket: ws, response } = Deno.upgradeWebSocket(request);
    
    const handleConnected = () => console.log("Connection established");
    ws.onopen = () => handleConnected();
    
    const handleDisconnected = () => console.log("Connection closed");
    ws.onclose = () => handleDisconnected();
    
    const handleError = (e) =>
      console.log(e instanceof ErrorEvent ? e.message : e.type);
    ws.onerror = (e) => handleError(e);
    
    const handleMessage = (ws, msg) => {
      ws.send("You have a new message");
      console.log(msg);
    };
    
    ws.onmessage = (e) => handleMessage(ws, e.data);
    
    console.log("hmr server loaded");
    return response;
}
}

export default hmr