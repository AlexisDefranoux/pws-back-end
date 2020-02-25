import { server, port } from './server';

server.listen(port, () => console.log(
    `Notre serveur tourne en mode ${process.env.NODE_ENV || 'development'} sur http://localhost:${port}`
));


