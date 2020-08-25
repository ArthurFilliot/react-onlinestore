import React,{Component, useRef, useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {storeHttpResource, getStore, storeHttpResourceNSubscribe} from './store';

export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      nbTry: 1
    }
  }

  getNbTry=()=> {
    return this.state.nbTry;
  }

  setNbTry=(nb)=> {
    this.setState({nbTry:this.state.nbTry+1})
  }

  initCheckStoreLoad=()=>{
    const thiscomp = this;
    let cnt=1;
    return function() {
      cnt=cnt>10?1:cnt;
      console.log("nbTry:"+thiscomp.getNbTry()+" - cnt:"+cnt)
      storeHttpResource("api/products/byid/"+cnt);
      cnt++;
      thiscomp.setNbTry(thiscomp.getNbTry()+1);
      console.log(getStore().httpResources);
    }
  };
  checkStoreLoad=this.initCheckStoreLoad(this);

  render=() => {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            That is Client side code in React.
          </p>
          <div>This is the example of React Nodejs.</div>
          <button onClick={this.checkStoreLoad}>Check</button><br />
          <ProductComp id="1" />
          <ProductComp id="2" />
          <ProductComp id="3" />
          <ProductComp id="4" />
          <ProductComp id="5" />
          <ProductComp id="6" />
          <ProductComp id="7" />
          <ProductComp id="8" />
          <ProductComp id="9" />
          <ProductComp id="10" />
        </header>
      </div>
    )
  }

}

const ProductComp=(args)=> {
  const [obj, setObj] = useState(null);
  const uri = "api/products/byid/"+args.id
  
  useEffect(() => {
    let unsubscribe;
    function retrieveObjFromStore() {
      console.log(getStore().httpResources.resources)
      const obj = getStore().httpResources.resources.get(uri);
      if (obj) {
        setObj(obj);
        if (unsubscribe) unsubscribe();
      }
    }
    retrieveObjFromStore()
    if (obj===null) {
      unsubscribe = storeHttpResourceNSubscribe(uri,retrieveObjFromStore)
    }
    
  })

  if (obj===null) {
    return <div>Chargement...</div>
  }
  return <div>
    {obj.name}
  </div>
}