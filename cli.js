import { default as program } from 'commander';
import { default as restify } from 'restify-clients';
import * as util from 'util';

var client_port;
var client_host;
var client_version = '*';
var client_protocol;
var authid = 'them';
var authcode = 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF';

const client = (process) => {
    if (typeof process.env.PORT === 'string') 
        client_port = Number.parseInt(process.env.PORT);
    
    if (typeof program.port === 'string')
        client_port = Number.parseInt(program.port);

    if (typeof program.host === 'string') client_host = program.host;
    if (typeof program.url === 'string') {
        let purl = new URL(program.url);
        if (purl.host && purl.host !== '') client_host = purl.host;
        if (purl.port && purl.port !== '') client_port = purl.port;
        if (purl.protocol && purl.protocol !== '') client_protocol = purl.protocol;
    }

    let connect_url = new URL('http://localhost:5858');
    if (client_protocol) connect_url.protocol = client_protocol;
    if (client_host) connect_url.host = client_host;
    if (client_port) connect_url.port = client_port;

    let client = restify.createJsonClient({
        url: connect_url.href,
        version: client_version
    });
    client.basicAuth(authid, authcode);

    return client;
}

program
    .option('-p, --port <port>', "Port number for user server, if using localhost")
    .option('-h, --host <host>', "Port number for user server, if using localhost")
    .option('-u, --url <url>', "Connection URL for user server, if using a remote server");

program.parse(process.argv);