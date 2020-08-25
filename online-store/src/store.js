import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createAction,handleActions } from 'redux-actions';
import thunk from 'redux-thunk';
import {api} from './apiclient.js';

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
            while (uris.length > 20) { // LRU of size 20
                const poped = uris.pop()
                resources.delete(poped)
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

export function getNStoreNSet(uri,obj,setObj) {
    const mobj = getStore().httpResources.resources.get(uri);
    if (mobj) {
        setObj(mobj);
        return;
    }
    store.dispatch(()=> {
        api().get(uri).then(
            response => store.dispatch(storeResource({'uri':uri,'data':response.data})),
            error => store.dispatch(storeResource({'uri':uri,'data':{error:error}}))
        )
    })
    let unsubscribe;
    unsubscribe = store.subscribe(()=>{
        //console.log(getStore().httpResources.resources)
        const mobj = getStore().httpResources.resources.get(uri);
        if (mobj) {
            setObj(mobj);
            unsubscribe();
        }
    })
}









export function storeHttpResource(uri) {
    return store.dispatch(()=> {
        console.log(store.getState())
        if (store.getState().httpResources.resources.get(uri)) { // check the resource is already loaded
            return Promise.resolve();
        }
        return store.dispatch(()=>
            api().get(uri).then(
                response => store.dispatch(storeResource({'uri':uri,'data':response.data})),
                error => store.dispatch(storeResource({'uri':uri,'data':{error:error}}))
            )
        )
    })
}

export function getStore() {
    return store.getState();
}