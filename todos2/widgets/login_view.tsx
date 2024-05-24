import React from 'react'

import Dialog from "react-native-dialog"

import LoginViewModel from '../view_models/login_view_model'
import { Text } from 'react-native'

interface IProps  {
  viewModel: LoginViewModel
  errors: any
}

interface IState  {
  visible: boolean
  showRegisterForm: boolean
  // email: string
  // password: string
  // password2: string
  // firstName: string
  // lastName: string
  errors: any
}

export default class LoginView extends React.Component<IProps, IState> {
  public state: IState = {
    visible: true,
    showRegisterForm: false,
    // email: "",
    // password: "",
    // password2: "",
    // firstName: "",
    // lastName: "",
    errors: []
  }
  private data = {
    email: "",
    password: "",
    password2: "",
    firstName: "",
    lastName: ""
  }

  componentDidUpdate(prevProps: IProps): void {
    if (this.props.errors != prevProps.errors) {
      this.setState({ errors: this.props.errors })
    }   
  }

  render() {
    const { errors } = this.state
    const { visible, showRegisterForm } = this.state
    return (showRegisterForm 
      ? <Dialog.Container visible={visible}>
          <Dialog.Title>Register</Dialog.Title>
          <Dialog.Description>Please, insert your data</Dialog.Description>
          <Dialog.Input placeholder="e-mail" wrapperStyle={errors["email"] ? {borderColor: 'red'} : undefined} label={errors["email"]} autoCapitalize={'none'} onChangeText={text => this.data.email = text }></Dialog.Input>
          <Dialog.Input placeholder="password" wrapperStyle={errors["password"] ? {borderColor: 'red'} : undefined} label={errors["password"]} autoCapitalize={'none'} secureTextEntry={true} onChangeText={text => this.data.password = text }></Dialog.Input>
          <Dialog.Input placeholder="re-type password" wrapperStyle={errors["password2"] ? {borderColor: 'red'} : undefined} label={errors["password2"]} autoCapitalize={'none'} secureTextEntry={true} onChangeText={text => this.data.password2 = text }></Dialog.Input>
          <Dialog.Input placeholder="first name" wrapperStyle={errors["first_name"] ? {borderColor: 'red'} : undefined} label={errors["first_name"]} autoCapitalize={'words'} onChangeText={text => this.data.firstName = text }></Dialog.Input>
          <Dialog.Input placeholder="last name" wrapperStyle={errors["last_name"] ? {borderColor: 'red'} : undefined}label={errors["last_name"]} autoCapitalize={'words'} onChangeText={text => this.data.lastName = text }></Dialog.Input>
          <Dialog.Button label="Register" bold={true} onPress={() => this.onRegisterSubmit() }/>
          <Dialog.Button label={`...or Sign-In \u27A4`} onPress={() => this.setState({ showRegisterForm: false, errors: [] })}/>
        </Dialog.Container>
      : <Dialog.Container visible={visible}>
          <Dialog.Title>Login</Dialog.Title>
          <Dialog.Description>Please, insert your credentials</Dialog.Description>
          <Dialog.Input wrapperStyle={errors["email"] ? {borderColor: 'red'} : undefined} label={errors["email"]} placeholder="e-mail" autoCapitalize={'none'} onChangeText={text => this.data.email = text }></Dialog.Input>
          <Dialog.Input wrapperStyle={errors["password"] ? {borderColor: 'red'} : undefined} label={errors["password"]} placeholder="password" autoCapitalize={'none'} secureTextEntry={true} onChangeText={text => this.data.password = text }></Dialog.Input>
          <Dialog.Button label="Login" bold={true} onPress={() => this.onLoginSubmit() }/>
          <Dialog.Button label={`...or Register \u27A4`} onPress={() => this.setState({ showRegisterForm: true, errors: [] })}/>
        </Dialog.Container>
    )
  }

  // MARK: - Private

  private async onLoginSubmit() {
    const { viewModel } = this.props
    const { email, password } = this.data
    await viewModel.login(email, password)
  }

  private async onRegisterSubmit() {
    const { viewModel } = this.props
    const { email, password, password2, firstName, lastName } = this.data
    await viewModel.register(email, password, password2, firstName, lastName)
  }

}