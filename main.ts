// Data structure
enum Subgroup {
    Biological,
    Climatological,
    Extra_terrestrial,
    Geophysical,
    Hydrological,
    Meteorological,
}

let classif_to_subgroup: {[id: string]: Subgroup} = {
    "bio": Subgroup.Biological,
    "cli": Subgroup.Climatological,
    "ext": Subgroup.Extra_terrestrial,
    "geo": Subgroup.Geophysical,
    "hyd": Subgroup.Hydrological,
    "met": Subgroup.Meteorological,
}

enum Type {
    Animal_incident,             // Biological
    Epidemic,
    Infestation,
    Drought,                     // Climatological
    Glacial_lake_outburst_flood,
    Wildfire,
    Impact,                      // Extra-terrestrial
    Space_weather, // Never occurred
    Earthquake,                  // Geophysical
    Mass_movement_dry,
    Volcanic_activity,
    Flood,                       // Hydrological
    Mass_movement_wet,
    Wave_action, // Never occurred
    Extreme_temperature,         // Meteorological
}

let classif_to_type: {[id: string]: Type} = {
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
}

type NatDisaster = {
    start: Date;
    end: Date;
    duration: number; // Days

    country: string;
    region: string;

    subgroup: Subgroup;
    type: Type;
}

function parse_disaster(start: Date, end: Date, country: string, region: string, classif: string) : NatDisaster {
    let split_classif = classif.split("-");
    
    let disaster: NatDisaster = {
        start: start,
        end: end,
        duration: end.getTime() - start.getTime(), // This is in milliseconds

        country: country,
        region: region,

        subgroup: classif_to_subgroup[split_classif[1]],
        type: classif_to_type[split_classif[2]],
    }

    return disaster
}

let disasters: NatDisaster[] = [];

function parse_data(data: string) {
    const mills_to_days = 0.000000011574; // Converts milliseconds to days

    let lines = data.split("\n");

    for (let line=0; line<lines.length; line++) {
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

        let disaster: NatDisaster = {
            start: start,
            end: end,
            duration: (end.getTime() - start.getTime())*mills_to_days+1,

            country: headers[1],
            region: headers[2],

            subgroup: classif_to_subgroup[split_classif[1]],
            type: classif_to_type[split_classif[2]],
        }

        disasters.push(disaster);
    }

    console.log(disasters.length);
    console.log("finished parsing")
}

function file_change(event: Event) {
    let file = <HTMLInputElement>event.target;

    if (file == null) {
        console.log("No file")
        return
    }

    let files = <FileList>file.files;
    let data = files[0];

    const reader = new FileReader();
    reader.onload = () => {
        parse_data(<string>reader.result)
    };
    reader.onerror = () => {
        console.log("Error reading the file. Please try again.");
    };
    reader.readAsText(data);
}

function ready() {
    svg_init()

    let csv_file = <HTMLInputElement>document.getElementById("csv");
    csv_file.addEventListener("change", file_change)
}

let highlighted_countries: NodeListOf<HTMLElement>;

function svg_init() {
    document.querySelectorAll(".all_paths").forEach((element) => {
        element.setAttribute("id", element.id.replace(/ /g, "_"));
        element.addEventListener("mouseover", function() {
            // window.onmousemove = function (event) {
            //     // Moves around a "name" element which hovers above the mose
            //     // x = j.clientX
            //     // y = j.clientY
            //     // document.getElementById("name").style.top = y-60  + 'px'
            //     // document.getElementById("name").style.left = x +10 + 'px'
            // }

            let new_highlighted_countries = <NodeListOf<HTMLElement>>document.querySelectorAll(`#${element.id}`);
            console.log(new_highlighted_countries);
            if (new_highlighted_countries != highlighted_countries) {
                if (highlighted_countries != undefined) {
                    highlighted_countries.forEach(country => {
                        country.style.fill = "#ececec";
                    })
                }
                new_highlighted_countries.forEach(country => {
                    country.style.fill = "pink";
                })

                highlighted_countries = new_highlighted_countries;
            }
        })

        element.addEventListener("click", function() { // What to do on click
        })
    })
}
