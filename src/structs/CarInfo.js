/*==== CarInfo Class ====*/
class CarInfo {
    CarIndex = 0
    CarModelType = null
    TeamName = ""
    RaceNumber = 0
    CupCategory = null
    CurrentDriverIndex = 0
    Drivers = []
    Nationality = 0

    constructor(CarIndex) {
        this.CarIndex = CarIndex
    }

    getCurrentDriver() {
        if (this.CurrentDriverIndex < this.Drivers.length)
            return this.Drivers[this.CurrentDriverIndex]["LastName"]
        return "nobody(?)"
    }
}

module.exports = CarInfo