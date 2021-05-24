module.exports = {
    outboundMessageTypes: {
        REGISTER_COMMAND_APPLICATION: 1,
        UNREGISTER_COMMAND_APPLICATION: 9,
        REQUEST_ENTRY_LIST: 10,
        REQUEST_TRACK_DATA: 11,
        CHANGE_HUD_PAGE: 49,
        CHANGE_FOCUS: 50,
        INSTANT_REPLAY_REQUEST: 51,
        PLAY_MANUAL_REPLAY_HIGHLIGHT: 52,
        SAVE_MANUAL_REPLAY_HIGHLIGHT: 60
    },
    broadcastingNetworkProtocol: {
        BROADCASTING_PROTOCOL_VERSION: 4
    },
    InboundMessageTypes: {
        REGISTRATION_RESULT: 1,
        REALTIME_UPDATE: 2,
        REALTIME_CAR_UPDATE: 3,
        ENTRY_LIST: 4,
        TRACK_DATA: 5,
        ENTRY_LIST_CAR: 6,
        BROADCASTING_EVENT: 7
    },
    InboundMessageTypesStr: {
        1: "REGISTRATION_RESULT",
        2: "REALTIME_UPDATE",
        3: "REALTIME_CAR_UPDATE",
        4: "ENTRY_LIST",
        5: "TRACK_DATA",
        6: "ENTRY_LIST_CAR",
        7: "BROADCASTING_EVENT"
    }
}