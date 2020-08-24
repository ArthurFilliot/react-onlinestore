import React,{useRef} from 'react';
import logo from './logo.svg';
import './App.css';
import {storeHttpResource, getStore} from './store';

function App() {
  const resultRef=useRef(null);
  const getServerData=()=>{
    fetch("/getDataFromServer", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({id:123})
    })
    .then(response => {
      return response.json();
    })
    .then(result => {
      if(resultRef.current!=null){
        resultRef.current.innerHTML=result.content;
      }
    })
    .catch(error => {
      console.error(error);
    });
  }
  let cnt=1;
  const checkStoreLoad=()=> {
    console.log("cnt:"+cnt)
    storeHttpResource("api/products/byid/"+cnt);
    cnt++;
    console.log(getStore().httpResources);
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          That is Client side code in React. <a href='javascript:void(0)' onClick={getServerData}>Click Here</a>
        </p>
        <div>This is the example of React Nodejs.</div>
        <div ref={resultRef}></div>
        <button onClick={checkStoreLoad}>Check</button><br />
      </header>
    </div>
  );
}

export default App;
