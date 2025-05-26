"use strict";
// Data structure
var Subgroup;
(function (Subgroup) {
    Subgroup[Subgroup["Biological"] = 0] = "Biological";
    Subgroup[Subgroup["Climatological"] = 1] = "Climatological";
    Subgroup[Subgroup["Extra_terrestrial"] = 2] = "Extra_terrestrial";
    Subgroup[Subgroup["Geophysical"] = 3] = "Geophysical";
    Subgroup[Subgroup["Hydrological"] = 4] = "Hydrological";
    Subgroup[Subgroup["Meteorological"] = 5] = "Meteorological";
})(Subgroup || (Subgroup = {}));
let classif_to_subgroup = {
    "bio": Subgroup.Biological,
    "cli": Subgroup.Climatological,
    "ext": Subgroup.Extra_terrestrial,
    "geo": Subgroup.Geophysical,
    "hyd": Subgroup.Hydrological,
    "met": Subgroup.Meteorological,
};
var Type;
(function (Type) {
    Type[Type["Animal_incident"] = 0] = "Animal_incident";
    Type[Type["Epidemic"] = 1] = "Epidemic";
    Type[Type["Infestation"] = 2] = "Infestation";
    Type[Type["Drought"] = 3] = "Drought";
    Type[Type["Glacial_lake_outburst_flood"] = 4] = "Glacial_lake_outburst_flood";
    Type[Type["Wildfire"] = 5] = "Wildfire";
    Type[Type["Impact"] = 6] = "Impact";
    Type[Type["Space_weather"] = 7] = "Space_weather";
    Type[Type["Earthquake"] = 8] = "Earthquake";
    Type[Type["Mass_movement_dry"] = 9] = "Mass_movement_dry";
    Type[Type["Volcanic_activity"] = 10] = "Volcanic_activity";
    Type[Type["Flood"] = 11] = "Flood";
    Type[Type["Mass_movement_wet"] = 12] = "Mass_movement_wet";
    Type[Type["Wave_action"] = 13] = "Wave_action";
    Type[Type["Extreme_temperature"] = 14] = "Extreme_temperature";
})(Type || (Type = {}));
let classif_to_type = {
    "ani": Type.Animal_incident,
    "epi": Type.Epidemic,
    "inf": Type.Infestation,
    "dro": Type.Drought,
    "glo": Type.Glacial_lake_outburst_flood,
    "wil": Type.Wildfire,
    "imp": Type.Impact,
    "spa": Type.Space_weather,
    "ear": Type.Earthquake,
    "mmd": Type.Mass_movement_dry,
    "vol": Type.Volcanic_activity,
    "flo": Type.Flood,
    "mmw": Type.Mass_movement_wet,
    "wav": Type.Wave_action,
    "ext": Type.Extreme_temperature,
};
function parse_disaster(start, end, country, region, classif) {
    let split_classif = classif.split("-");
    let disaster = {
        start: start,
        end: end,
        duration: end.getTime() - start.getTime(), // This is in milliseconds
        country: country,
        region: region,
        subgroup: classif_to_subgroup[split_classif[1]],
        type: classif_to_type[split_classif[2]],
    };
    return disaster;
}
let disasters = [];
function parse_data(data) {
    const mills_to_days = 0.000000011574; // Converts milliseconds to days
    let lines = data.split("\n");
    for (let line = 0; line < lines.length; line++) {
        let headers = lines[line].split(",");
        let start_year = parseInt(headers[3]);
        let start_month = headers[4] == "" ? 0 : parseInt(headers[4]);
        let start_day = headers[5] == "" ? 1 : parseInt(headers[5]);
        let start = new Date(start_year, start_month, start_day);
        let end_year = parseInt(headers[6]);
        let end_month = headers[4] == "" ? start_month : parseInt(headers[4]);
        let end_day = headers[5] == "" ? start_day : parseInt(headers[5]);
        let end = new Date(end_year, end_month, end_day);
        let split_classif = headers[0].split("-");
        let disaster = {
            start: start,
            end: end,
            duration: (end.getTime() - start.getTime()) * mills_to_days + 1,
            country: headers[1],
            region: headers[2],
            subgroup: classif_to_subgroup[split_classif[1]],
            type: classif_to_type[split_classif[2]],
        };
        disasters.push(disaster);
    }
    console.log(disasters.length);
    console.log("finished parsing");
}
function file_change(event) {
    let file = event.target;
    if (file == null) {
        console.log("No file");
        return;
    }
    let files = file.files;
    let data = files[0];
    const reader = new FileReader();
    reader.onload = () => {
        parse_data(reader.result);
    };
    reader.onerror = () => {
        console.log("Error reading the file. Please try again.");
    };
    reader.readAsText(data);
}
function ready() {
    svg_init();
    let csv_file = document.getElementById("csv");
    csv_file.addEventListener("change", file_change);
}
let highlighted_countries;
function svg_init() {
    document.querySelectorAll(".all_paths").forEach((element) => {
        element.setAttribute("id", element.id.replace(/ /g, "_"));
        element.addEventListener("mouseover", function () {
            // window.onmousemove = function (event) {
            //     // Moves around a "name" element which hovers above the mose
            //     // x = j.clientX
            //     // y = j.clientY
            //     // document.getElementById("name").style.top = y-60  + 'px'
            //     // document.getElementById("name").style.left = x +10 + 'px'
            // }
            let new_highlighted_countries = document.querySelectorAll(`#${element.id}`);
            console.log(new_highlighted_countries);
            if (new_highlighted_countries != highlighted_countries) {
                if (highlighted_countries != undefined) {
                    highlighted_countries.forEach(country => {
                        country.style.fill = "#ececec";
                    });
                }
                new_highlighted_countries.forEach(country => {
                    country.style.fill = "pink";
                });
                highlighted_countries = new_highlighted_countries;
            }
        });
        element.addEventListener("click", function () {
        });
    });
}
