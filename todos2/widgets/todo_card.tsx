import React from "react"

import { Spacer, Stack, Surface, Switch, Text, TextInput } from "@react-native-material/core"

import TodoModel from "../models/todo_model"
import Button from "react-native-dialog/lib/Button"
import { TouchableHighlight, TouchableOpacity } from "react-native"

interface IProps  {
  todo: TodoModel
  onTap: (todo: TodoModel) => void
}

interface IState  {
  // description: string
  // done: boolean
}

export default class TodoCard extends React.Component<IProps, IState> {
  public state: IState = {
    // description: "",
    // done: false
  }

  render() {
    const { todo, onTap } = this.props

    return <>
      <Surface elevation={4} category="medium" style={{
        justifyContent: "center",
        alignItems: "center",
        height: 100,
        marginVertical: 4,
        marginHorizontal: 8
      }}>
        <TouchableOpacity onPress={() => {
          onTap(todo)
        }}>
          <Stack direction="row" justify={"between"} spacing={16} style={{ width:"100%", margin: 8, padding: 8}}>
            <Text variant="body1" numberOfLines={3} style={{flexWrap: 'wrap', "flexShrink": 1, }}>
              {todo.description}
            </Text>
            <Stack direction="row" spacing={16} style={{alignItems:'center'}}>
              <Spacer />
              <Text variant="h5" color="green">
                {todo.done ? `\u2713` : null}
              </Text>
            </Stack>
          </Stack>
      </TouchableOpacity>
      </Surface>

    </>
  }

}