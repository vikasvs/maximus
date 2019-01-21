import React from 'react';
import { StyleSheet, Text, View, Button, Slider } from 'react-native';
import store from 'react-native-simple-store';
import outfitsCombinations from './clothes/outfits.json'; 
import clothes from './clothes/closet.json'; 
import keys from './keys.js';

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      total : parseInt(Math.random() * outfitsCombinations.length),
      comfort: 2,
      style: 2,
      formal: 2,
      hooded: 1,
      closet: {}
    }
  }

  /*
   fetch('./data/data.json')
.then((response) => response.json())
.then((findresponse)=>{
  console.log(findresponse.title)
  this.setState({
    data:findresponse.title,
  })
})
  */
/*
  fetch("./clothes/closet.json")
    .then(function(response) {
        response.json()
        console.log(response.json())
  })*/

  /*componentWillMount(){
      this.refreshWeather()
      store.get("closet").then(closet => {
          if (!closet) {
            fetch('./clothes/closet.json')
            .then((response) => response.json())
            store.save("closet", clothes)
            closet = clothes;
          }
          this.setState({closet: closet})
        })
    .catch(error => console.error(error.message));

  }*/
  componentDidMount() {
    this.refreshWeather() 
    this.getClothesData()
  }


  getClothesData = () => {
    this.setState({closet: clothes})

  }

  componentWillUnmount(){
    store.update("closet", this.state.closet);
  } 
 
  getCurrentLocation(options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, 
          ({code, message}) =>
            reject(Object.assign(new Error(message), {name: "PositionError", code})),
          options);
    });
  }

  async refreshWeather(){
    try {

      let position = await this.getCurrentLocation({ enableHighAccuracy: true, 
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

tempToWarmth(t){
    if (t < 35)
      return 9
    if (t < 40)
      return 8
    if (t < 45)
      return 7
    if (t < 50)
      return 6
    if (t < 55)
      return 5
    if (t < 60)
      return 4
    if (t < 65)
      return 3
    if (t < 70)
      return 2
    if (t < 75)
      return 1.5
    if (t < 80)
      return 1
    else
      return 0
  }


  availability(outfit) {
    if (this.state.closet[outfit.top] == 0 || this.state.closet[outfit.bottom] == 0) {
      return false
    }
    return true
  }



  render() {
    let outfit;
    for (let i = 0; i < outfitsCombinations.length; i++){
      let j = (i + this.state.total) % outfitsCombinations.length;

      if (this.availability(outfitsCombinations[j])){
        outfit = outfitsCombinations[j];
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
        <Text style={{marginTop: 20}}> Comfort </Text>
        <Slider 
          style={styles.slider}
          minimumValue={1}
          maximumValue={4}
          step={1}
          value={this.state.comfort}
          onSlidingComplete={val => this.setState({ 
            comfort: val,
            total : parseInt(Math.random() * outfitsCombinations.length)
          })}
        />
        <Text> Style </Text>
         <Slider 
          style={styles.slider}
          minimumValue={1}
          maximumValue={4}
          step={1}
          value={this.state.style}
          onSlidingComplete={val => this.setState({ 
            style: val,
            total : parseInt(Math.random() * outfitsCombinations.length)
          })}
        />
        <Text> Formalness </Text>
        <Slider 
          style={styles.slider}
          minimumValue={1}
          maximumValue={4}
          step={1}
          value={this.state.formal}
          onSlidingComplete={val => this.setState({ 
            formal: val,
            total : parseInt(Math.random() * outfitsCombinations.length)
          })}
        />  
        <Text> Waterproof </Text>
        <Slider 
          style={styles.slider}
          minimumValue={1}
          maximumValue={2}
          step={1}
          value={this.state.hooded}
          onSlidingComplete={val => this.setState({ 
            hooded: val,
            total : parseInt(Math.random() * outfitsCombinations.length)
          })}
        />      

        <View style={styles.button}>
          <Button
            onPress={() => this.setState({total : parseInt(Math.random() * outfitsCombinations.length)})}
            title="Refresh"
          />
          <Button
            onPress={() => {
              if (outfit){
                let inventory = {...this.state.inventory};
                inventory[outfit.top] -= 1;
                inventory[outfit.bottom] -= 1;
                this.setState({inventory: inventory});
              }
            }}
            title="Wear"
          />
          <Button
            onPress={() => {
                  this.setState({
                      inventory: originalInventory,
                      total : parseInt(Math.random() * outfitsCombinations.length)
                    })
            }}
            title="Launder"
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