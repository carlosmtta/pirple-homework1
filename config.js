/*
* Cria e exporta variáveis de configuração.
*
*/

// Container para todos os ambientes
var environments = {};

// Ambiente de desenvolvimento (padrão) 
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging'
};

// Ambiente de produção (padrão) 
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production'
};

// Determinando que ambiente foi passado como um argumento de linha de comando.
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Verifica que o ambiente atual é um dos ambientes acima, se não, o padrão é o de desenvolvimento.
var environmentToExport = typeof(currentEnvironment) == 'object' ? environments[currentEnvironment] : environments.staging;

module.exports = environmentToExport;
