const http = require("http");
const https = require("https");
const fs = require("fs");
this.http = http
this.https = https

//beware of http flag, defaults to true or false
const fetch = (url, options = {}, ishttp = false) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    let req
    let protocol
    if(ishttp){
      protocol = 'http'
    }else{
      protocol = 'https'
    }

    req = this[protocol].request(urlObj, options, (res) => {
      const response = new Response({
        statusCode: res.statusCode,
        headers: res.headers,
        url: res.url,
      });
    
      const buffers = [];
    
      res.on("data", (data) => {
        buffers.push(data);
      });
    
      res.on("end", () => {
        response.setBody(buffers);
        resolve(response)
      });
    }) 

    req.on("error", (e) => {
      reject(e);
    });

    req.end();
  });
};

class Response {
  headers;
  #body;
  url;
  statusCode;

  constructor({ headers, body, statusCode, url }) {
    this.headers = headers;
    this.body = body;
    this.statusCode = statusCode;
    this.url = url;
  }

  async json() {
    return JSON.parse(Buffer.concat(this.body).toString());
  }

  async text() {
    return Buffer.concat(this.body).toString();
  }

  async blob() {
    return Buffer.concat(this.body);
  }

  setBody(body) {
    this.body = body;
  }
}

module.exports = fetch;