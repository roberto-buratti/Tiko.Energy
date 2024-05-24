// import { StatusBar } from 'expo-status-bar'
import React, { PropsWithChildren, createRef } from 'react'
import { Alert, Appearance, RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native'
import { Colors } from 'react-native/Libraries/NewAppScreen'

import Snackbar from 'react-native-snackbar'
// import Loading from 'react-native-loader-overlay'  // removed. it doesn't work in landscape :@
import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet'

import { NetworkException } from '../managers/network_manager'
import HomeViewModel from '../view_models/home_view_model'
import TodoModel from '../models/todo_model'

import AppBar, { IAppBarDelegate } from '../widgets/app_bar'
import LoginView from '../widgets/login_view'
import TodoView from '../widgets/todo_view'
import TodoCard from '../widgets/todo_card'

interface IProps  {
  viewModel: HomeViewModel
}

interface IState {
  isAuthenticated: boolean
  isLoading: boolean
  errors?: any
  todoList: TodoModel[]
  currentTodo?: TodoModel
}

export default class HomePage extends React.Component<IProps, IState> implements IAppBarDelegate {
  // loadingOverlay: any
  refBottomSheet =  createRef<BottomSheetMethods>()

  public state: IState = {
    isAuthenticated: false,
    isLoading: false,
    todoList: []
  }

  componentDidMount(): void {
    const { viewModel } = this.props
    viewModel.isAuthenticated.addListener(this.isAuthenticatedListener.bind(this));
    viewModel.isLoading.addListener(this.isLoadingListener.bind(this));
    viewModel.error.addListener(this.onErrorListener.bind(this));
    this.setState({ isAuthenticated: viewModel.isAuthenticated.value })
  }

  componentWillUnmount(): void {
    const { viewModel } = this.props
    viewModel.isAuthenticated.removeListener(this.isAuthenticatedListener);
    viewModel.isLoading.removeListener(this.isLoadingListener);
    viewModel.error.removeListener(this.onErrorListener);      
  }

  componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>, snapshot?: any): void {
      if (this.state.currentTodo != undefined && this.state.currentTodo != prevState. currentTodo) {
        this.refBottomSheet.current?.open()
      }
      if (this.state.currentTodo == undefined) {
        this.refBottomSheet.current?.close()
      }
  }

  render() {
    const { isAuthenticated, isLoading, errors: errors, currentTodo, todoList } = this.state
    const { viewModel } = this.props

    const isDarkMode = Appearance.getColorScheme() === 'dark';

    const backgroundStyle = {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    }

    return (
      <>
        <SafeAreaView style={backgroundStyle}>
          <AppBar username={viewModel.username} delegate={this}/>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={{...styles.body, ...backgroundStyle}}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => this.refresh()}/>}
          >
            {
                  todoList.map((todo, index) => {
                    return <TodoCard 
                        key={index} 
                        todo={todo}
                        onTap={(todo: TodoModel) => {
                          this.setState({
                            currentTodo: todo
                          })                      
                        }}/>
                  })
                }
          </ScrollView>
          {!isAuthenticated &&
            <LoginView viewModel={viewModel.getLoginViewModel()} errors={errors ?? {}}/>
          }
        </SafeAreaView>
        { currentTodo &&
          <BottomSheet
            height={300} 
            closeOnBackdropPress={false} 
            closeOnDragDown={false} 
            ref={this.refBottomSheet}
          >
                <ScrollView
                  contentInsetAdjustmentBehavior="automatic"
                  style={{height:"100%"}}
                >
                  <TodoView 
                    todo={currentTodo}
                    errors={errors ?? {}}
                    onSave={(todo: TodoModel) => this.onSavePressed(todo)}
                    onDelete={(todo: TodoModel) => this.onDeletePressed(todo)}
                    onClose={() => { 
                      this.setState({ currentTodo: undefined, errors: undefined })
                    }}
                  />
                </ScrollView>
          </BottomSheet>
        }
      </>
    );
  }

  // MARK: - IAppBarDelegate

  onAddPressed(): void {
    this.setState({
      currentTodo: new TodoModel()
    })
  }

  onAvatarPressed(): void {
    const { viewModel } = this.props
    Alert.alert(
      viewModel.username ?? "", 
      "Please, confirm logout", 
      [
        {
          text: "No, thanks",
          style: 'cancel',
        },
        {
          text: "Logout",
          onPress: () => {
            viewModel.logout()
          },
          style: 'destructive',
        }
      ]
    )
  }

  // MARK: - Listeners

  isAuthenticatedListener(value: boolean): void {
    // console.log(`*** HomePage:isAuthenticatedListener: value=${value}`)
    this.setState({
      isAuthenticated: value
    })
    if (value) {
      this.refresh()
    } else {
      this.setState({
        todoList: [],
        currentTodo: undefined,
        errors: undefined
      })
    }
  }

  isLoadingListener(value: boolean): void {
    // if (value && this.loadingOverlay == undefined) {
    //   this.loadingOverlay = Loading.show({
    //     color: '#FFFFFF',
    //     size: 20,
    //     overlayColor: 'rgba(0,0,0,0.5)',
    //     closeOnTouch: false,
    //     loadingType: 'Bubbles', // 'Bubbles', 'DoubleBounce', 'Bars', 'Pulse', 'Spinner'
    //   })  
    // } else if (!value && this.loadingOverlay != undefined) {
    //   // add a short delay, otherwise it disappears to rapidly
    //   setTimeout(() => {
    //     Loading.hide(this.loadingOverlay)
    //     this.loadingOverlay = undefined  
    //   }, 1000)
    // }
    this.setState({
      isLoading: value
    })
  }

  onErrorListener(error?: NetworkException) {
    const { isAuthenticated } = this.state
    // console.log(`*** HomePage:onErrorListener: error=${JSON.stringify(error)}`)
    this.setState({
      errors: error?.details
    })
    if (error == undefined) {
      return
    }
    let explanation = error.details["detail"]
    let message = explanation ?? error.message ?? "Something went wrong. No details available."
    Snackbar.show({
      numberOfLines: 5,
      text: message,
      backgroundColor: 'red',
      textColor: 'white',
      duration: Snackbar.LENGTH_LONG,
    });
    this.setState({
      errors: error.details
    })
}
  
  // MARK: - Private 

  async refresh() {
    const { viewModel } = this.props
    let todoList = await viewModel.getTodoList()
    this.setState({
      todoList: todoList,
      currentTodo: undefined,
      errors: undefined
    })
  }

  async onSavePressed(todo: TodoModel) {
    const { viewModel } = this.props
    try {
      await viewModel.save(todo)
      this.refresh()
    } catch (error: any) {
      // console.log(`*** HomePage:onSavePressed: got error ${error.message}`)
    }
  }

  async onDeletePressed(todo: TodoModel) {
    const { viewModel } = this.props
    Alert.alert(
      "Delete", 
      `Do you want to delete this todo?\n\n${todo.description}`,
      [
        {
          text: "Never mind",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await viewModel.delete(todo)
              this.refresh()
            } catch (error: any) {
              // console.log(`*** HomePage:onDeletePressed: got error ${error.message}`)
            }
          },
          style: 'destructive',
        }
      ]
    )
  }

}

const styles = StyleSheet.create({
  body: {
    width: "100%",
    height: "85%",
    marginTop: 4,
  }
});


