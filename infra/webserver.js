const host = process.env.WEBSERVER_HOST || 'http://localhost:3000';
const port = process.env.WEBSERVER_PORT || 3000;

export default Object.freeze({
  host,
  port,
});
