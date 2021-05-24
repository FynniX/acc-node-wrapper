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

module.exports = {
    DriverCategory,
    CupCategory,
    LapType,
    CarLocationEnum,
    SessionPhase,
    RaceSessionType,
    BroadcastingCarEventType,
    NationalityEnum
}