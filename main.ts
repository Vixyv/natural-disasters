// Data structure and querying
enum Subgroup {
    Biological = "Biological",
    Climatological = "Climatological",
    Extra_terrestrial = "Extra Terrestrial",
    Geophysical = "Geophysical",
    Hydrological = "Hydrological",
    Meteorological = "Meteorological",
}

type SubgroupCount = {
    subgroup: Subgroup,
    amount: number,
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
    Animal_incident = "Animal Incident",         // Biological
    Epidemic = "Epidemic",
    Infestation = "Infestation",
    Drought = "Drought",                         // Climatological
    Glacial_lake_outburst_flood = "Glacial Lake Outburst Flood",
    Wildfire = "Wildfire",
    Impact = "Impact",                           // Extra-terrestrial
    Space_weather = "Space_weather",          // Never occurred
    Earthquake = "Earthquake",                   // Geophysical
    Mass_movement_dry = "Mass Movement Dry",
    Volcanic_activity = "Volcanic Activity",
    Flood = "Flood",                             // Hydrological
    Mass_movement_wet = "Mass Movement Wet",
    Wave_action = "Wave Action",              // Never occurred
    Extreme_temperature = "Extreme Temperature", // Meteorological
}

type TypeCount = {
    type: Type,
    amount: number,
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

type Country = {
    name: string,

    subgroup_disasters: SubgroupCount[],
    type_disasters: TypeCount[],
}

function country_info(country_name: string) {
    country_name = country_name.replace(/_/g, " ");

    let info_box = <HTMLElement>document.getElementById("country_info");

    let subgroup_disasters: SubgroupCount[] = [];
    let type_disasters: TypeCount[] = [];

    for (let disaster = 0; disaster<disasters.length; disaster++) {
        if (disasters[disaster].country == country_name) {
            count_subgroup_disasters(disasters[disaster], subgroup_disasters)
            count_type_disasters(disasters[disaster], type_disasters)
        }
    }

    let country: Country = {
        name: country_name,

        subgroup_disasters: subgroup_disasters,
        type_disasters: type_disasters,
    };

    let info_text = country.name + "<br\>  ";

    for (let subgroup = 0; subgroup<subgroup_disasters.length; subgroup++) {
        info_text += subgroup_disasters[subgroup].subgroup.toString() + ": ";
        info_text += subgroup_disasters[subgroup].amount.toString() + "<br\>  ";
    }
    
    info_box.innerHTML = info_text;
}

// Counts the number of disasters by subgroup
function count_subgroup_disasters(disaster: NatDisaster, subgroup_disasters: SubgroupCount[]) {
    if (subgroup_disasters.length == 0) {
        let subgroup_count: SubgroupCount = {
            subgroup: disaster.subgroup,
            amount: 1,
        }
        
        subgroup_disasters.push(subgroup_count);
    }
    
    for (let subgroup = 0; subgroup<subgroup_disasters.length; subgroup++) {
        if (disaster.subgroup.toString() == subgroup_disasters[subgroup].subgroup.toString()) {
            subgroup_disasters[subgroup].amount++;
            break;
        }
        else if (subgroup == subgroup_disasters.length - 1) {
            console.log("     New group")
            let subgroup_count: SubgroupCount = {
                subgroup: disaster.subgroup,
                amount: 1,
            }
            
            subgroup_disasters.push(subgroup_count);
        }
    }
}

// Counts the number of disasters by type
function count_type_disasters(disaster: NatDisaster, type_disasters: TypeCount[]) {
    if (type_disasters.length == 0) {
        let type_count: TypeCount = {
            type: disaster.type,
            amount: 1,
        }
        
        type_disasters.push(type_count);
    }
    
    for (let type = 0; type<type_disasters.length; type++) {
        if (disaster.type == type_disasters[type].type) {
            type_disasters[type].amount++;
            break;
        }
        else if (type == type_disasters.length - 1) {
            let type_count: TypeCount = {
                type: disaster.type,
                amount: 1,
            }
            
            type_disasters.push(type_count);
        }
    }
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
    svg.setAttribute("height", `${(<number>svg.height * scale)}`);
    svg.setAttribute("width", `${(<number>svg.width * scale)}`);  
}


