import React,{Component, useState, useEffect} from 'react';
import './App.css';
import {storeHttpResource, getStore, getNStoreNSet} from './store';
import {BrowserRouter, Route, Switch, Redirect, Link} from 'react-router-dom'

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
      // <button onClick={this.checkStoreLoad}>Check</button><br />
      <BrowserRouter>
        <Switch>
          <Route path="/shop/category/:categoryid" render={routeProps => <Shop {...routeProps} /> } />
          <Route path="/shop" render={routeProps => <Shop {...routeProps} /> } />
          <Redirect to="/shop"/>
        </Switch>
      </BrowserRouter>
    )
  }

}

const Product=(args)=> {
  const [product, setProduct] = useState(null);  
  useEffect(
    () => getNStoreNSet(args.rootpath+args.id,product,setProduct),
    [args.id, product])

  if (product===null) {
    return <div className="card m-1 p-1 bg-light">Chargement...</div>
  }
  return <div className="card m-1 p-1 bg-light">
    <h4>{product.name}</h4>
    <span className="badge badge-pill badge-primary float-right">
      ${product.price.toFixed(2)}
    </span>
    <div className="card-text bg-white p-1">
      {product.shortdesc}
    </div>
  </div>
}

const ProductList=(args) => {
  if (args.products==null) {
    return <h4 className="p-2">No Products</h4>
  }
  return args.products.map(p =>
    <Product key={p} id={p} rootpath={args.rootpath}/>
  )
}

const CategoryNavigation=(args)=> {
  return <React.Fragment>
    <Route path={args.baseurl} exact={true} children={routeProps=>
      <Link className={routeProps.match ? "btn btn-block btn-primary":"btn btn-block btn-secondary"} to={args.baseurl}>All</Link>
    }/> 
    
    {args.categories && args.categories.map(cat=> {
      const url = args.baseurl+"/category/"+cat.id;
      return <Route path={url} exact={true} key={cat.id} children={routeProps=>
        <Link className={routeProps.match ? "btn btn-block btn-primary":"btn btn-block btn-secondary"} to={url}>{cat.name}</Link>
      }/>
    })}
  </React.Fragment>
}

const Shop=(args)=> {
  const [categories, setCategories] = useState(null);
  const [category, setCategory] = useState(null);
  useEffect(() => getNStoreNSet("/api/categories",categories,setCategories))
  useEffect(() => {
    console.log("load category, prev category:"+(category ? category.id: 'null'))
    getNStoreNSet("/api/categories/byid/"+args.match.params.categoryid,category,setCategory)
  })

  console.log(args)

  return <React.Fragment>
    <nav className="navbar navbar-expand-lg navbar-light bg-dark m-0">
      <span className="navbar-brand text-light">Online Store</span>
    </nav>
    <div className="container-fluid">
      <div className="row">
          <div className="col-3 p-2">
            <CategoryNavigation baseurl="/shop" categories={categories} />
          </div>
          <div className="col-9 p-2">
            {(category!=null) ? <ProductList products={category.itemids} rootpath={category.itemsrootpath}/> : <span>Search by name</span>}
          </div>
      </div>
    </div>
  </React.Fragment>
}