import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";

class App extends Component {
  constructor() {
    super();

    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:4001",
      lat: 25.790654,
      lng: -80.1300455,
      zoom: 13,
      stations: {
        live: [],
        history: []
      },
      search: 'Live',
      show: []
    };

    this.handleRangeChange = this.handleRangeChange.bind(this);

  }
  
  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.on("connect", function () {
      console.log("Conectado al servidor");
    });
   
    socket.on("bikes",  (data) => {
      console.log('Recibiendo data bikes');
      console.log(data);
      this.setState({
        ...this.state,
        response: true,
        stations: data,
        show: data.live
      })
    });
  }

  handleRangeChange({target}){
    //console.log(target.value);
    const dateN = new Date();
    const range = ['12','11','10','9','8','7','6','5','4','3','2','1','Live']
    let value = '';
    let data = [];
    if( Number(target.value) !==  range.length - 1){
      value = range[target.value] + ' hours ago'
      
      const filter = this.state.stations.history.filter(({ hour }) => {
        return hour === ( dateN.getHours() - Number(range[target.value]) );
      });
      if( filter.length > 0 ) {
        console.log('Show:', filter[0].hour);
        data = filter[0].networks;
      } else {
        console.log(filter);
        data = [];
      }
    } else {
      value = range[target.value];
      data = [...this.stations.live];
    }

    this.setState({
      ...this.state,
      search: value,
      show: data
    })
  }

  render() {
    const { response, search, show } = this.state;
    //console.log('Show: ',show);
    const position = [this.state.lat, this.state.lng];
    return (

      <div className="map">
        <h1> City Bikes in Miami </h1>
        <p>{search}</p>
        <hr />
        <div className="row">
          <div className="col-8">

            <Map center={position} zoom={this.state.zoom}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {
                response ?
                    show.map( ({id, latitude,longitude, name, free_bikes, empty_slots}) => (
                      <Marker key={id} position={[latitude,longitude]}  radius={100}>
                        <Popup>
                          {name} <br /> {free_bikes} bikes - {empty_slots} slots.
                        </Popup>
                      </Marker>
                    ))
                    : ''
              
              }
            </Map>
          
          </div>
          <div className="col-4">
            <h3>Travel to the past</h3>
            <p>You can search for bike availability up to 10 hours ago.</p>
            <input type="range" onChange={this.handleRangeChange} className="form-range" min="0" max="12" step="1" id="customRange3"></input>
          </div>
        </div>
      </div>
    );
  }
}
export default App;
