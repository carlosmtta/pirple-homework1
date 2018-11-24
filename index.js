/*
* Arquivo inicial da API.
*
*/

// Dependências
const http = require('http');
const https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instancia o servidor http
var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

// Inicia o servidor http
httpServer.listen(config.httpPort, function() {
    console.log('O servidor está ouvindo na porta ' + config.httpPort)
});

// Instancia o servidor https
var httpsServerOptions = {
    "key": fs.readFileSync('./https/key.pen'),
    "cert": fs.readFileSync('./https/cert.pen'),
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

// Instancia o servidor https
httpsServer.listen(config.httpsPort, function() {
    console.log('O servidor está ouvindo na porta ' + config.httpsPort)
});

// Toda a lógica do servidor para ambos http e https
var unifiedServer = function(req, res) {

    // Receber a URL e converte-la
    var parsedURL = url.parse(req.url, true);

    // Retirar o caminho
    var path = parsedURL.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Recuperar o método http usado
    var method = req.method.toLowerCase();

    // Recuperar querystring como um objeto
    var queryStringObject = parsedURL.query;

    // Recuperar o cabeçalho como um objeto
    var headers = req.headers;

    // Recupera o payload se existir
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        // Escolhe o handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        
        // Constroi o objeto para enviar para o handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer 
        }

        //Roteia a requisição para o handler
        chosenHandler(data, function(statusCode, payload) {
            //Usar o status code retornado pelo handler ou o status code padrã  o 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //Usar o payload enviando pelo handler ou o padrão um objeto vazio
            payload = typeof(payload) == 'object' ? payload: {};

            //Convert the payload to string
            var payloadString = JSON.stringify(payload);

            //Retornar a resposta
            res.setHeader('Content-Type','application/json')
            res.writeHead(statusCode);
            res.end(payloadString);

            //Logar no caminho requisitado
            console.log('Retornando esta resposta: ', statusCode, payloadString);

        });
        

   
    });
}


// Define um roteador
var handlers = {};

// Rota do ping
handlers.ping = function(data, callback) {
    callback(200);
};

// Rota do hello
handlers.hello = function(data, callback) {
    var hello = {
        "answer": "Hello World"
    };
    callback(200, hello);
};

//Não encontrado
handlers.notFound = function(data, callback) {
    callback(404);
};

var router = {
    'ping': handlers.ping,
    'hello': handlers.hello
}