import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createAction,handleActions } from 'redux-actions';
import thunk from 'redux-thunk';
import axios from 'axios';

const initialState = {
    httpResources:  { 
        uris: [],
        resources: new Map()
    }
}

const storeResource = createAction('STORE_RESOURCE');
const httpResourcesReducer = handleActions(
    {
        STORE_RESOURCE: (state, action) => {
            const uri = action.payload.uri
            const obj = action.payload.data
            const uris = state.uris
            const resources = state.resources
            uris.unshift(uri);
            resources.set(uri,obj)
            while (uris.length > 5) { // LRU of size 5
                uris.pop()
                resources.delete(uri)
            }
            return state
        }
    },
    { 
        uris: initialState.httpResources.uris, 
        resources: initialState.httpResources.resources 
    }
);

const rootReducer = combineReducers({httpResources: httpResourcesReducer});

const store = createStore(rootReducer, applyMiddleware(thunk));

function makeCall(uri) {
    return function (dispatch) {
        console.log("GET request")
        return axios.get(uri).then(
            response => dispatch(storeResource({'uri':uri,'data':response.data})),
            error => console.log("error getting uri : " + uri + " - error : " + error)
        );
    };
}

function storeHttpResourceSteps(uri) {
    return function (dispatch, getState) {
        console.log(getState())
        if (getState().httpResources.resources.get(uri)) { // check the resource is already loaded
            return Promise.resolve();
        }
        return dispatch(makeCall(uri))
    };
  }

export function storeHttpResource(uri) {
    return store.dispatch(storeHttpResourceSteps(uri));
}

export function getStore() {
    return store.getState();
}