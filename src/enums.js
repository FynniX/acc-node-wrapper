class DriverCategory {
    "3" = "Platinum"
    "2" = "Gold"
    "1" = "Silver"
    "0" = "Bronze"
    "255" = "Error"
}

class CupCategory {
    "0" = "Overall/Pro"
    "1" = "ProAm"
    "2" = "Am"
    "3" = "Silver"
    "4" = "National"
}

class LapType {
    "0" = "Error"
    "1" = "Outlap"
    "2" = "Regular"
    "3" = "Inlap"
}

class CarLocationEnum {
    0 = "None"
    1 = "Track"
    2 = "Pitlane"
    3 = "PitEntry"
    4 = "PitExit"
}

class SessionPhase {
    "0" = "None"
    "1" = "Starting"
    "2" = "PreFormation"
    "3" = "FormationLap"
    "4" = "PreSession"
    "5" = "Session"
    "6" = "SessionOver"
    "7" = "PostSession"
    "8" = "ResultUI"
}

class RaceSessionType {
    "0" = "Practice"
    "4" = "Qualifying"
    "9" = "Superpole"
    "10" = "Race"
    "11" = "Hotlap"
    "12" = "Hotstint"
    "13" = "HotlapSuperpole"
    "14" = "Replay"
}

class BroadcastingCarEventType {
    "0" = "None"
    "1" = "GreenFlag"
    "2" = "SessionOver"
    "3" = "PenaltyCommMsg"
    "4" = "Accident"
    "5" = "LapCompleted"
    "6" = "BestSessionLap"
    "7" = "BestPersonalLap"
}

class NationalityEnum {
    "0" = "Any"
    "1" = "Italy"
    "2" = "Germany"
    "3" = "France"
    "4" = "Spain"
    "5" = "GreatBritain"
    "6" = "Hungary"
    "7" = "Belgium"
    "8" = "Switzerland"
    "9" = "Austria"
    "10" = "Russia"
    "11" = "Thailand"
    "12" = "Netherlands"
    "13" = "Poland"
    "14" = "Argentina"
    "15" = "Monaco"
    "16" = "Ireland"
    "17" = "Brazil"
    "18" = "SouthAfrica"
    "19" = "PuertoRico"
    "20" = "Slovakia"
    "21" = "Oman"
    "22" = "Greece"
    "23" = "SaudiArabia"
    "24" = "Norway"
    "25" = "Turkey"
    "26" = "SouthKorea"
    "27" = "Lebanon"
    "28" = "Armenia"
    "29" = "Mexico"
    "30" = "Sweden"
    "31" = "Finland"
    "32" = "Denmark"
    "33" = "Croatia"
    "34" = "Canada"
    "35" = "China"
    "36" = "Portugal"
    "37" = "Singapore"
    "38" = "Indonesia"
    "39" = "USA"
    "40" = "NewZealand"
    "41" = "Australia"
    "42" = "SanMarino"
    "43" = "UAE"
    "44" = "Luxembourg"
    "45" = "Kuwait"
    "46" = "HongKong"
    "47" = "Colombia"
    "48" = "Japan"
    "49" = "Andorra"
    "50" = "Azerbaijan"
    "51" = "Bulgaria"
    "52" = "Cuba"
    "53" = "CzechRepublic"
    "54" = "Estonia"
    "55" = "Georgia"
    "56" = "India"
    "57" = "Israel"
    "58" = "Jamaica"
    "59" = "Latvia"
    "60" = "Lithuania"
    "61" = "Macau"
    "62" = "Malaysia"
    "63" = "Nepal"
    "64" = "NewCaledonia"
    "65" = "Nigeria"
    "66" = "NorthernIreland"
    "67" = "PapuaNewGuinea"
    "68" = "Philippines"
    "69" = "Qatar"
    "70" = "Romania"
    "71" = "Scotland"
    "72" = "Serbia"
    "73" = "Slovenia"
    "74" = "Taiwan"
    "75" = "Ukraine"
    "76" = "Venezuela"
    "77" = "Wales"
    "78" = "Iran"
    "79" = "Bahrain"
    "80" = "Zimbabwe"
    "81" = "ChineseTaipei"
    "82" = "Chile"
    "83" = "Uruguay"
    "84" = "Madagascar"
}

class ACC_STATUS {
    "0" = "AC_OFF"
    "1" = "AC_REPLAY"
    "2" = "AC_LIVE"
    "3" = "AC_PAUSE"
}

class ACC_SESSION_TYPE {
    "-1" = "AC_UNKNOWN"
    "0" = "AC_PRACTICE"
    "1" = "AC_QUALIFY"
    "2" = "AC_RACE"
    "3" = "AC_HOTLAP"
    "4" = "AC_TIME_ATTACK"
    "5" = "AC_DRIFT"
    "6" = "AC_DRAG"
    "7" = "AC_HOTSTINT"
    "8" = "AC_HOTLAPSUPERPOLE"
}

class ACC_FLAG_TYPE {
    "0" = "AC_NO_FLAG"
    "1" = "AC_BLUE_FLAG"
    "2" = "AC_YELLOW_FLAG"
    "3" = "AC_BLACK_FLAG"
    "4" = "AC_WHITE_FLAG"
    "5" = "AC_CHECKERED_FLAG"
    "6" = "AC_PENALTY_FLAG"
    "7" = "ACC_GREEN_FLAG"
    "8" = "ACC_ORANGE_FLAG"
}

class ACC_PENALTY_TYPE {
    "0" = "None"
    "1" = "DriveThrough_Cutting"
    "2" = "StopAndGo_10_Cutting"
    "3" = "StopAndGo_20_Cutting"
    "4" = "StopAndGo_30_Cutting"
    "5" = "Disqualified_Cutting"
    "6" = "RemoveBestLaptime_Cutting"

    "7" = "DriveThrough_PitSpeeding"
    "8" = "StopAndGo_10_PitSpeeding"
    "9" = "StopAndGo_20_PitSpeeding"
    "10" = "StopAndGo_30_PitSpeeding"
    "11" = "Disqualified_PitSpeeding"
    "12" = "RemoveBestLaptime_PitSpeeding"

    "13" = "Disqualified_IgnoredMandatoryPit"

    "14" = "PostRaceTime"
    "15" = "Disqualified_Trolling"
    "16" = "Disqualified_PitEntry"
    "17" = "Disqualified_PitExit"
    "18" = "Disqualified_WrongWay"

    "19" = "DriveThrough_IgnoredDriverStint"
    "20" = "Disqualified_IgnoredDriverStint"

    "21" = "Disqualified_ExceededDriverStintLimit"
}

class ACC_TRACK_GRIP_STATUS {
    "0" = "ACC_GREEN"
    "1" = "ACC_FAST"
    "2" = "ACC_OPTIMUM"
    "3" = "ACC_GREASY"
    "4" = "ACC_DAMP"
    "5" = "ACC_WET"
    "6" = "ACC_FLOODED"
}

class ACC_RAIN_INTENSITY {
    "0" = "ACC_NO_RAIN"
    "1" = "ACC_DRIZZLE"
    "2" = "ACC_LIGHT_RAIN"
    "3" = "ACC_MEDIUM_RAIN"
    "4" = "ACC_HEAVY_RAIN"
    "5" = "ACC_THUNDERSTORM"
}

class ACC_WHEELS_TYPE {
    "0" = "ACC_FrontLeft"
    "1" = "ACC_FrontRight"
    "2" = "ACC_RearLeft"
    "3" = "ACC_RearRight"
}

module.exports = {
    DriverCategory,
    CupCategory,
    LapType,
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
    ACC_RAIN_INTENSITY,
    ACC_WHEELS_TYPE
}