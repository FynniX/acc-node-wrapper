/*==== Import Section ==== */
const EventEmitter = require('events');
const constants = require('./constants')
const binutils = require('binutils')
const utf8 = require('utf8-bytes')
const moment = require('moment')
const client = require('dgram').createSocket('udp4')

const FirstOrDefault = require('./functions/FirstOrDefault')
const SingleOrDefault = require('./functions/SingleOrDefault')
const readString = require('./functions/ReadString')
const readLap = require('./functions/ReadLap')

const CarInfo = require('./structs/CarInfo')

const {
    DriverCategory,
    CupCategory,
    CarLocationEnum,
    SessionPhase,
    RaceSessionType,
    BroadcastingCarEventType,
    NationalityEnum
} = require('./enums')

/**
 *  @class
 *  @name ACC_Node_Wrapper
 *  @comment ACC SDK implementation for Node.js.
 *  @extends EventEmitter
 */
class ACC_Node_Wrapper extends EventEmitter {
    SERVER_DISPLAYNAME = null
    SERVER_IP = null
    SERVER_PORT = null
    SERVER_PASS = null
    SERVER_COMMANDPASS = null
    UPDATE_INTERVAL = null

    Logging = false
    ConnectionId = null
    lastEntrylistRequest = moment()
    _entryListCars = []

    /**
     * @comment This ist the constructor for the ACC Node Wrapper. Here starts everything.
     * @param SERVER_DISPLAYNAME
     * @param SERVER_IP
     * @param SERVER_PORT
     * @param SERVER_PASS
     * @param SERVER_COMMANDPASS
     * @param UPDATE_INTERVAL
     * @param Logging
     */
    constructor(SERVER_DISPLAYNAME, SERVER_IP, SERVER_PORT, SERVER_PASS, SERVER_COMMANDPASS, UPDATE_INTERVAL, Logging) {
        super();
        this.SERVER_DISPLAYNAME = SERVER_DISPLAYNAME
        this.SERVER_IP = SERVER_IP
        this.SERVER_PORT = SERVER_PORT
        this.SERVER_PASS = SERVER_PASS
        this.SERVER_COMMANDPASS = SERVER_COMMANDPASS
        this.UPDATE_INTERVAL = UPDATE_INTERVAL

        this.Logging = Logging

        client.on('message', (message, udp_info) => {
            /*==== Handling Message ====*/
            const result = this.handlingMessage(message)
            this.emit(result["type"], result["result"])

            /*==== Logging Message ====*/
            if(this.Logging) {
                console.log("=== ACC Node Wrapper ===")
                console.log("=== UDP Message Start ===")
                console.log("Info: Receiving a Message.")
                console.log(`From: ${udp_info.address}, ${udp_info.port}`)
                console.log(`Message: ${JSON.stringify(result)}`)
                console.log("=== UDP Message End ===")
                console.log("")
            }
        })

        /*==== Start Connection ====*/
        this.RequestConnection()
    }

    /**
     * @comment This is handling the errors.
     * @param err
     */
    handleError = (err) => {
        if (err) {
            console.log("=== ACC Node Wrapper ===")
            console.log("=== UDP Error Start ===")
            console.error(err)
            console.log("=== UDP Error End ===")
            console.log("")
        }
    }

    /**
     * @name handlingMessage
     * @comment This is the area where the incoming UDP messages are processed.
     * @param message
     * @returns {{result: {}, type: (*|number)}}
     */
    handlingMessage = (message) => {
        const reader = new binutils.BinaryReader(message, 'little')
        const messageType = reader.ReadUInt8()
        const result = {}

        switch (messageType) {
            case constants.InboundMessageTypes.REGISTRATION_RESULT: {
                this.ConnectionId = reader.ReadInt32()
                result.ConnectionId = this.ConnectionId
                result.ConnectionSuccess = reader.ReadBytes(1).readUInt8(0) > 0
                result.isReadonly = reader.ReadBytes(1).readUInt8(0) === 0
                result.err = readString(reader)

                this.RequestEntryList()
                this.RequestTrackData()
            } break;

            case constants.InboundMessageTypes.REALTIME_UPDATE: {
                result.EventIndex = reader.ReadUInt16()
                result.SessionIndex = reader.ReadUInt16()
                result.SessionType = new RaceSessionType()[reader.ReadBytes(1).readUInt8(0).toString()]
                result.Phase = new SessionPhase()[reader.ReadBytes(1).readUInt8(0).toString()]
                result.SessionTime = reader.ReadFloat()
                result.SessionEndTime = reader.ReadFloat()

                result.FocusedCarIndex = reader.ReadInt32()
                result.ActiveCameraSet = readString(reader)
                result.ActiveCamera = readString(reader)
                result.CurrentHudPage = readString(reader)

                result.IsReplayPlaying = reader.ReadBytes(1).readUInt8(0) > 0

                if (result.IsReplayPlaying) {
                    result.ReplaySessionTime = reader.ReadFloat()
                    result.ReplayRemainingTime = reader.ReadFloat()
                }

                result.TimeOfDay = reader.ReadFloat()
                result.AmbientTemp = reader.ReadBytes(1).readUInt8(0)
                result.TrackTemp = reader.ReadBytes(1).readUInt8(0)
                result.Clouds = reader.ReadBytes(1).readUInt8(0) / 10
                result.RainLevel = reader.ReadBytes(1).readUInt8(0) / 10
                result.Wetness = reader.ReadBytes(1).readUInt8(0) / 10

                result.BestSessionLap = readLap(reader)
            } break;

            case constants.InboundMessageTypes.REALTIME_CAR_UPDATE: {
                result.CarIndex = reader.ReadUInt16()
                result.DriverIndex = reader.ReadUInt16()
                result.DriverCount = reader.ReadBytes(1).readUInt8(0)
                result.Gear = reader.ReadBytes(1).readUInt8(0) - 1
                result.WorldPosX = reader.ReadFloat()
                result.WorldPosY = reader.ReadFloat()
                result.Yaw = reader.ReadFloat()
                result.CarLocation = new CarLocationEnum()[reader.ReadBytes(1).readUInt8(0).toString()]
                result.Kmh = reader.ReadUInt16()
                result.Position = reader.ReadUInt16()
                result.CupPosition = reader.ReadUInt16()
                result.TrackPosition = reader.ReadUInt16()
                result.SplinePosition = reader.ReadFloat()
                result.Laps = reader.ReadUInt16()

                result.Delta = reader.ReadUInt32()
                result.BestSessionLap = readLap(reader)
                result.LastLap = readLap(reader)
                result.CurrentLap = readLap(reader)

                const carEntry = FirstOrDefault(this._entryListCars, value => value.CarIndex === result.CarIndex)
                if (carEntry === null || this._entryListCars[carEntry].Drivers.length !== result.DriverCount)
                    if (moment().format("x") - this.lastEntrylistRequest > 1000) {
                        this.lastEntrylistRequest = moment().format("x")
                        this.RequestEntryList()
                    }
            } break;

            case constants.InboundMessageTypes.ENTRY_LIST: {
                this._entryListCars = []
                result.connectionId = reader.ReadInt32()
                const carEntryCount = reader.ReadUInt16()
                for (let i = 0; i < carEntryCount; i++)
                    this._entryListCars.push(new CarInfo(reader.ReadUInt16()))
            } break;

            case constants.InboundMessageTypes.TRACK_DATA: {
                result.connectionId = reader.ReadInt32()

                result.TrackName = readString(reader)
                result.TrackId = reader.ReadInt32()
                const TrackMeters = reader.ReadInt32()
                result.TrackMeters = TrackMeters > 0 ? TrackMeters : -1

                result.CameraSets = []
                const cameraSetCount = reader.ReadBytes(1).readUInt8(0)
                for (let i = 0; i < cameraSetCount; i++) {
                    const cameras = []
                    const camSetName = readString(reader)
                    const cameraCount = reader.ReadBytes(1).readUInt8(0)

                    for (let j = 0; j < cameraCount; j++)
                        cameras.push(readString(reader))

                    result.CameraSets.push({
                        name: camSetName,
                        cameras
                    })
                }

                result.HUDPages = []
                const hudPagesCount = reader.ReadBytes(1).readUInt8(0)
                for (let i = 0; i < hudPagesCount; i++)
                    result.HUDPages.push(readString(reader))
            } break;

            case constants.InboundMessageTypes.ENTRY_LIST_CAR: {
                const carId = reader.ReadUInt16();
                const carInfo = SingleOrDefault(this._entryListCars, value => value.CarIndex === carId)

                if (carInfo === null) {
                    result.err = `Entry list update for unknown carIndex ${carId}`
                    break;
                }

                this._entryListCars[carInfo].CarModelType = reader.ReadBytes(1).readUInt8(0);
                this._entryListCars[carInfo].TeamName = readString(reader);
                this._entryListCars[carInfo].RaceNumber = reader.ReadInt32();
                this._entryListCars[carInfo].CupCategory = new CupCategory()[reader.ReadBytes(1).readUInt8(0).toString()];
                this._entryListCars[carInfo].CurrentDriverIndex = reader.ReadBytes(1).readUInt8(0);
                this._entryListCars[carInfo].Nationality = new NationalityEnum()[reader.ReadUInt16().toString()];

                const driversOnCarCount = reader.ReadBytes(1).readUInt8(0)
                for (let i = 0; i < driversOnCarCount; i++) {
                    const DriverInfo = {
                        FirstName: readString(reader),
                        LastName: readString(reader),
                        ShortName: readString(reader),
                        Category: new DriverCategory()[reader.ReadBytes(1).readUInt8(0).toString()],
                        Nationality: new NationalityEnum()[reader.ReadUInt16().toString()]
                    }

                    this._entryListCars[carInfo].Drivers.push(DriverInfo)
                }
            } break;

            case constants.InboundMessageTypes.BROADCASTING_EVENT: {
                result.Type = new BroadcastingCarEventType()[reader.ReadBytes(1).readUInt8(0).toString()]
                result.Msg = readString(reader)
                result.TimeMs = reader.ReadInt32()
                result.CarId = reader.ReadInt32()
                result.CarData = this._entryListCars[FirstOrDefault(this._entryListCars, value => value.CarIndex === result.CarId)]
            } break;

            default: {
                result.err = "Type not recognized!"
            } break;
        }

        return {
            type: constants.InboundMessageTypesStr[messageType] !== undefined ? constants.InboundMessageTypesStr[messageType] : messageType,
            result
        }
    }

    /**
     * @name RequestConnection
     * @comment This function creates the connection.
     */
    RequestConnection = () => {
        const SERVER_DISPLAYNAME_ARR = utf8(this.SERVER_DISPLAYNAME)
        const SERVER_PASS_ARR = utf8(this.SERVER_PASS)
        const SERVER_COMMANDPASS_ARR = utf8(this.SERVER_COMMANDPASS)

        const writer = new binutils.BinaryWriter('little')
        writer.WriteBytes([constants.outboundMessageTypes.REGISTER_COMMAND_APPLICATION])
        writer.WriteBytes([constants.broadcastingNetworkProtocol.BROADCASTING_PROTOCOL_VERSION])
        writer.WriteUInt16(SERVER_DISPLAYNAME_ARR.length)
        writer.WriteBytes(SERVER_DISPLAYNAME_ARR)
        writer.WriteUInt16(SERVER_PASS_ARR.length)
        writer.WriteBytes(SERVER_PASS_ARR)
        writer.WriteUInt32(this.UPDATE_INTERVAL)
        writer.WriteUInt16(SERVER_COMMANDPASS_ARR.length)
        writer.WriteBytes(SERVER_COMMANDPASS_ARR)

        const connection = writer.ByteBuffer
        client.send(connection, 0, connection.length, this.SERVER_PORT, this.SERVER_IP, this.handleError)
    }

    /**
     * @name Disconnect
     * @comment This function disconnects the connection.
     */
    Disconnect = () => {
        const writer = new binutils.BinaryWriter('little')
        writer.WriteBytes([constants.outboundMessageTypes.UNREGISTER_COMMAND_APPLICATION])

        const disconnect = writer.ByteBuffer
        client.send(disconnect, 0, disconnect.length, this.SERVER_PORT, this.SERVER_IP, this.handleError)
    }

    /**
     * @name RequestEntryList
     * @comment This function request the entry list.
     */
    RequestEntryList = () => {
        const writer = new binutils.BinaryWriter('little')
        writer.WriteBytes([constants.outboundMessageTypes.REQUEST_ENTRY_LIST])
        writer.WriteUInt32(this.ConnectionId)

        const request = writer.ByteBuffer
        client.send(request, 0, request.length, this.SERVER_PORT, this.SERVER_IP, this.handleError)
    }

    /**
     * @name RequestTrackData
     * @comment This function request the track data.
     */
    RequestTrackData = () => {
        const writer = new binutils.BinaryWriter('little')
        writer.WriteBytes([constants.outboundMessageTypes.REQUEST_TRACK_DATA])
        writer.WriteUInt32(this.ConnectionId)

        const request = writer.ByteBuffer
        client.send(request, 0, request.length, this.SERVER_PORT, this.SERVER_IP, this.handleError)
    }

    /**
     * @name SetFocus
     * @comment This function sets the focus of the camera.
     */
    SetFocus = (carIndex, cameraSet, camera) => {
        this.SetFocusInternal(carIndex, cameraSet, camera)
    }

    /**
     * @name SetCamera
     * @comment This function sets the active camera.
     */
    SetCamera = (cameraSet, camera) => {
        this.SetFocusInternal(null, cameraSet, camera)
    }

    /**
     * @name SetFocusInternal
     * @comment This function is the main part for the SetFocus and SetCamera function.
     */
    SetFocusInternal = (carIndex, cameraSet, camera) => {
        const writer = new binutils.BinaryWriter('little')
        writer.WriteBytes([constants.outboundMessageTypes.CHANGE_FOCUS])
        writer.WriteUInt32(this.ConnectionId)

        if (carIndex !== null && carIndex !== undefined)
            writer.WriteBytes([0])
        else {
            writer.WriteBytes([1])
            writer.WriteUInt16(carIndex)
        }

        if (cameraSet === null || cameraSet === undefined || camera === null || camera === undefined)
            writer.WriteBytes([0])
        else {
            writer.WriteBytes([1])
            writer.WriteBytes(utf8(cameraSet))
            writer.WriteBytes(utf8(camera))
        }

        const request = writer.ByteBuffer
        client.send(request, 0, request.length, this.SERVER_PORT, this.SERVER_IP, this.handleError)
    }

    /**
     * @name RequestInstantReplay
     * @comment This function is requesting instant replay.
     */
    RequestInstantReplay = (startSessionTime, durationMS, initialFocusedCarIndex, initialCameraSet, initialCamera) => {
        const writer = new binutils.BinaryWriter('little')
        writer.WriteBytes([constants.outboundMessageTypes.INSTANT_REPLAY_REQUEST])
        writer.WriteUInt32(this.ConnectionId)

        writer.WriteFloat(startSessionTime)
        writer.WriteFloat(durationMS)
        writer.WriteUInt32(initialFocusedCarIndex || -1)

        writer.WriteBytes(utf8(initialCameraSet || ""))
        writer.WriteBytes(utf8(initialCamera || ""))

        const request = writer.ByteBuffer
        client.send(request, 0, request.length, this.SERVER_PORT, this.SERVER_IP, this.handleError)
    }

    /**
     * @name RequestHUDPage
     * @comment This function is requesting a HUD Page change.
     */
    RequestHUDPage = (hudPage) => {
        const writer = new binutils.BinaryWriter('little')
        writer.WriteBytes([constants.outboundMessageTypes.CHANGE_HUD_PAGE])
        writer.WriteUInt32(this.ConnectionId)

        writer.WriteBytes(utf8(hudPage))

        const request = writer.ByteBuffer
        client.send(request, 0, request.length, this.SERVER_PORT, this.SERVER_IP, this.handleError)
    }
}

module.exports = ACC_Node_Wrapper