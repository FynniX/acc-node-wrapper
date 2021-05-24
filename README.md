# acc-node-wrapper

[Assetto Corsa Compitizione](https://www.assettocorsa.it/competizione/) SDK implementation for Node.js.

With ***acc-node-wrapper*** you have a wrapper which gives you data from the [Assetto Corsa Compitizione](https://www.assettocorsa.it/competizione/) Broadcasting SDK.
This is the [Assetto Corsa Compitizione](https://www.assettocorsa.it/competizione/) Broadcasting SDK rewritten in Node.js. 

## Installing

This package was tested under [Node.js](https://nodejs.org/) 15.11.0 x64.

`npm install acc-node-wrapper --save`

## API documentation

```js
const ACCNodeWrapper = require('acc-node-wrapper')
const wrapper = new acc_node_wrapper("Max", "127.0.0.1", 9000, "123", "123", 250, true)
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
| RequestConnection() | Requesting a connection. |
| Disconnect() | Disconnect from connection. |
| RequestEntryList() | This function request the entry list. |
| RequestTrackData() | This function request the track data. |
| SetFocus() | This function sets the focus of the camera. |
| SetCamera() | This function sets the active camera. |
| RequestInstantReplay() | This function is requesting instant replay. |
| RequestHUDPage() | This function is requesting a HUD Page change. |

```js
wrapper.Disconnect()
```

## License

Released under the [MIT License](https://github.com/FynniX/acc-node-wrapper/blob/main/LICENSE).
