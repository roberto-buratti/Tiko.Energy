# Tiko.Energy
## Mobile Coding Exercise

### General Description

The app has been implemented using react-native and tested on iOS (on several physical devices) only (sorry, at the moment I have no Android devices).

The app has been implement using the **MVVM** design pattern, so each page delegates all the business logic to it `viewModel`.

The `viewModel` is always injected from outside, so every scene is unit-testable. I'm aware that it was not requested but this is the way I normally work.

I reused somewhere code I wrote for other apps but most of the code if fresh new.  
What is not new is the app architecture, since I always use the same design patterns (...when I can choose).

There are 3 important services that implement the interaction with the server:

1. `ServiceManager`

It is the global Facade that implements all the services the app needs to call. 

Every view model that needs to interact with the server should use the (injected) shared instance of the service manager.

`ServiceManager` is normally a singleton but this is not mandatory.  
It should be used ***exclusively*** by view models, never by views or models.

2. `UserManager`.

It is responsible for the user management.
In particular, it ***persists*** locally any registered user (because the login method doesn't return user data but just the access/refresh tokens).

At startup, it is asked to `rehydrate`, so the user doesn't need to login every time.

3. `NetworkManager`. 

It is just responsible for actually doing the calls via http.  
It doesn't know anything about models and data structures used by the app.  
It just knows about HTTP, REST, status codes etc...  
It handles timeout and validates the status code of the response.

It must be used ***solely*** by the `ServiceManager` (if you need to mock the service manager for testing purpouses, you won't need to access the network manager).

### Screens & Use cases

I have done it as simply as possible, the UI/UX design is out of scope.
The app has just one app-bar and one screen: 

- `Todo List`: The list of the Todos 

#### App Bar

It shows one button for creating a new todo and a tappable avatar (to logout).

#### Todo List

You have a list of (tappable) todos, that show the description and eventually a checkmark.
The details are shown in a bottom sheet.

##### **Todo Details**

This sheet shows:

- a TextInput for the description
- a Switch for the value "done"
- 3 buttons: Save, Delete, Close.

### Notes

The call `/token/verify/` has not been used.
Instead, the network manager intercepts any 401 and tries to refresh the token and to redo the failed call.

Inside the code, relevant comments are marked with a leading  
`// [ROB]`

### Known Issues


