import { Platform } from 'react-native';

let dmtUrl = '';

{
    Platform.OS == 'android'
        ? dmtUrl = 'https://notable-complete-garfish.ngrok-free.app'
        : dmtUrl = 'https://notable-complete-garfish.ngrok-free.app'
}
// {
//     Platform.OS == 'android'
//         ? dmtUrl = 'http://192.168.23.103:5000'
//         : dmtUrl = 'http://192.168.23.103:5000'
// }

export default dmtUrl;