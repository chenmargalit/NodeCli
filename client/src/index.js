// importing a css module for webpack
import 'materialize-css/dist/css/materialize.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import reducers from './reducers';

import App from './components/App';

// createStore takes 3 arguments, first is all the reducers we have,
// second is initial state,
// third is middlewares
const store = createStore(reducers, {}, applyMiddleware(reduxThunk));

const axios = require('axios');
window.axios = axios;

// React dom takes u parameters. First is the app's instance, the instance of the class
// The second is a reference to an existing dom node in the html file. The id of the div in the html file,
// (comes automatically with create react app) is named root. You can see this in index.html in public folder

// To connect redux with react we put the App inside the redux's provider, which will give redux access to anything in App (all our components). So basically any component will have all access to all redux state.
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#root')
);
