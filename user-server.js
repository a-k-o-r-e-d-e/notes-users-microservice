import restify from 'restify';
import * as util from 'util';
import { 
    SQUser, connectDB, userParams,
    sanitizedUser, createUser, findOneUser
     } from "./users-sequelize";
import DBG from 'debug';
import { authorizationParser } from 'restify/lib/plugins';

const log = DBG('users:service');
const error = DBG('users:error');

///////////// Set Up the REST Server

var server = restify.createServer({
    name: "User-Auth-Service",
    version: "0.o.1"
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({ mapParams: true }));

server.listen(process.env.PORT, "localhost", function () {
    log(server.name + ' listening at ' + server.util);
});

process.on('uncaughtException', function (err) {
    console.error("UNCAUGHT EXCEPTION - " + (err.stack || err));
    process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
    console.log(`UNHANDLED PROMISE REJECTION: ${util.inspect(p)}
        reason: ${reason}`);
    process.exit(1);
});

//// Mimic API Key Authentication
var apiKeys = [
    {
        user: 'them',
        key: 'D4ED43C0-8BD6-4FE2-B358-7C0E230D11EF'
    }
];

function check (req, res, next) {
    if (req.authorization && req.authorization.basic) {
        var found = false;

        for (let auth of apiKeys) {
            if (auth.key === req.authorization.basic.password 
                && auth.user === req.authorization.basic.username) {
                    found = true;
                    break;
            }
        }

        if (found) next();
        else {
            res.send(401, new Error("Not Authenicated"));
            next(false);
        }
    } else {
        res.send(500, new Error('No Authorization Key'));
        next(false);
    }
}

export async function findOneUser (username) {
    let user = await SQUser.findOne({ where: { username: username } });
    user = user ? sanitizedUser(user) : undefined;
    return user;
}

export async function createUser (req) {
    let toCreate = userParams(req);
    await SQUser.create(toCreate);
    const result = await findOneUser(req.params.username);
    return result;
}