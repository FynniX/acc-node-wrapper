/*==== Import Section ==== */
const NodeIPC = require('@fynnix/node-easy-ipc');
const EventEmitter = require('events');
const constants = require('./constants')
const binutils = require('binutils')
const utf8 = require('utf8-bytes')
const moment = require('moment')
const client = require('dgram').createSocket('udp4')

const FirstOrDefault = require('./functions/FirstOrDefault')
const SingleOrDefault = require('./functions/SingleOrDefault')
const ReadString = require('./functions/ReadString')
const ReadLap = require('./functions/ReadLap')
const ReadChar = require('./functions/ReadChar')

const CarInfo = require('./structs/CarInfo')

const {
    DriverCategory,
    CupCategory,
    CarLocationEnum,
    SessionPhase,
    RaceSessionType,
    BroadcastingCarEventType,
    NationalityEnum,
    ACC_STATUS,
    ACC_SESSION_TYPE,
    ACC_FLAG_TYPE,
    ACC_PENALTY_TYPE,
    ACC_TRACK_GRIP_STATUS,
    ACC_RAIN_INTENSITY
} = require('./enums')

/**
 *  @class
 *  @name ACC_Node_Wrapper
 *  @comment ACC SDK implementation for Node.js.
 *  @extends EventEmitter
 */
class ACCNodeWrapper extends EventEmitter {
    SharedMemoryInterval1 = null
    SharedMemoryInterval2 = null
    SharedMemoryInterval3 = null
    m_physics_length = 712
    m_physics_buffer = Buffer.alloc(this.m_physics_length)
    m_physics = new NodeIPC.FileMapping();
    m_graphics_length = 1580
    m_graphics_buffer = Buffer.alloc(this.m_graphics_length)
    m_graphics = new NodeIPC.FileMapping();
    m_static_length = 820
    m_static_buffer = Buffer.alloc(this.m_static_length)
    m_static = new NodeIPC.FileMapping();

    SERVER_DISPLAYNAME = null
    SERVER_IP = null
    SERVER_PORT = null
    SERVER_PASS = null
    SERVER_COMMANDPASS = null
    UPDATE_INTERVAL = null

    Logging = false
    Logging2 = false
    ConnectionId = null
    lastEntrylistRequest = moment()
    _entryListCars = []

    constructor() {
        super();
    }

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
    initBroadcastSDK(SERVER_DISPLAYNAME, SERVER_IP, SERVER_PORT, SERVER_PASS, SERVER_COMMANDPASS, UPDATE_INTERVAL, Logging) {
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
                result.err = ReadString(reader)

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
                result.ActiveCameraSet = ReadString(reader)
                result.ActiveCamera = ReadString(reader)
                result.CurrentHudPage = ReadString(reader)

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

                result.BestSessionLap = ReadLap(reader)
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
                result.BestSessionLap = ReadLap(reader)
                result.LastLap = ReadLap(reader)
                result.CurrentLap = ReadLap(reader)

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

                result._entryListCars = this._entryListCars
            } break;

            case constants.InboundMessageTypes.TRACK_DATA: {
                result.connectionId = reader.ReadInt32()

                result.TrackName = ReadString(reader)
                result.TrackId = reader.ReadInt32()
                const TrackMeters = reader.ReadInt32()
                result.TrackMeters = TrackMeters > 0 ? TrackMeters : -1

                result.CameraSets = []
                const cameraSetCount = reader.ReadBytes(1).readUInt8(0)
                for (let i = 0; i < cameraSetCount; i++) {
                    const cameras = []
                    const camSetName = ReadString(reader)
                    const cameraCount = reader.ReadBytes(1).readUInt8(0)

                    for (let j = 0; j < cameraCount; j++)
                        cameras.push(ReadString(reader))

                    result.CameraSets.push({
                        name: camSetName,
                        cameras
                    })
                }

                result.HUDPages = []
                const hudPagesCount = reader.ReadBytes(1).readUInt8(0)
                for (let i = 0; i < hudPagesCount; i++)
                    result.HUDPages.push(ReadString(reader))
            } break;

            case constants.InboundMessageTypes.ENTRY_LIST_CAR: {
                const carId = reader.ReadUInt16();
                const carInfo = SingleOrDefault(this._entryListCars, value => value.CarIndex === carId)

                if (carInfo === null) {
                    result.err = `Entry list update for unknown carIndex ${carId}`
                    break;
                }

                this._entryListCars[carInfo].CarModelType = reader.ReadBytes(1).readUInt8(0);
                this._entryListCars[carInfo].TeamName = ReadString(reader);
                this._entryListCars[carInfo].RaceNumber = reader.ReadInt32();
                this._entryListCars[carInfo].CupCategory = new CupCategory()[reader.ReadBytes(1).readUInt8(0).toString()];
                this._entryListCars[carInfo].CurrentDriverIndex = reader.ReadBytes(1).readUInt8(0);
                this._entryListCars[carInfo].Nationality = new NationalityEnum()[reader.ReadUInt16().toString()];

                const driversOnCarCount = reader.ReadBytes(1).readUInt8(0)
                for (let i = 0; i < driversOnCarCount; i++) {
                    const DriverInfo = {
                        FirstName: ReadString(reader),
                        LastName: ReadString(reader),
                        ShortName: ReadString(reader),
                        Category: new DriverCategory()[reader.ReadBytes(1).readUInt8(0).toString()],
                        Nationality: new NationalityEnum()[reader.ReadUInt16().toString()]
                    }

                    this._entryListCars[carInfo].Drivers.push(DriverInfo)
                }

                result._entryListCars = this._entryListCars
            } break;

            case constants.InboundMessageTypes.BROADCASTING_EVENT: {
                result.Type = new BroadcastingCarEventType()[reader.ReadBytes(1).readUInt8(0).toString()]
                result.Msg = ReadString(reader)
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
        writer.WriteUInt32(this.ConnectionId)

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

        if (carIndex === null)
            writer.WriteBytes([0])
        else {
            writer.WriteBytes([1])
            writer.WriteUInt16(carIndex)
        }

        if (cameraSet === null || cameraSet === undefined || camera === null || camera === undefined)
            writer.WriteBytes([0])
        else {
            writer.WriteBytes([1])
            const cSet = utf8(cameraSet);
            writer.WriteUInt16(cSet.length);
            writer.WriteBytes(cSet);
            const c = utf8(camera);
            writer.WriteUInt16(c.length);
            writer.WriteBytes(c);
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
        writer.WriteInt32(initialFocusedCarIndex || -1)

        const cameraSet = utf8(initialCameraSet || "");
        writer.WriteUInt16(cameraSet.length);
        writer.WriteBytes(cameraSet);
        const camera = utf8(initialCamera || "");
        writer.WriteUInt16(camera.length);
        writer.WriteBytes(camera);

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

        const page = utf8(hudPage);
        writer.WriteUInt16(page.length);
        writer.WriteBytes(hudPage);

        const request = writer.ByteBuffer
        client.send(request, 0, request.length, this.SERVER_PORT, this.SERVER_IP, this.handleError)
    }

    /**
     * @name initSharedMemory
     * @comment This is the init function for the ACC Node Wrapper. This inits the Shared Memory.
     * @param M_PHYSICS_UPDATE_INTERVAL
     * @param M_GRAPHICS_UPDATE_INTERVAL
     * @param M_STATIC_UPDATE_INTERVAL
     * @param Logging
     */
    initSharedMemory(M_PHYSICS_UPDATE_INTERVAL, M_GRAPHICS_UPDATE_INTERVAL, M_STATIC_UPDATE_INTERVAL, Logging) {
        this.Logging2 = Logging

        /*==== Start Interval M_PHYSICS ====*/
        this.SharedMemoryInterval1 = setInterval(() => {
            const m_physics_result = this.ReadPhysics()
            this.emit("M_PHYSICS_RESULT", m_physics_result)

            /*==== Logging Message ====*/
            if(this.Logging2) {
                console.log("=== ACC Node Wrapper ===")
                console.log("=== Shared Memory Start ===")
                console.log("Info: Receiving a Message.")
                console.log(`Message: ${JSON.stringify(m_physics_result)}`)
                console.log("=== Shared Memory End ===")
                console.log("")
            }
        }, M_PHYSICS_UPDATE_INTERVAL)

        /*==== Start Interval M_GRAPHICS ====*/
        this.SharedMemoryInterval2 = setInterval(() => {
            const m_graphics_result = this.ReadGraphics()
            this.emit("M_GRAPHICS_RESULT", m_graphics_result)

            /*==== Logging Message ====*/
            if(this.Logging2) {
                console.log("=== ACC Node Wrapper ===")
                console.log("=== Shared Memory Start ===")
                console.log("Info: Receiving a Message.")
                console.log(`Message: ${JSON.stringify(m_graphics_result)}`)
                console.log("=== Shared Memory End ===")
                console.log("")
            }
        }, M_GRAPHICS_UPDATE_INTERVAL)

        /*==== Start Interval M_STATIC ====*/
        this.SharedMemoryInterval3 = setInterval(() => {
            const m_static_result = this.ReadStatic()
            this.emit("M_STATIC_RESULT", m_static_result)

            /*==== Logging Message ====*/
            if(this.Logging2) {
                console.log("=== ACC Node Wrapper ===")
                console.log("=== Shared Memory Start ===")
                console.log("Info: Receiving a Message.")
                console.log(`Message: ${JSON.stringify(m_static_result)}`)
                console.log("=== Shared Memory End ===")
                console.log("")
            }
        }, M_STATIC_UPDATE_INTERVAL)
    }

    /**
     * @name disconnectSharedMemory
     * @comment This function disconnects the Wrapper from the Shared Memory.
     */
    disconnectSharedMemory() {
        this.m_physics.closeMapping()
        this.m_graphics.closeMapping()
        this.m_static.closeMapping()
        clearInterval(this.SharedMemoryInterval1)
        clearInterval(this.SharedMemoryInterval2)
        clearInterval(this.SharedMemoryInterval3)
    }

    /**
     * @name ReadPhysics
     * @comment This function reads the Physics Shared Memory.
     */
    ReadPhysics() {
        const FilePhysics_Path = "Local\\acpmf_physics"
        this.m_physics.createMapping(null, FilePhysics_Path, this.m_physics_length);
        this.m_physics.readInto(0, this.m_physics_length, this.m_physics_buffer)

        const result = {}
        const reader = new binutils.BinaryReader(this.m_physics_buffer, 'little')

        result.packetId = reader.ReadUInt32()
        result.gas = reader.ReadFloat()
        result.brake = reader.ReadFloat()
        result.fuel = reader.ReadFloat()
        result.gear = reader.ReadUInt32() - 1
        result.rpms = reader.ReadUInt32()
        result.steerAngle = reader.ReadFloat()
        result.speedKmh = reader.ReadFloat()

        result.velocity = []
        for(let i = 0; i < 3; i++)
            result.velocity.push(reader.ReadFloat())

        result.accG = []
        for(let i = 0; i < 3; i++)
            result.accG.push(reader.ReadFloat())

        result.wheelSlip = []
        for(let i = 0; i < 4; i++)
            result.wheelSlip.push(reader.ReadFloat())

        const wheelLoad = []
        for(let i = 0; i < 4; i++)
            wheelLoad.push(reader.ReadFloat())

        result.wheelPressure = []
        for(let i = 0; i < 4; i++)
            result.wheelPressure.push(reader.ReadFloat())

        result.wheelAngularSpeed = []
        for(let i = 0; i < 4; i++)
            result.wheelAngularSpeed.push(reader.ReadFloat())

        const tyreWear = []
        for(let i = 0; i < 4; i++)
            tyreWear.push(reader.ReadFloat())

        const tyreDirtyLevel = []
        for(let i = 0; i < 4; i++)
            tyreDirtyLevel.push(reader.ReadFloat())

        result.TyreCoreTemp = []
        for(let i = 0; i < 4; i++)
            result.TyreCoreTemp.push(reader.ReadFloat())

        const camberRAD = []
        for(let i = 0; i < 4; i++)
            camberRAD.push(reader.ReadFloat())

        result.suspensionTravel = []
        for(let i = 0; i < 4; i++)
            result.suspensionTravel.push(reader.ReadFloat())

        const drs = reader.ReadFloat()
        result.tc = reader.ReadFloat()
        result.heading = reader.ReadFloat()
        result.pitch = reader.ReadFloat()
        result.roll = reader.ReadFloat()
        const cgHeight = reader.ReadFloat()

        result.carDamage = []
        for(let i = 0; i < 5; i++)
            result.carDamage.push(reader.ReadFloat())

        const numberOfTyresOut = reader.ReadUInt32()
        result.pitLimiterOn = reader.ReadUInt32() > 0
        result.abs = reader.ReadFloat()
        const kersChange = reader.ReadFloat()
        const kersInput = reader.ReadFloat()
        result.autoshifterOn = reader.ReadUInt32() > 0

        const rideHeight = []
        for(let i = 0; i < 2; i++)
            rideHeight.push(reader.ReadFloat())

        result.turboBoost = reader.ReadFloat()
        const ballast = reader.ReadFloat()
        const airDensity = reader.ReadFloat()
        result.airTemp = reader.ReadFloat()
        result.roadTemp = reader.ReadFloat()

        result.localAngularVel = []
        for(let i = 0; i < 3; i++)
            result.localAngularVel.push(reader.ReadFloat())

        result.finalFF = reader.ReadFloat()
        const performanceMeter = reader.ReadFloat()
        const engineBrake = reader.ReadUInt32()
        const ersRecoveryLevel = reader.ReadUInt32()
        const ersPowerLevel = reader.ReadUInt32()
        const ersHeatCharging = reader.ReadUInt32()
        const ersIsCharging = reader.ReadUInt32() > 0
        result.kersCurrentKJ = reader.ReadFloat()
        const drsAvailable = reader.ReadUInt32() > 0
        const drsEnabled = reader.ReadUInt32() > 0

        result.brakeTemp = []
        for(let i = 0; i < 4; i++)
            result.brakeTemp.push(reader.ReadFloat())

        result.clutch = reader.ReadFloat()

        const tyreTempI = []
        for(let i = 0; i < 4; i++)
            tyreTempI.push(reader.ReadFloat())

        const tyreTempM = []
        for(let i = 0; i < 4; i++)
            tyreTempM.push(reader.ReadFloat())

        const tyreTempO = []
        for(let i = 0; i < 4; i++)
            tyreTempO.push(reader.ReadFloat())

        result.isAIControlled = reader.ReadUInt32() > 0

        result.tyreContactPoint = []
        for(let i = 0; i < 4; i++) {
            const arr = []
            for(let j = 0; j < 3; j++)
                arr.push(reader.ReadFloat())

            result.tyreContactPoint.push(arr)
        }

        result.tyreContactNormal = []
        for(let i = 0; i < 4; i++) {
            const arr = []
            for(let j = 0; j < 3; j++)
                arr.push(reader.ReadFloat())

            result.tyreContactNormal.push(arr)
        }

        result.tyreContactHeading = []
        for(let i = 0; i < 4; i++) {
            const arr = []
            for(let j = 0; j < 3; j++)
                arr.push(reader.ReadFloat())

            result.tyreContactHeading.push(arr)
        }

        result.brakeBias = reader.ReadFloat()

        result.localVelocity = []
        for(let i = 0; i < 3; i++)
            result.localVelocity.push(reader.ReadFloat())

        const P2PActivation = reader.ReadUInt32()
        const P2PStatus = reader.ReadUInt32()
        const currentMaxRpm = reader.ReadFloat()

        const mz = []
        for(let i = 0; i < 4; i++)
            mz.push(reader.ReadFloat())

        const fx = []
        for(let i = 0; i < 4; i++)
            fx.push(reader.ReadFloat())

        const fy = []
        for(let i = 0; i < 4; i++)
            fy.push(reader.ReadFloat())

        result.slipRatio = []
        for(let i = 0; i < 4; i++)
            result.slipRatio.push(reader.ReadFloat())

        result.slipAngle = []
        for(let i = 0; i < 4; i++)
            result.slipAngle.push(reader.ReadFloat())

        const tcinAction = reader.ReadUInt32()
        const absInAction = reader.ReadUInt32()

        const suspensionDamage = []
        for(let i = 0; i < 4; i++)
            suspensionDamage.push(reader.ReadFloat())

        const tyreTemp = []
        for(let i = 0; i < 4; i++)
            tyreTemp.push(reader.ReadFloat())

        result.waterTemp = reader.ReadFloat()

        result.brakePressure = []
        for(let i = 0; i < 4; i++)
            result.brakePressure.push(reader.ReadFloat())

        result.frontBrakeCompound = reader.ReadUInt32()
        result.rearBrakeCompound = reader.ReadUInt32()

        result.padLife = []
        for(let i = 0; i < 4; i++)
            result.padLife.push(reader.ReadFloat())

        result.discLife = []
        for(let i = 0; i < 4; i++)
            result.discLife.push(reader.ReadFloat())

        result.ignitionOn = reader.ReadUInt32() > 0
        result.starterEngineOn = reader.ReadUInt32() > 0
        result.isEngineRunning = reader.ReadUInt32() > 0

        result.kerbVibration = reader.ReadFloat()
        result.slipVibrations = reader.ReadFloat()
        result.gVibrations = reader.ReadFloat()
        result.absVibrations = reader.ReadFloat()

        return result
    }

    /**
     * @name ReadGraphics
     * @comment This function reads the Graphics Shared Memory.
     */
    ReadGraphics() {
        const FileGraphics_Path = "Local\\acpmf_graphics"
        this.m_graphics.createMapping(null, FileGraphics_Path, this.m_graphics_length);
        this.m_graphics.readInto(0, this.m_graphics_length, this.m_graphics_buffer)

        const result = {}
        const reader = new binutils.BinaryReader(this.m_graphics_buffer, 'little')

        result.packetId = reader.ReadUInt32()
        result.status = new ACC_STATUS()[reader.ReadUInt32().toString()]
        result.session = new ACC_SESSION_TYPE()[reader.ReadInt32().toString()]

        result.currentTime = []
        for(let i = 0; i < 15; i++)
            result.currentTime.push(ReadChar(reader))

        result.lastTime = []
        for(let i = 0; i < 15; i++)
            result.lastTime.push(ReadChar(reader))

        result.bestTime = []
        for(let i = 0; i < 15; i++)
            result.bestTime.push(ReadChar(reader))

        result.split = []
        for(let i = 0; i < 15; i++)
            result.split.push(ReadChar(reader))

        result.completedLaps = reader.ReadUInt32()
        result.position = reader.ReadUInt32()
        result.iCurrentTime = reader.ReadUInt32()
        result.iLastTime = reader.ReadUInt32()
        result.iBestTime = reader.ReadUInt32()
        result.sessionTimeLeft = reader.ReadFloat()
        result.distanceTraveled = reader.ReadFloat()
        result.isInPit = reader.ReadUInt32() > 0
        result.currentSectorIndex = reader.ReadUInt32()
        result.lastSectorTime = reader.ReadUInt32()
        result.numberOfLaps = reader.ReadUInt32()

        result.tyreCompound = []
        for(let i = 0; i < 34; i++)
            result.tyreCompound.push(ReadChar(reader))

        const replayTimeMultiplier = reader.ReadFloat()
        result.normalizedCarPosition = reader.ReadFloat()
        result.activeCars = reader.ReadUInt32()

        result.carCoordinates = []
        for(let i = 0; i < 60; i++) {
            const arr = []
            for(let j = 0; j < 3; j++)
                arr.push(reader.ReadFloat())

            result.carCoordinates.push(arr)
        }

        result.carID = []
        for(let j = 0; j < 60; j++)
            result.carID.push(reader.ReadUInt32())

        result.playerCarID = reader.ReadUInt32()
        result.penaltyTime = reader.ReadFloat()
        result.flag = new ACC_FLAG_TYPE()[reader.ReadUInt32().toString()]
        result.penalty = new ACC_PENALTY_TYPE()[reader.ReadUInt32().toString()]
        result.idealLineOn = reader.ReadUInt32() > 0
        result.isInPitLane = reader.ReadUInt32() > 0
        result.surfaceGrip = reader.ReadFloat()
        result.mandatoryPitDone = reader.ReadUInt32() > 0
        result.windSpeed = reader.ReadFloat()
        result.windDirection = reader.ReadFloat()
        result.isSetupMenuVisible = reader.ReadUInt32() > 0
        result.mainDisplayIndex = reader.ReadUInt32()
        result.secondaryDisplyIndex = reader.ReadUInt32()
        result.TC = reader.ReadUInt32()
        result.TCCUT = reader.ReadUInt32()
        result.EngineMap = reader.ReadUInt32()
        result.ABS = reader.ReadUInt32()
        result.fuelXLap = reader.ReadFloat()
        result.rainLights = reader.ReadUInt32() > 0
        result.flashingLights = reader.ReadUInt32() > 0
        result.lightsStage = reader.ReadUInt32()
        result.exhaustTemperature = reader.ReadFloat()
        result.wiperLV = reader.ReadUInt32()
        result.driverStintTotalTimeLeft = reader.ReadInt32()
        result.driverStintTimeLeft = reader.ReadInt32()
        result.rainTyres = reader.ReadUInt32() > 0
        result.sessionIndex = reader.ReadUInt32()
        result.usedFuel = reader.ReadFloat()

        result.deltaLapTime = []
        for(let i = 0; i < 16; i++)
            result.deltaLapTime.push(ReadChar(reader))

        result.iDeltaLapTime = reader.ReadUInt32()

        result.estimatedLapTime = []
        for(let i = 0; i < 16; i++)
            result.estimatedLapTime.push(ReadChar(reader))

        result.iEstimatedLapTime = reader.ReadUInt32()

        result.isDeltaPositive = reader.ReadUInt32() > 0
        result.iSplit = reader.ReadUInt32()
        result.isValidLap = reader.ReadUInt32() > 0

        result.fuelEstimatedLaps = reader.ReadFloat()

        result.trackStatus = []
        for(let i = 0; i < 34; i++)
            result.trackStatus.push(ReadChar(reader))

        result.missingMandatoryPits = reader.ReadUInt32()
        result.Clock = reader.ReadFloat()
        result.directionLightsLeft = reader.ReadUInt32() > 0
        result.directionLightsRight = reader.ReadUInt32() > 0
        result.GlobalYellow = reader.ReadUInt32() > 0
        result.GlobalYellow1 = reader.ReadUInt32() > 0
        result.GlobalYellow2 = reader.ReadUInt32() > 0
        result.GlobalYellow3 = reader.ReadUInt32() > 0
        result.GlobalWhite = reader.ReadUInt32() > 0
        result.GlobalGreen = reader.ReadUInt32() > 0
        result.GlobalChequered = reader.ReadUInt32() > 0
        result.GlobalRed = reader.ReadUInt32() > 0
        result.mfdTyreSet = reader.ReadUInt32()
        result.mfdFuelToAdd = reader.ReadFloat()
        result.mfdTyrePressureLF = reader.ReadFloat()
        result.mfdTyrePressureRF = reader.ReadFloat()
        result.mfdTyrePressureLR = reader.ReadFloat()
        result.mfdTyrePressureRR = reader.ReadFloat()
        result.trackGripStatus = new ACC_TRACK_GRIP_STATUS()[reader.ReadUInt32().toString()]
        result.rainIntensity = new ACC_RAIN_INTENSITY()[reader.ReadUInt32().toString()]
        result.rainIntensityIn10min = new ACC_RAIN_INTENSITY()[reader.ReadUInt32().toString()]
        result.rainIntensityIn30min = new ACC_RAIN_INTENSITY()[reader.ReadUInt32().toString()]
        result.currentTyreSet = reader.ReadUInt32()
        result.strategyTyreSet = reader.ReadUInt32()

        return result
    }

    /**
     * @name ReadStatic
     * @comment This function reads the Static Shared Memory.
     */
    ReadStatic() {
        const FileStatic_Path = "Local\\acpmf_static"
        this.m_static.createMapping(null, FileStatic_Path, this.m_static_length);
        this.m_static.readInto(0, this.m_static_length, this.m_static_buffer)

        const result = {}
        const reader = new binutils.BinaryReader(this.m_static_buffer, 'little')

        result.smVersion = []
        for(let i = 0; i < 15; i++)
            result.smVersion.push(ReadChar(reader))

        result.acVersion = []
        for(let i = 0; i < 15; i++)
            result.acVersion.push(ReadChar(reader))

        result.numberOfSessions = reader.ReadUInt32()
        result.numCars = reader.ReadUInt32()

        result.carModel = []
        for(let i = 0; i < 33; i++)
            result.carModel.push(ReadChar(reader))

        result.track = []
        for(let i = 0; i < 33; i++)
            result.track.push(ReadChar(reader))

        result.playerName = []
        for(let i = 0; i < 33; i++)
            result.playerName.push(ReadChar(reader))

        result.playerSurname = []
        for(let i = 0; i < 33; i++)
            result.playerSurname.push(ReadChar(reader))

        result.playerNick = []
        for(let i = 0; i < 34; i++)
            result.playerNick.push(ReadChar(reader))

        result.sectorCount = reader.ReadUInt32()
        const maxTorque = reader.ReadFloat()
        const maxPower = reader.ReadFloat()
        result.maxRpm = reader.ReadUInt32()
        result.maxFuel = reader.ReadFloat()

        const suspensionMaxTravel = []
        for(let i = 0; i < 4; i++)
            suspensionMaxTravel.push(reader.ReadFloat())

        const tyreRadius = []
        for(let i = 0; i < 4; i++)
            tyreRadius.push(reader.ReadFloat())

        const maxTurboBoost = reader.ReadFloat()
        const deprecated_1 = reader.ReadFloat()
        const deprecated_2 = reader.ReadFloat()
        result.penaltiesEnabled = reader.ReadUInt32() > 0
        result.aidFuelRate = reader.ReadFloat()
        result.aidTireRate = reader.ReadFloat()
        result.aidMechanicalDamage = reader.ReadFloat()
        result.AllowTyreBlankets = reader.ReadFloat() > 0
        result.aidStability = reader.ReadFloat() > 0
        result.aidAutoclutch = reader.ReadUInt32() > 0
        result.aidAutoBlip = reader.ReadUInt32() > 0
        const hasDRS = reader.ReadUInt32() > 0
        const hasERS = reader.ReadUInt32() > 0
        const hasKERS = reader.ReadUInt32() > 0
        const kersMaxJ = reader.ReadFloat()
        const engineBrakeSettingsCount = reader.ReadUInt32()
        const ersPowerControllerCount = reader.ReadUInt32()
        const trackSplineLength = reader.ReadFloat()

        const trackConfiguration = []
        for(let i = 0; i < 34; i++)
            trackConfiguration.push(ReadChar(reader))

        const ersMaxJ = reader.ReadFloat()
        const isTimedRace = reader.ReadUInt32() > 0
        const hasExtraLap = reader.ReadUInt32() > 0

        const carSkin = []
        for(let i = 0; i < 34; i++)
            carSkin.push(ReadChar(reader))

        const reversedGridPositions = reader.ReadUInt32()
        result.PitWindowStart = reader.ReadUInt32()
        result.PitWindowEnd = reader.ReadInt32()
        result.isOnline = reader.ReadUInt32() > 0

        result.dryTyresName = []
        for(let i = 0; i < 33; i++)
            result.dryTyresName.push(ReadChar(reader))

        result.wetTyresName = []
        for(let i = 0; i < 33; i++)
            result.wetTyresName.push(ReadChar(reader))

        return result
    }
}

module.exports = ACCNodeWrapper