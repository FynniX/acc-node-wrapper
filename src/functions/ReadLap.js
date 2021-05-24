/*==== Parse Laps ====*/
const {LapType} = require('../enums')

const ReadLap = reader => {
    const lap = {
        LaptimeMS: reader.ReadInt32(),
        CarIndex: reader.ReadUInt16(),
        DriverIndex: reader.ReadUInt16(),
        Splits: [],
        Type: 0
    }

    const splitCount = reader.ReadBytes(1).readUInt8(0)
    for (let i = 0; i < splitCount; i++)
        lap.Splits.push(reader.ReadInt32())

    lap.isInvalid = reader.ReadBytes(1).readUInt8(0) > 0
    lap.isValidForBest = reader.ReadBytes(1).readUInt8(0) > 0

    const isOutlap = reader.ReadBytes(1).readUInt8(0) > 0
    const isInlap = reader.ReadBytes(1).readUInt8(0) > 0

    if (isOutlap)
        lap.Type = 1
    else if (isInlap)
        lap.Type = 3
    else
        lap.Type = 2

    lap.Type = new LapType()[lap.Type.toString()]

    while (lap.Splits.length < 3)
        lap.Splits.push(null)

    return lap
}

module.exports = ReadLap