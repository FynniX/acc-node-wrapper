# acc-node-wrapper

[Assetto Corsa Compitizione](https://www.assettocorsa.it/competizione/) SDK and Shared Memory implementation for Node.js.

With ***acc-node-wrapper*** you have a wrapper which gives you data from the [Assetto Corsa Compitizione](https://www.assettocorsa.it/competizione/) Broadcasting SDK and from the Shared Memory.
This is the [Assetto Corsa Compitizione](https://www.assettocorsa.it/competizione/) Broadcasting SDK rewritten in Node.js. It can also access the Shared Memory from [Assetto Corsa Compitizione](https://www.assettocorsa.it/competizione/). 

## Requirements

- You need a Windows Machine because the Shared Memory Module only works on Windows.
- You need a ACC which is configured for the Broadcasting SDK.

## Installing

This package was tested under [Node.js](https://nodejs.org/) 15.11.0 x64.

[Assetto Corsa Compitizione](https://www.assettocorsa.it/competizione/) 1.7.4 was used while testing.

`npm install acc-node-wrapper --save`

## API documentation

# Broadcast SDK

```js
const ACCNodeWrapper = require('acc-node-wrapper')
const wrapper = new ACCNodeWrapper()

/**
 * @name initBroadcastSDK
 * @comment This is the init function for the ACC Node Wrapper. This inits the Broadcast SDK.
 * @param SERVER_DISPLAYNAME
 * @param SERVER_IP
 * @param SERVER_PORT
 * @param SERVER_PASS
 * @param SERVER_COMMANDPASS
 * @param UPDATE_INTERVAL
 * @param Logging
 */
wrapper.initBroadcastSDK("Max", "127.0.0.1", 9000, "123", "123", 250, true)
```

| Event | Description |
| --- | --- |
| "REGISTRATION_RESULT" | Result of REGISTRATION_RESULT. |
| "REALTIME_UPDATE" | Result of REALTIME_UPDATE. |
| "REALTIME_CAR_UPDATE" | Result of REALTIME_CAR_UPDATE. |
| "ENTRY_LIST" | Result of ENTRY_LIST. |
| "TRACK_DATA" | Result of TRACK_DATA. |
| "ENTRY_LIST_CAR" | Result of ENTRY_LIST_CAR. |
| "BROADCASTING_EVENT" | Result of BROADCASTING_EVENT. |

```js
wrapper.on("REGISTRATION_RESULT", result => {
    console.log(result)
})
```

| Function | Description |
| --- | --- |
| Disconnect() | Disconnect from connection. |
| SetFocus() | This function sets the focus of the camera. |
| SetCamera() | This function sets the active camera. |
| RequestInstantReplay() | This function is requesting instant replay. |
| RequestHUDPage() | This function is requesting a HUD Page change. |

```js
wrapper.Disconnect()
```

# Shared Memory

```js
const ACCNodeWrapper = require('acc-node-wrapper')
const wrapper = new ACCNodeWrapper()

/**
 * @name initSharedMemory
 * @comment This is the init function for the ACC Node Wrapper. This inits the Shared Memory.
 * @param M_PHYSICS_UPDATE_INTERVAL
 * @param M_GRAPHICS_UPDATE_INTERVAL
 * @param M_STATIC_UPDATE_INTERVAL
 * @param Logging
 */
wrapper.initSharedMemory(250, 250, 250, true)
```

| Event | Description |
| --- | --- |
| "M_PHYSICS_RESULT" | Result of Physics File in Shared Memory. |
| "M_GRAPHICS_RESULT" | Result of Graphics File in Shared Memory. |
| "M_STATIC_RESULT" | Result of Static File in Shared Memory. |

```js
wrapper.on("M_PHYSICS_RESULT", result => {
    console.log(result)
})
```

| Function | Description |
| --- | --- |
| disconnectSharedMemory() | Disconnect from Shared Memory. |

```js
wrapper.disconnectSharedMemory()
```

## License

Released under the [MIT License](https://github.com/FynniX/acc-node-wrapper/blob/main/LICENSE).
