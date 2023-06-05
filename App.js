import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text,Image, View, TouchableOpacity } from 'react-native';
import {Audio} from "expo-av"
import {useState,useEffect} from "react" 
import NetInfo from '@react-native-community/netinfo';
import TcpSocket from 'react-native-tcp';





function Pack_crc(ptr, len) {
  var crc;
  var dat;
  crc = 0;
  var i = 0;
  while (len-- != 0) {
    dat = (crc >>> 8) & 0xff;
    crc <<= 8;
    crc ^= crcTable[dat ^ ptr[i]];
    i++;
  }

  return crc & 0xffff;
}








export default function App() {

  var HOST = '0.0.0.0';
var PORT = 6880;
  const establishTCPConnections = (connectedDevices) => {
    connectedDevices.forEach(device => {
      const { IPAddress, BSSID } = device;
  
      // Create a TCP socket instance
      const socket = TcpSocket.createConnection({ port: PORT, host: IPAddress }, () => {
        // Connection successful
        console.log(`Connected to tracker at ${IPAddress}`);
      });
  
      // Add a 'data' event handler to this instance of socket
  socket.on('data', function(data) {

    var bindata = data.toString('hex');
    console.log('VJ DATA ' + socket.address + ': ' + bindata);





// ------------------ VJ start ------------------------//
const changeEndianness = (string) => {
        const result = [];
        let len = string.length - 2;
        while (len >= 0) {
          result.push(string.substr(len, 2));
          len -= 2;
        }
        return result.join('');
}
// hexadezimal zu int
function hex2Dec(hex) {
  return parseInt(hex, 16);
}


// hexadezimal zu 8bit signed int
function hexTo8Bits(hex) {
    var num = parseInt(hex, 16);
    if (num > 127) { num = num - 256 }
  return num;
}

// hexadezimal zu ASCI
function hex2ascii(str1)
 {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
 }




function acksenden(sequenceid)
 {
                        // Antwort timestamp 
                        var unixTimestamp = Math.round(new Date().getTime()/1000);
                        ACKzeit = unixTimestamp.toString(16);
                        ACKzeit = ACKzeit.substr(6, 2) + ACKzeit.substr(4, 2) + ACKzeit.substr(2, 2) + ACKzeit.substr(0, 2)  // little - endian
                        
                        // crc16 berechnen
                        var a ="7F0100";
                        const arawHex = Buffer.from(a, 'hex');
                        const mypacket = Buffer.from(arawHex)

                        var finish = Pack_crc(arawHex, arawHex.length);
                        var crc = finish.toString(16);
                       // console.log('CRC 2:' + finish.toString(16));
                        
                        // string zusammenbauen
                        const hexString = "AB000300" + crc.substr(2, 2) + crc.substr(0, 2) + sequenceid + "7F0100";

                        const rawHex = Buffer.from(hexString, 'hex');
                       socket.write(rawHex);

        return hexString;
 }






var m =  bindata

var bindata = m


// log ausgabe aktivieren 0 oder 1
var logging = 1;
var alarm = 0;
var head = m.substr(0,16)
var sequenceid = m.substr(12,4)

var command = m.substr(16,2)   // If regel einbauen

var body = m.substr(18,bindata.length)
var laenge = parseInt(body.substr(0, 2),16);

var zeit;
var key = 0;
var stueck = "aa";
var i = 0; 

while (i < 30) // Vašku, tady iteruješ přes proměnnou i, ale o kousek níž pak v jednom z cases iteruješ ve for cyklu přes i a ta i se ti biji. v tom druhem cyklu to toc pres jinou promennou.
    {
     // substring erstellen            
     stueck = body.substr(0,laenge*2 + 2);  
     body = body.substr(laenge*2 + 2,body.length);
     laenge = parseInt(body.substr(0, 2),16);        
     key =  stueck.substr(2, 2);  

        if (command === "01") {  // Data Command 
        
            switch (key) {
                case "01":    // 'Device ID'
                        var EMEI = stueck.substr(5, 1) + stueck.substr(7, 1) + stueck.substr(9, 1) + stueck.substr(11, 1) + stueck.substr(13, 1)+ stueck.substr(15, 1)+ stueck.substr(17, 1)+ stueck.substr(19, 1)+ stueck.substr(21, 1)+ stueck.substr(23, 1)+ stueck.substr(25, 1)+ stueck.substr(27, 1)+ stueck.substr(29, 1)+ stueck.substr(31, 1)+ stueck.substr(33, 1);

                    break;

                case "24":  //'General Data'
                        var zeit = parseInt(changeEndianness(stueck.substr(4,8)), 16);                        
                        var dateFormat = new Date(zeit * 1000);
 //                            if (logging == 1) { console.log('*** 24 general Data ***   ZEIT:' + dateFormat);}

                    break;

                case "28":  //'Beacon'


                        var BeaconMac = stueck.substr(6, 12).toUpperCase();
                        BeaconMac = BeaconMac.substr(0, 2) + ':' + BeaconMac.substr(2, 2) + ':' + BeaconMac.substr(4, 2) + ':' + BeaconMac.substr(6, 2) + ':' + BeaconMac.substr(8, 2)+ ':' + BeaconMac.substr(10, 2) ;

                        var rssi = stueck.substr(18, 2);
                        rssi = hexTo8Bits(rssi);

                        var mrssi = stueck.substr(20, 2);
                        mrssi = hexTo8Bits(mrssi);

                        var Latitude = changeEndianness(stueck.substr(22, 8));
                        Latitude = hex2Dec(Latitude)/10000000;

                        var Longitude = changeEndianness(stueck.substr(30, 8));
                        Longitude = hex2Dec(Longitude)/10000000;

                        var BeaconName = stueck.substr(38) ;
                        BeaconName = hex2ascii(BeaconName);

 //                           if (logging == 1) { console.log('***Beacon***  Name:' + BeaconName + '  Mac:' + BeaconMac + '  rssi:' + rssi +  '  mrssi:' + mrssi + '  Lat:' +  Latitude + '  Long:' + Longitude ); }

                    break;

                case "20":  
                   if (logging == 1) { console.log('*** GPS ***');}

                    break;

                case "21":  
                
                    if (logging == 1) {console.log('*** Cell towers ***');}

                    break;


                case "22":  // 'WIFI Tower'
                        var Wifistueck = stueck.substr(4);
                            for (var a = 0; a < (laenge - 2) *2 ; a = a + 14 ) { 
                                var rsi = hexTo8Bits(Wifistueck.substr(0, 2));
                                var WifiMac = Wifistueck.substr(2, 12).toUpperCase();
                                WifiMac = WifiMac.substr(0, 2) + ':' + WifiMac.substr(2, 2) + ':' + WifiMac.substr(4, 2) + ':' + WifiMac.substr(6, 2) + ':' + WifiMac.substr(8, 2)+ ':' + WifiMac.substr(10, 2) ;
                                Wifistueck = Wifistueck.substr(14);
 //                                   if (logging == 1) {console.log('*** WIFI towers ***  rsi:'  + rsi + ' mac:' + WifiMac);}
                            }

                    break;


                case "02":    // 'alarm Code'
                        
                    var alarmcode = stueck.substr(4, 8);
                        alarmcode =  changeEndianness(alarmcode);

                        switch (alarmcode.substring(4)) {
                            case "0001": alarm = 'BatteryLow';  break;
                            case "0002": alarm = 'BatteryLow';  break;
                            case "0004": alarm = 'SturzAlarm';  break;
                            case "0008": alarm = 'LageAlarm';  break;
                            case "0100": alarm = 'Ausgeschaltet';  break;
                            case "0200": alarm = 'Eingeschaltet';  break;
                            case "4000": alarm = 'Bewegungsalarm';  break;
                            case "8000": alarm = 'Nichtbewegungsalarm';  break;
                            case "1000": alarm = 'SOSKnopf';  break;
                            case "2000": alarm = 'Knopf1';  break;
                            case "4000": alarm = 'Knopf2';  break;
                            default: alarm = alarmcode;   break;
                        } 

                        var zeit = parseInt(changeEndianness(stueck.substr(12)), 16);                        
                        var dateFormat = new Date(zeit * 1000);

                            if (logging == 1) { console.log('***ALARM ***  : ' + alarm + ' ZEIT:' + dateFormat); }
                    break;
                default:
                   // if (logging == 1) { console.log('++++Data Command+++nicht verarbeitet   ' + stueck); }
                break;
            } 





    
        } else if (command == "03") {   // Service
                switch (key) {
                    case "01":    // 'Device ID'
                            var EMEI = stueck.substr(5, 1) + stueck.substr(7, 1) + stueck.substr(9, 1) + stueck.substr(11, 1) + stueck.substr(13, 1)+ stueck.substr(15, 1)+ stueck.substr(17, 1)+ stueck.substr(19, 1)+ stueck.substr(21, 1)+ stueck.substr(23, 1)+ stueck.substr(25, 1)+ stueck.substr(27, 1)+ stueck.substr(29, 1)+ stueck.substr(31, 1)+ stueck.substr(33, 1);
                            var zeit = Math.round(new Date().getTime()/1000);
                        break;
                case "24":    // 'EMEI im heatzbeatsignal'
                      var EMEI =  m.substr(23, 1) + m.substr(25, 1) + m.substr(27, 1) + m.substr(29, 1)+ m.substr(31, 1)+ m.substr(33, 1)+ m.substr(35, 1)+ m.substr(37, 1)+ m.substr(39, 1)+ m.substr(41, 1)+ m.substr(43, 1)+ m.substr(45, 1)+ m.substr(47, 1)+ m.substr(49, 1) + m.substr(51, 1) ;
                     if (logging == 1) {   console.log('*** Heartbeat signal... ' + EMEI); }
                    break;
                case "10":    // 'sheartbeat signal'
                        if (stueck == "02105a") { }  // heartbeat signal abfangen, damit es nicht undefiniert ist
                    break;

                default:
                        if (logging == 1) { console.log('++++ Service +++nicht verarbeitet   ' + stueck); }
                    break;                    
                }                
    
        } 


        
    bindata = key;
  
//    // Schleife beenden
    i++;
    if (body.length < 10) {i = 30;}
    }


// ACK senden
    var tmp = acksenden(sequenceid);
          if (logging == 1) { console.log('ANTWORT 1:' + tmp);}


// datum vorbereiten
if (zeit < 1) {   var zeit = Math.round(new Date().getTime()/1000);   }
var date =  new Date( zeit * 1000).toISOString().slice(0, 19).replace('T', ' ');




//*************************************************
// ALARM detected
//*************************************************

if (alarm != 0) {  // alarm speichern
    console.log('ALARM DETECTED')   


}



var dateFormat = new Date(zeit * 1000);
 if (logging == 1) { console.log('VJ head: ' + head +'  command:' + command + ' EMEI:' + EMEI + ' alarm: ' + alarm + ' zeit: ' + dateFormat + ' sequenceid: ' + sequenceid); }




// ------------------ VJ stop ------------------------//





  });
  
      // Handle connection errors
      socket.on('error', (error) => {
        console.log(`Error connecting to tracker at ${IPAddress}: ${error}`);
      });
  
       // Add a 'close' event handler to this instance of socket
 socket.on('close', function(data) {
  console.log('VJ CLOSED: ' + socket.address );
});
    });
  };
  function findDevices(){
    NetInfo.fetch().then(connectionInfo => {
      if (connectionInfo.type === 'wifi') {
        NetInfo.scanWifi().then(networks => {
          const connectedDevices = networks.filter(network => network.BSSID !== '00:00:00:00:00:00'); // mac address format of gps tracker
          // Process the list of connected devices
          establishTCPConnections(connectedDevices);
        });  
      }
    });
    
  }


var crcTable = [0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5,
  0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b,
  0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210,
  0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
  0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c,
  0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401,
  0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b,
  0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
  0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6,
  0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738,
  0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5,
  0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969,
  0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96,
  0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc,
  0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
  0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03,
  0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd,
  0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6,
  0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
  0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a,
  0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb,
  0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1,
  0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c,
  0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2,
  0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb,
  0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
  0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447,
  0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8,
  0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2,
  0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
  0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9,
  0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827,
  0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c,
  0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0,
  0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d,
  0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07,
  0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
  0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba,
  0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74,
  0x2e93, 0x3eb2, 0x0ed1, 0x1ef0];
  

  var current =1;
  var limit =5;
  const [alert,setalert] = useState(true);

  const [sound,setsound] = useState();

useEffect( ()=>{
  async function soundloader() {

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      staysActiveInBackground: true,
      // ios part remaining
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      // interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false
  });
    const {  sound} = await Audio.Sound.createAsync({
      uri: 'https://res.cloudinary.com/dbdusuqpn/video/upload/v1685889077/alert_qvbemg.mp3',
    }) 
    setsound(sound)

  }
  soundloader()


  
},[])

  async function playSound(){
   if(sound!=null)
    await sound.playAsync()
  }
  async function stopSound(){
    setsound(null)
    await sound.unloadAsync()

  }
  function clickhandle(){
    setalert(false);
    stopSound()
  }

 



  
  useEffect(() => {
    if(alert){
      
      playSound();
    }
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
  

    <View style={styles.container}>
      <Text style ={styles.whitetext} >Make sure your Eview trackers are on the same wifi network!</Text>
      <Text style ={styles.redtxt}> {current} out of {limit} connected.</Text>
      {alert?<TouchableOpacity  onPress={clickhandle}  ><Image style={styles.img} source={require("./assets/alert.png")} ></Image></TouchableOpacity>:<Image style={styles.img} source={require("./assets/alertoff.png")} ></Image>}
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    
    paddingVertical : 100,
    paddingHorizontal : 40,
    flex: 2,
    flexDirection : "column",
    backgroundColor: '#222222',
    alignItems:  "center",
    justifyContent:  "space-around",
    
  },
  img:{
width : 300
  },
  redtxt: {
    
    flex: 1,
    fontSize : 30,
    color: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  whitetext: {
    flex: 1,
    fontSize : 18,
    color: 'white',
   
  },
});
