import React from "react"

import { Spacer, Stack, Switch, Text, TextInput } from "@react-native-material/core"

import TodoModel from "../models/todo_model"
import Button from "react-native-dialog/lib/Button"

interface IProps  {
  todo: TodoModel
  errors: any
  onSave: (todo: TodoModel) => void 
  onDelete: (todo: TodoModel) => void 
  onClose: () => void 
}

interface IState  {
  clone: TodoModel
}

export default class TodoView extends React.Component<IProps, IState> {
  public state: IState = {
    clone: new TodoModel()
  }

  componentDidMount(): void {
    const { todo } = this.props
    const clone = TodoModel.fromJson(todo.toJson())
    this.setState({ 
      clone: clone
    })
  }

  render() {
    const { errors } = this.props
    const { clone } = this.state

    return <>
      <Stack justify={'between'} spacing={16} style={{ height:'100%', margin: 16, paddingBottom: 16 }}>
        <TextInput 
          variant="standard" 
          maxLength={30} 
          placeholder={"Description"}
          helperText={errors["description"]}
          style={errors["description"] ? { borderColor: 'red', borderWidth: 1, borderRadius: 8 } : undefined}
          onChangeText={(text) => clone.description = text}
        >
          {clone.description}
        </TextInput>
        {clone.id && <>
          <Stack direction="row" spacing={16} style={{alignItems:'center'}}>
            <Spacer />
            <Text style={{textAlignVertical: 'center'}}>
                Done?
            </Text>
            <Switch
              value={clone.done} 
              onValueChange={(value) => { 
                clone.done = value 
                this.setState({}) // need to force a refresh to properly redraw the switch
              }}
            />
          </Stack>
        </>}
        <Spacer />
        <Stack direction="row" justify={'between'} style={{alignItems:'center', margin: 16}}>
          <Button bold label={"Save"} onPress={() => this.onSave()}></Button>
          <Button label={"Delete"} disabled={clone.id == undefined} color={clone.id == undefined ? 'lightgrey' : 'red'} onPress={() => this.onDelete()}></Button>
          <Button label={"Close"} onPress={() => this.onClose()}></Button>
        </Stack>
        <Spacer />
      </Stack>
    </>
  }

  private onSave() {
    const { onSave } = this.props
    const { clone } = this.state
    // console.log(`*** TodoView:onSave: done=${clone} todo=${JSON.stringify(clone)}`)
    onSave(clone)
  }

  private onDelete() {
    const { todo, onDelete } = this.props
    onDelete(todo)
  }

  private onClose() {
    const { onClose } = this.props
    onClose()
  }
}