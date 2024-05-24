# Tiko.Energy
## Mobile Coding Exercise

### General Description

The app has been implemented using react-native and tested on iOS (on several physical devices) only (sorry, at the moment I have no Android devices).

The app has been implement using the **MVVM** design pattern, so each page delegates all the business logic to it `viewModel`.

Moreover, it has been widely used the **Delegate** design pattern, so each interaction between services can be easily mocked and tested.

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
The app has just one app-bar, one modal dialog (for login/register) and one screen: 

- `Todo List`: The list of the Todos 

Any error is shown in a red snackbar at the bottom of the screen.

#### App Bar

It shows one button for creating a new todo and a tappable avatar (to logout).

#### Login/Register

This modal dialog is shown whenever the user is not logged and cannot be dismissed.
It handles both the login and the registration of a new user.
Any error on a specific field is shown highlighting the field and displaying the error message inside it.

#### Todo List

You have a list of (tappable) todos, that show the description and eventually a checkmark.
The details are shown in a bottom sheet.

##### **Todo Details**

This sheet shows:

- a TextInput for the description
- a Switch for the value "done"
- 3 buttons: Save, Delete, Close.

### Code Structure

The source code is organized in a few separated folders:

- `managers`. It contains the managers.
- `messages`. It contains the definition of generic request and generic response.
- `models`. It contains all the models used by the app. In our case, just `TodoModel`, `UserModel` and `AuthenticationResponseModel`.
- `view_models`. It contains all the view-models used by the app. In our case, just `HomeViewModel` and `LoginViewModel`. 
- `pages`. It contains all the pages (i.e. the containers) used by the app. In our case, just `HomePage`.
- `widgets`. It contains all the generic views used by the pages. In our case we have:

  - `AppBar`. The app bar widget
  - `LoginView`. The Login/Register widget shown modally
  - `TodoView`. The widget responsible for the editing
  - `TodoCard`. The widget responsible for displaying the todo details into the list

This structure is very easy because the application is very simple.
Normally, in real-life projects, I use to have a `scenes` folder and a number of sub-folders, one for each use-case.
Any sub-folder groups all the pages and the view-models belonging to the same use-case. 

### Notes

The call `/token/verify/` has not been used.
Instead, the network manager intercepts any 401 and tries to refresh the token and to redo the failed call.

Inside the code, relevant comments are marked with a leading  
`// [ROB]`

### Known Issues



