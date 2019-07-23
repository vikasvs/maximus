import React from 'react';
import { StyleSheet, Text, View, Button, Slider } from 'react-native';
import outfits from './clothes/outfits.json'; 
import clothes from './clothes/closet.json'; 
import keys from './keys.js';
/**
Debbuging:
enable remote debug in JS
command option i
/*

/**
Framework:
1. Constructor and lifecycle
2. Wrapper for AsyncStorage and mainting json data
2. geolocation+weather using API
4. Basic output of clothes
5. Algorithm to weight clothing and wather 
6. UI/Rendering
*/


export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      comfort: 2,
      style: 2,
      formal: 2,
      warmth: 1,
      waterproof: 1,
      closet: {}
    }
    this.getWeather

  }


  getClothesData = () => {
    this.setState({closet: clothes})

  }
  componentWillMount(){
    this.getWeather()
  }

  componentDidMount() {
    this.getWeather() 
    this.getClothesData()
  }

  
  componentWillUnmount(){
    /** need to update closet - not sure how to get a wrapper for data yet*/
  } 


/**stack overflow https://stackoverflow.com/questions/44427908/catch-geolocation-error-async-await*/
  getLocation(options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, ({code, message}) =>
        reject(Object.assign(new Error(message), {name: "PositionError", code})),
        options);
      });
  };


  async getWeather(){
    try {
      let position = await this.getLocation({ enableHighAccuracy: true, 
                                                      timeout: 20000, 
                                                      maximumAge: 800 });
      let lat = position.coords.latitude;
      let lon = position.coords.longitude;
      console.log(keys.REACT_APP_WEATHER_API_KEY)
      let api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${keys.REACT_APP_WEATHER_API_KEY}` 
      let resp = await fetch(api)
      console.log(resp)
      let post = await resp.json()
      let temp = TempConverter(post.main.temp)
      let minTemp = TempConverter(post.main["temp_min"])
      let maxTemp = TempConverter(post.main["temp_max"])
      let weather = post.weather[0].description
      this.setState({temp, minTemp, maxTemp, weather, lat, lon})
    } catch (e) {
        console.log('api key error')
    }
  }

  availability(outfit){
    if (this.state.closet[outfit.top] < 1 || this.state.closet[outfit.bottom] <1)
      return false

    return true
  }

  render() {
    let outfit;
    for (let i = 0; i < outfits.length; i++){
      let j = (i + this.state.total) % outfits.length;

      if (this.availability(outfits[j])){
        outfit = outfits[j];
        break;
      }
    }

    return (
      <View style={styles.container}>
        <Text style={{marginBottom: 20, fontSize: 16}}> {this.state.temp ? this.state.weather : null}, {Math.round(this.state.temp)}°F </Text>
        
        {outfit 
          ? <Outfit {...outfit} />
          : (<View style={styles.center}>
              <Text>nothing available</Text>
             </View>)
        }
        
        <Text> Style </Text>
         <Slider 
          style={styles.slider}
          minimumValue={1}
          maximumValue={3}
          step={1}
          value={this.state.style}
          onSlidingComplete={val => this.setState({ 
            style: val,
            total : parseInt(Math.random() * outfits.length)
          })}
        />
        
        <View style={styles.button}>
          <Button
            onPress={() => this.setState({total : parseInt(Math.random() * outfits.length)})}
            title="Refresh"
          />
          <Button
            onPress={() => {
              if (outfit){
                let closet = {...this.state.closet};
                closet[outfit.top] -= 1;
                closet[outfit.bottom] -= 1;
                this.setState({closet: closet});
              }
            }}
            title="Wear"
          />
          
        </View>
      </View>
    );
  }
}

function TempConverter(t){
  return t * 9/5 - 459.67
}

function r(){
    return Math.random() > 0.5
}


function Outfit(props){
  return (
    <View>
      {Object.keys(props).map( key => {
        if (typeof props[key] === 'string')
          return <Text style={styles.text} key={key}> {key}: {props[key]} </Text>
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
  },
  slider: {
    width: 190
  },
  text: {
    fontSize: 16
  }
});