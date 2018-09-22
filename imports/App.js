import { Meteor } from 'meteor/meteor'
import { withTracker } from 'meteor/react-meteor-data'
import React,{ Component } from 'react'
import Loadable from 'react-loadable'
import { Switch, Route, Redirect } from 'react-router-dom'
import Loading from './ui/common/Loading'

const MainLayout = Loadable({
  loader: () => import('./ui/layouts/MainLayout'),
  loading: Loading
})
const Login = Loadable({
  loader: () => import('./ui/account/Login'),
  loading: Loading
})
const ForgotPassword = Loadable({
  loader: () => import('./ui/account/ForgotPassword'),
  loading: Loading
})

const NotFound = Loadable({
  loader: () => import('./ui/common/NotFound'),
  loading: Loading
})

// This is doing double duty. It protects the auth routes,
// but also prevents SSR from trying to render these
// routes.
const PrivateRoute = withTracker((props) => ({
  userId: Meteor.isClient && Meteor.userId()
}))(({ render, ...props }) => (
  <Route render={
    (routeProps) => (props.userId
      ? render(Object.assign({}, props, routeProps))
      : <Redirect to={{
        pathname: '/sign-in',
        state: { from: props.location }
      }} />)
  } />
))

// We specifically want to delay the creation of the Loadable
// object, because we don't want it to register to preload
// on the server.
const LateLoadable = (config) => class extends Component {
  loadable = Loadable(config)
  render () {
    return <this.loadable {...this.props} />
  }
}

const AdminApp = LateLoadable({
  loader: () => import('./ui/admin/AdminApp'),
  loading: Loading
})

export default class App extends Component {
  render () {
    return <Switch>
      <Route path="/sign-in" render={(props) => (
        <MainLayout pageClass="page home" title="Sign In" {...props}>
          <Login mode="login" {...props} />
        </MainLayout>
      )} />
      <Route path="/sign-up" render={(props) => (
        <MainLayout pageClass="page sign-up" title="Sign Up" {...props}>
          <Login mode="sign-up" {...props} />
        </MainLayout>
      )} />
      <Route path="/forgot-password" render={(props) => (
        <MainLayout pageClass="page forgot-password" title="Forgot Password" {...props}>
          <ForgotPassword {...props} />
        </MainLayout>
      )} />
      <PrivateRoute path="/admin" render={(props) => (
        <AdminApp {...props} />
      )} />
      <Route path="/" render={(props) => (
        <MainLayout {...props}>
          <div>Home Page</div>
        </MainLayout>
      )} />
      <Route render={(props) => (
        <MainLayout {...props} title="404 - Not Found">
          <NotFound {...props} />
        </MainLayout>
      )} />
    </Switch>
  }
}