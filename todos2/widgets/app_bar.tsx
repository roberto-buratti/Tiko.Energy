import React from "react"
import { 
  AppBar, 
  AppBarProps, 
  IconButton,
  Avatar,
  Text,
} from "@react-native-material/core"

export interface IAppBarDelegate {
  onAddPressed(): void
  onAvatarPressed(): void
}

interface IProps extends AppBarProps {
  username?: string
  delegate: IAppBarDelegate
}

interface IState  {
}

export default class MyAppBar extends React.Component<IProps, IState> {
  render() {
    const { username, delegate } = this.props
    return <>
      <AppBar
        title="Todo List"
        leading={props => (
          <IconButton
            icon={props => <Text variant="h4" {...props}>+</Text>}
            onPress={() => { 
              // console.log(`*** MyAppBar:add pressed`)
              delegate.onAddPressed() 
            }}
            {...props}
          />
        )}
        trailing={props =>
          username
            ? <IconButton
                icon={<Avatar label={username} size={28} />}
                onPress={() => delegate.onAvatarPressed()}
                {...props}
              />
            : null
        }
      />
    </>
  }
}