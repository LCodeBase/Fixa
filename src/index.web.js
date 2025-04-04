import { AppRegistry } from 'react-native';
import App from '../App';
import { name as appName } from '../app.json';

// Registra o componente principal para web
AppRegistry.registerComponent(appName, () => App);

// Inicializa a aplicação web
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root')
});