import React from 'react';
import { StyleSheet, Text, View, Button, Slider } from 'react-native';
import outfits from './clothes/outfits.json'; 
import clothes from './clothes/closet.json'; 
import keys from './keys.js';
import store from 'react-native-simple-store';

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
    this.getWeather()
    store.get("closet")
      .then((closet) => {
         store.save("closet", clothes)
         closet = clothes;
      console.log("opening closet")
      this.setState({closet: closet})
    })
    .catch(error => console.error(error.message));
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
    /** need to update closet - not sure how to get a wrapper for data yet*/
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
      let position = await this.getLocation({ enableHighAccuracy: true, 
                                                      timeout: 20000, 
                                                      maximumAge: 800 });
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      var api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${keys.REACT_APP_WEATHER_API_KEY}` 
      var resp = await fetch(api)
      var post = await resp.json()
      var temp = TempConverter(post.main.temp)
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
    console.log(this.isSuitable(this.state.temp))
    return (outfit.comfort == this.state.comfort) && 
           (outfit.style == this.state.style) &&
           (outfit.formalness == this.state.formalness) &&
           (outfit.waterproof == this.state.waterproof) &&
           (outfit.warmth == this.isSuitable(this.state.temp))
  }

  selectItem(){
    let outfit;
    for (let i = global.var; i < outfits.length; i +=1) {
      if (this.isAvailable(outfits[i]) && this.satisfiesRequirements(outfits[i])) {
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
        <Text style={{marginBottom: 20, fontSize: 16}}> {this.state.temp ? this.state.weather : null}, {Math.round(this.state.temp)}°F </Text>
        
        {outfit 
          ? <Outfit {...outfit} />
          : (<View style={styles.center}>
              <Text>wash ur clothes dude</Text>
             </View>)
        }
        

        <Text style={{marginTop: 20}}>Style </Text>
         <Slider 
          style={styles.slider}
          minimumValue={0}
          maximumValue={3}
          step={1}
          value={this.state.style}
          onSlidingComplete={val => this.setState({ 
            style: val,
          })}
        />
        <Text> Comfort </Text>
         <Slider 
          style={styles.slider}
          minimumValue={0}
          maximumValue={3}
          step={1}
          value={this.state.style}
          onSlidingComplete={val => this.setState({ 
            comfort: val,
          })}
        />
        <Text> Formalness </Text>
         <Slider 
          style={styles.slider}
          minimumValue={0}
          maximumValue={3}
          step={1}
          value={this.state.style}
          onSlidingComplete={val => this.setState({ 
            formalness: val,
          })}
        />
        <Text> Waterproof </Text>
         <Slider 
          style={styles.slider}
          minimumValue={0}
          maximumValue={2}
          step={1}
          value={this.state.style}
          onSlidingComplete={val => this.setState({ 
            waterproof: val,
          })}
        />


        
        <View style={styles.button}>

          <Button
            onPress={() => {
              global.var +=1;
              this.selectItem()
              let closet = {...this.state.closet};
              this.setState({closet: closet})
            }}
            title="Refresh"
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
          />
          
        </View>
      </View>
    );
  }
}

function TempConverter(t){
  return t * 9/5 - 459.67
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