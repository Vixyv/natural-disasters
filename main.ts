// import {Chart} from "c:/Files/Programming/CS30/natural-disasters/node_modules/chart.js";

// export * from 'c:/Files/Programming/CS30/natural-disasters/node_modules/chart.js/dist/types.js';
// export default Chart;

// import { Chart } from "chart.js";

// Data structure
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

        let file_input_div = <HTMLElement>document.getElementById("file_input");
        file_input_div.style.display = "none";
    };
    reader.onerror = () => {
        console.log("Error reading the file. Please try again.");
    };
    reader.readAsText(data);
}

type Country = {
    name: string,
    disasters: NatDisaster[];
}

let current_country: Country = {
    name: "",
    disasters: [],
}

const country_info_div = <HTMLElement>document.getElementById("country_info");
const country_name_div = <HTMLElement>document.getElementById("country_name");

function country_info(country_name: string) {
    country_name = country_name.replace(/_/g, " ");
    let country_disasters: NatDisaster[] = [];

    for (let disaster=0; disaster<disasters.length; disaster++) {
        if (disasters[disaster].country == country_name) {
            country_disasters.push(disasters[disaster])
        }
    }

    current_country = {
        name: country_name,
        disasters: country_disasters,
    }

    country_info_div.style.display = "block";
    country_name_div.innerHTML = country_name;

    line_graph()
    subgroup_pie_chart()
}

const line_graph_can = <HTMLCanvasElement>document.getElementById("line_graph");

function line_graph() {
    let year_range = get_year_range();

    let labels = [];
    for (let year=year_range.min; year<=year_range.max; year++) {
        labels.push(year);
    }

    console.log(year_range)

    let bio_disasters = count_disasters_subgroup(Subgroup.Biological, year_range, current_country.disasters);
    let cli_disasters = count_disasters_subgroup(Subgroup.Climatological, year_range, current_country.disasters);
    let ext_disasters = count_disasters_subgroup(Subgroup.Extra_terrestrial, year_range, current_country.disasters);
    let geo_disasters = count_disasters_subgroup(Subgroup.Geophysical, year_range, current_country.disasters);
    let hyd_disasters = count_disasters_subgroup(Subgroup.Hydrological, year_range, current_country.disasters);
    let met_disasters = count_disasters_subgroup(Subgroup.Meteorological, year_range, current_country.disasters);

    console.log("thing before (charts)")
    console.log(bio_disasters);

    // @ts-ignore
    const line_chart = new Chart("line_chart", {
        type: "line",
        data: {labels: labels, datasets: [
            {data: bio_disasters, borderColor: "yellow", fill:false},
            {data: cli_disasters, borderColor: "grey", fill:false},
            {data: ext_disasters, borderColor: "purple", fill:false},
            {data: geo_disasters, borderColor: "brown", fill:false},
            {data: hyd_disasters, borderColor: "blue", fill:false},
            {data: met_disasters, borderColor: "red", fill:false}
        ]},
        // options: {
        //     legend: {display: true},
        //     scales: {yAxes: [{ticks: {beginAtZero: true}}]},
        //     title: {display: true, text: "Exports by Country ($ million)"}
        // }
    });

    console.log("thing ran (charts)")
}

function subgroup_pie_chart() {

}

function type_pie_chart() {

}

function probability_of_disaster() {

}

// Tool Functions
const min_year_input = <HTMLInputElement>document.getElementById("min_year");
const max_year_input = <HTMLInputElement>document.getElementById("min_year");

type YearRange = {
    min: number;
    max: number;
}

function get_year_range() : YearRange {
    return {min: parseInt(min_year_input.value), max: parseInt(max_year_input.value)}
}

function within_year_range(year: number, year_range: YearRange) : boolean {
    if (year >= year_range.min && year <= year_range.max) {
        return true
    }
    return false
}

function count_disasters_subgroup(subgroup: Subgroup, year_range: YearRange, country_disasters: NatDisaster[]) : number[] { 
    let count = [];
    for (let year=year_range.min; year<=year_range.max; year++) { count.push(0); }
    
    for (let d=0; d<country_disasters.length; d++) {
        if (country_disasters[d].subgroup == subgroup && within_year_range(country_disasters[d].start.getFullYear(), year_range)) {
            count[(country_disasters[d].start.getFullYear()-year_range.min)]++;
        }
    }

    return count
}

function count_disasters_type(type: Type, year_range: YearRange, country_disasters: NatDisaster[]) : number[] {
    let count = [];
    for (let year=year_range.min; year<=year_range.max; year++) { count.push(0); }
    
    for (let d=0; d<country_disasters.length; d++) {
        if (country_disasters[d].type == type && within_year_range(country_disasters[d].start.getFullYear(), year_range)) {
            count[(country_disasters[d].start.getFullYear()-year_range.min)]++;
        }
    }

    return count
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


// Init functions
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

    // This stuff not working
    min_year_input.addEventListener("change", () => {
        if (parseInt(min_year_input.value) > parseInt(max_year_input.value)) {
            min_year_input.value = max_year_input.value;
            console.log("is greater")
        }

        console.log(parseInt(min_year_input.value) >  parseInt(max_year_input.value))
        console.log([parseInt(min_year_input.value), parseInt(max_year_input.value)])
    })

    max_year_input.addEventListener("change", () => {
        if (parseInt(max_year_input.value) < parseInt(min_year_input.value)) {
            max_year_input.value = min_year_input.value;
        }
    })

    max_year_input.addEventListener("onload", () => {
        max_year_input.value = "2025";
    })
}

// TODO
function resize(scale: number) {
    svg.setAttribute("height", `${(<number>svg.height * scale)}`);
    svg.setAttribute("width", `${(<number>svg.width * scale)}`);  
}

// Chart of disasters by subgroup over year range
// Chart of diasters by subgroup or by type during a year
// Probability of encountering any disaster or a disaster during a year or year range a day
