'use strict';

require('dotenv').config();

const express = require('express');

const cors = require('cors');

const superagent = require('superagent');

const PORT = process.env.PORT || 5555;

const server = express();

let locations = {};

server.use( cors() );

//////////// LOCATION /////////////
server.get('/location', locationHandler);

function Location(city, data) {
    this.search_query = city;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
    this.formatted_query = data[0].display_name;
}

function locationHandler(requ, resp) {
  let city = requ.query['city'];
  getLocation(city)
    .then((data) => {
      resp.status(200).send(data);
    });
}
function getLocation(city) {
  const url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
  return superagent.get(url)
    .then(data => {
      let location = new Location(city, data.body);
      return location;
    });
}

///////////////


/////////////// WEATHER ///////////////

server.get('/weather', weatherHandler);

function Weather(day) {
  this.time = new Date(day.time * 1000).toDateString();
  this.forecast = day.summary;
}

function weatherHandler(request, response) {
  let lat = request.query['latitude'];
  let lng = request.query['longitude'];
  getWeather(lat, lng)
    .then(data => {
      response.status(200).send(data);
    });

}

function getWeather(lat, lng) {
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${lat},${lng}`;
  return superagent.get(url)
    .then(weatherData => {
      let weather = weatherData.body.daily.data.map((day) => new Weather(day));
      return weather;
    });
}

/////////////////

///////////////// EVENTS ////////////////

server.get('/events', eventHandler);

function Event(day) {
  this.link = day.url;
  this.name = day.title;
  this.eventDate =day.start_time;
  this.summary =day.description;
}

function eventHandler(request, response) {
  let lat = request.query['latitude'];
  let lng = request.query['longitude'];
  getEvent(lat, lng)
    .then(data => {
      response.status(200).send(data);
    });

}

function getEvent(lat, lng) {
  const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENTFUL_API_KEY}&q=amman&${lat},${lng}`;
  console.log(url);
  return superagent.get(url)
    .then((eventData) => {
      let dataBase = JSON.parse(eventData.text);
      let events = dataBase.events.event.map( day => new Event(day));
      return events;
    });
}

/////////////////

server.use('*', (request, response) => {
    response.status(404).send('Not found');
});

server.use( (error,request, response) =>{
    response.status(500).send('error');
});

server.listen( PORT ,() => console.log(`App listening on ${PORT}`));