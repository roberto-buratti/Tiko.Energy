//
//  user_manager.ts
//  todos
//
//  Created by Roberto O. Buratti on 22/05/2024.
//

import EncryptedStorage from 'react-native-encrypted-storage'

import UserModel from '../models/user_model'

export interface IUserManagerDelegate {
  onUserChanged(user?: UserModel): void
}

export default class UserManager {
  currentUser?: UserModel
  private allUsers: UserModel[] = []
  private static readonly userStorageKey = "UserManager/users"
  
  delegate: IUserManagerDelegate

  constructor(delegate: IUserManagerDelegate) {
    this.delegate = delegate
    this.rehydrate()
  }

  getUser(email: string): UserModel | undefined {
    // console.log(`*** UserManager:getUser: email=${email}`)
    // console.log(`*** UserManager:getUser: allUsers=${JSON.stringify(this.allUsers)}`)
    // console.log(`*** UserManager:getUser: result=${JSON.stringify(this.allUsers.find((u) => u.email == email))}`)
    return this.allUsers.find((u) => u.email == email)
  }

  setCurrentUser(user: UserModel | undefined) {
    this.currentUser = user
    if (user != undefined) {
      const index = this.allUsers.findIndex((u) => u.email == user?.email)
      if (index < 0) {
        this.allUsers.push(user)
      } else {
        this.allUsers[index] = user
      }
    }
    this.persist()
    // console.log(`*** UserManager:setCurrentUser: user=${JSON.stringify(user)}`)
    this.delegate.onUserChanged(user)
  }

  // MARK: - Private

  private async rehydrate(): Promise<void> {
    try {
      const value = await EncryptedStorage.getItem(UserManager.userStorageKey)
      // console.log(`*** UserManager:rehydrate: value=${value}`)
      if (value == null) {
        this.allUsers = []
        return
      }
      const json = JSON.parse(value)
      // console.log(`*** UserManager:rehydrate: json=${JSON.stringify(json)}`)
      this.allUsers = json["allUsers"].map((j: { [key: string]: any }) => UserModel.fromJson(j))
      if (json["currentUser"] != undefined) {
        this.currentUser = UserModel.fromJson(json["currentUser"])
      }
      // console.log(`*** UserManager:rehydrate: allUsers=${JSON.stringify(this.allUsers)}`)
      this.delegate.onUserChanged(this.currentUser)
    } catch (e) {
      this.allUsers = [];
      this.currentUser = undefined
    }
  }

  private async persist(): Promise<void> {
    const key: string = UserManager.userStorageKey
    const data = {
      "allUsers": this.allUsers.map(u => u.toJson()),
      "currentUser": this.currentUser?.toJson()
    }
    const value: string = JSON.stringify(data)
    // console.log(`*** UserManager:persist:${value}`)
    return EncryptedStorage.setItem(key, value)
  }

}
