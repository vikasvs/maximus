import React from 'react';
import { StyleSheet, Text, View, Button, Slider } from 'react-native';
import outfits from './clothes/outfits.json'; 
import clothes from './clothes/closet.json'; 
import keys from './keys.js';
import store from 'react-native-simple-store';
import Dimensions from 'Dimensions';

/**
Debbuging:
enable remote debug in JS
command option i
/*
/**
Framework:
1. Constructor and lifecycle
2. Wrapper for AsyncStorage and mainting json data
2. geolocation+weather using API - update weather API
4. Basic output of clothes
5. Algorithm to weight clothing and wather 
6. UI/Rendering
*/


export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      comfort: 0,
      style: 0,
      formalness: 0,
      waterproof: 0,
      closet: {},
    }
    global.var = 0;
    global.savedState = [];
    this.getWeather()
    store.get("closet")
      .then((closet) => {
         store.save("closet", clothes)
         closet = clothes;
      console.log("opening closet")
      this.setState({closet: closet})
    })
    .catch(error => console.error("could not find closet"));
  }

  getClothesData = () => {
    this.setState({closet: clothes})
  }

  componentDidMount() {
    this.getWeather() 
    this.getClothesData()
  }

  componentWillUnmount(){
    store.update("closet", this.state.closet)
  } 

/**stack overflow https://stackoverflow.com/questions/44427908/catch-geolocation-error-async-await*/
  getLocation(options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, ({code, message}) =>
        reject(Object.assign(new Error(message), {name: "PositionError", code})),
        options);
      });
  }


  async getWeather(){
    try {
      /**https://stackoverflow.com/questions/55235815/accessing-current-location-and-sending-that-to-firebase*/
      let position = await this.getLocation({ enableHighAccuracy: true, 
                                                      timeout: 20000, 
                                                      maximumAge: 800 });
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      var api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${keys.REACT_APP_WEATHER_API_KEY}` 
      var resp = await fetch(api)
      var post = await resp.json()
      var temp = post.main.temp * 9/5 - 459.67
      var weather = post.weather[0].description
      this.setState({temp, weather, lat, lon})
      console.log('api working well')
    } catch (e) {
        console.log('api key error')
    }
  }

/**
needs to integrate warmth + weather in a meaningful manner
have warmth go from 1-10, and set weather indicators to match 1-10
*/
  isSuitable(temp){
    if (temp <= 20)
      return 8
    if (temp <= 30)
      return 7
    if (temp <= 40)
      return 6
    if (temp <= 50)
      return 5
    if (temp <= 60)
      return 4
    if (temp <= 70)
      return 3
    if (temp <= 80)
      return 2
    else 
      return 1
  }
  
  isAvailable(outfit){
    if (this.state.closet[outfit.top] < 1 || this.state.closet[outfit.bottom] <1)
      return false
    return true
  }
  
  satisfiesRequirements(outfit) {
    return (outfit.comfort == this.state.comfort) && 
           (outfit.style == this.state.style) &&
           (outfit.formalness == this.state.formalness)  &&
           (outfit.warmth == this.isSuitable(this.state.temp))&&
           (outfit.waterproof == this.state.waterproof) 
  }

  saveItem(){
    var savedComfort = this.state.comfort;
    var savedStyle = this.state.style;
    var savedFormalness = this.state.formalness;
    var savedWaterproof = this.state.waterproof;
    var saved = [savedComfort,savedStyle,savedFormalness,savedWaterproof];
    return saved
  }
  selectItem(){
    let outfit;

    if (JSON.stringify(global.savedState) != JSON.stringify(this.saveItem())) {
      console.log("new parameters")
      global.var = 0;
    }

    for (let i = global.var; i < outfits.length; i +=1) {
      if (this.isAvailable(outfits[i]) && this.satisfiesRequirements(outfits[i])) {
        global.savedState = this.saveItem();
        global.var = i;
        outfit = outfits[i];
        console.log(outfit)
        return outfit
      }  
    }
  }
  render() {
    
    let outfit = this.selectItem()

    return (
     <View style={styles.container}>
      <View style = {styles.content}>
        <View style={{marginTop:70, marginBottom: 30}}>
          <Text style={styles.text}> {this.state.weather}, {Math.round(this.state.temp)}°F </Text>
        </View>
        {outfit ?
          <Outfit {...outfit} /> : (<View style={styles.center}>
              <Text style={styles.text}>no possible options</Text>
              <Text style={styles.text}> do laundry</Text>
             </View>)
        }

      </View>


      <View style = {styles.toggles}>

        <Text style={{marginTop:70, fontSize:17, fontFamily: "Avenir-Roman"}}> Style </Text>
         <Slider 
          style={styles.slider}
          minimumValue={0}
          maximumValue={3}
          minimumTrackTintColor="#2b787a"
          step={1}
          value={this.state.style}
          onSlidingComplete={val => this.setState({ 
            style: val,
          })}
        />
        <Text style={{marginTop:10, fontSize:17, fontFamily: "Avenir-Roman"}}> Comfort </Text>
         <Slider 
          style={styles.slider}
          minimumValue={0}
          maximumValue={3}
          minimumTrackTintColor="#2b787a"          
          step={1}
          value={this.state.comfort}
          onSlidingComplete={val => this.setState({ 
            comfort: val,
          })}
        />
        <Text style={{marginTop:10, fontSize:17, fontFamily: "Avenir-Roman"}}> Formalness </Text>
         <Slider 
          style={styles.slider}
          minimumValue={0}
          maximumValue={3}
          minimumTrackTintColor="#2b787a"          
          step={1}
          value={this.state.formalness}
          onSlidingComplete={val => this.setState({ 
            formalness: val,
          })}
        />
        <Text style={{marginTop:10, fontSize:17, fontFamily: "Avenir-Roman"}}> Waterproof </Text>
         <Slider 
          style={styles.slider}
          minimumValue={0}
          maximumValue={2}
          minimumTrackTintColor="#2b787a"
          step={1}
          value={this.state.waterproof}
          onSlidingComplete={val => this.setState({ 
            waterproof: val,
          })}
        />

        <View style={{marginTop:30}}>
          <View style={styles.button}>

            <Button
              onPress={() => {
                global.var += 1;
                this.selectItem()
                let closet = {...this.state.closet};
                this.setState({closet: closet})
              }}
              title="Recycle"
              color = "#2b787a"
              fontFamily = "Avenir-Roman"
            />

            <Button
               onPress={() => {
                if (outfit){
                  let closet = {...this.state.closet};
                  closet[outfit.top] -= 1;
                  closet[outfit.bottom] -= 1;
                  this.setState({closet: closet})
                }
              }}
              title="Wear"
              color = "#2b787a"
              fontFamily =  "Avenir-Roman"


            />
            </View>
            
          </View>
        </View>
      </View>
    );
  }
}

function Outfit(outfit){
  return (
    <View>
      {Object.keys(outfit).map( key => {
        if (typeof outfit[key] === 'string')
          return <Text style={styles.text} key={key}> {key}: {outfit[key]} </Text>
      })}
    </View>
  )
}

const styles = StyleSheet.create({

  container: {
    flex:1,
  },
  content:{
    height:290,
    alignItems: 'center',
    backgroundColor:'#2b787a',
    justifyContent: 'center',
  },
  toggles: {
    flex:2,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  center: {
    alignItems: 'center',
  },
  /**#faba98*/
  button: {
    flexDirection: 'row',
    color: '#2b787a',
  },
  slider: {
    width: 190,
  },
  text: {
    fontSize: 17,
    fontFamily: "Avenir-Roman",
    color: "white"
  }
});