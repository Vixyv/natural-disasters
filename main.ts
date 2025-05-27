// Data structure and querying
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

function country_info(country: string) {

}

// SVG

let highlighted_country: NodeListOf<HTMLElement>;
let active_country: NodeListOf<HTMLElement>;

function svg_init() {
    document.querySelectorAll(".all_paths").forEach((element) => {
        element.setAttribute("id", element.id.replace(/ /g, "_"));
        element.addEventListener("mouseover", function() {
            let new_highlighted_country = <NodeListOf<HTMLElement>>document.querySelectorAll(`#${element.id}`);

            if (highlighted_country != undefined) {                
                highlighted_country.forEach(country => {
                    country.style.fill = "#ececec";
                })
            }

            console.log(highlighted_country);
            console.log(active_country);
            
            new_highlighted_country.forEach(country => {
                country.style.fill = "#ffbdc0";
            })

            highlighted_country = new_highlighted_country;

            // A bit of a work around but it works fine
            if (active_country != undefined) {
                active_country.forEach(country => {
                    country.style.fill = "#fa6b73";
                })
            }
        })

        element.addEventListener("click", function() {
            if (active_country != undefined) {
                active_country.forEach(country => {
                    country.style.fill = "#ececec";
                })
            }

            active_country = <NodeListOf<HTMLElement>>document.querySelectorAll(`#${element.id}`);
            active_country.forEach(country => {
                    country.style.fill = "#fa6b73";
            })

            country_info(element.id)
        })
    })
}

let svg: HTMLOrSVGImageElement;

function ready() {
    svg_init()

    let csv_file = <HTMLInputElement>document.getElementById("csv");
    csv_file.addEventListener("change", file_change)

    svg = <HTMLOrSVGImageElement>document.getElementById("svg");
      
    const zoom_in_btn = <HTMLButtonElement>document.getElementById("zoom_in");
    const zoom_out_btn = <HTMLButtonElement>document.getElementById("zoom_out");
      
    zoom_in_btn.addEventListener("click", () => {
        resize(1.1);
    });
      
    zoom_out_btn.addEventListener("click", () => {
        resize(0.9);
    });
      

}

// WORK IN PROGRESS
function resize(scale: number) {
    console.log(svg.height)
    svg.setAttribute("height", `${(<number>svg.height * scale)}`);
    svg.setAttribute("width", `${(<number>svg.width * scale)}`);  
}


