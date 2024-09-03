import React from 'react'
import { Route, useNavigation } from 'react-router-dom'
import { useGlobalContext } from '../context/appContext'

const PrivateRoute = ({ children, ...rest }) => {
  const { user } = useGlobalContext()
  const navigate = useNavigation();
  return (
    <Route
      {...rest}
      render={() => {
        return user ? children : <navigate to='/'></navigate>
      }}
    ></Route>
  )
}
export default PrivateRoute
