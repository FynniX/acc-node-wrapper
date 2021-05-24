/*=== Read String from Binary ====*/
const ReadString = reader => {
    const length = reader.ReadUInt16()
    const bytes = reader.ReadBytes(length)
    return bytes.toString()
}

module.exports = ReadString