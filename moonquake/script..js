var speed = 0;
// couple of constants

var POS_X = 1800;
var POS_Y = 500;
var POS_Z = 1800;
var WIDTH = 1000;
var HEIGHT = 600;

var FOV = 38;
var NEAR = 1;
var FAR = 4000;

function getSearchParameters() {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray(prmstr) {
    var params = {};
    var prmarr = prmstr.split("&");
    for (var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

var params = getSearchParameters();

function pointer(x, y, size, color = '#cc3333', alpha = 0.5) {
    let can = document.createElement('canvas');
    can.id = "canvas" + x + y;
    can.width = 1024;
    can.height = 512;
    can.style.display = 'none';
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(can);

    var canvas = document.getElementById("canvas" + x + y);
    var ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, 1024, 512);
    var x2 = ((1024 / 360.0) * (180 + y));
    var y2 = ((512 / 180.0) * (90 - x));

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.arc(x2, y2, size, 0, 2 * Math.PI, false);
    ctx.fill();
    addOverlay('canvas' + x + y)
}

var texture;
function addOverlay(name) {
    var spGeo = new THREE.SphereGeometry(604, 50, 50);
    texture = new THREE.Texture($("#" + name)[0]);
    texture.needsUpdate = true;

    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveAlphaBlending

    });

    var meshOverlay = new THREE.Mesh(spGeo, material);
    meshOverlay.name = name;
    scene.add(meshOverlay);
}

function removePointer(name) {
    for (i = 0; i < scene.children.length; i++) {
        if (scene.children[i].name == name)
            scene.remove(scene.children[i]);
    }
}

// some global variables and initialization code
// simple basic renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
renderer.setClearColor(new THREE.Color(0x000000), 1);

// Replace 'url' with the URL of the resource you want to fetch
const url = 'data/getApolon.json';
let globalData;
fetch(url)
    .then(response => {
        // Check if the response status is OK (200)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        globalData = data;
        doSomethingWithData();
        tmp = '<ul>';
        for (let i = 0; i < data.length; i++) {
            tmp += '<li><a href = "#" id = "' + i + '">' + data[i].name + '</a></li>'
        }
        tmp += '</ul>';
        document.getElementById("nav-content").innerHTML = tmp;

        var buttons = document.querySelectorAll('a');

        for (let i = 0; i < buttons.length; i++) {
            try {
                document.getElementById("info").classList.remove('active');
            }
            catch { NaN; }
            buttons[i].addEventListener("click", function () {
                scene.remove(objects__());
                document.getElementById("info").style.display = "block";
                let a = addDensity(doSomethingWithData(), i);
                loadingButtonInformation(doSomethingWithData(), i);
                render();
                objects__();
                document.getElementById("nav").style.display = 'none';
                return a;
            });
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
    });

function doSomethingWithData() {
    return globalData
}

// add it to the target element
var mapDiv = document.getElementById("globe");
mapDiv.appendChild(renderer.domElement);

// setup a camera that points to the center
var camera = new THREE.PerspectiveCamera(FOV, WIDTH / HEIGHT, 1, FAR);
camera.position.set(POS_X, POS_Y, POS_Z);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// create a basic scene and add the camera
var scene = new THREE.Scene();
scene.add(camera);

var a;
$(document).ready(function () {
    jQuery.get('data/getApolon.json', function (data) {
        a = addDensity(doSomethingWithData(), -999);
        addLights();
        render();
        objects__();
        return a;
    });
});

function objects__() {
    return a;
}

function addLights() {
    light = new THREE.DirectionalLight(0xE4E4FD, 0.7, 500);
    scene.add(light);
    light.position.set(POS_X, POS_Y, POS_Z);
}

function addEarth() {
    var spGeo = new THREE.SphereGeometry(600, 50, 50);
    var planetTexture = THREE.ImageUtils.loadTexture("assets/main_moon.jpg");
    var mat2 = new THREE.MeshPhongMaterial({
        map: planetTexture,
        shininess: 0.2
    });
    sp = new THREE.Mesh(spGeo, mat2);
    scene.add(sp);

    return sp;
}

function render() {
    var timer = Date.now() * speed;
    camera.position.x = (Math.cos(timer) * 1800);
    camera.position.z = (Math.sin(timer) * 1800);
    camera.lookAt(scene.position);
    light.position = camera.position;
    light.lookAt(scene.position);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

function addDensity(data, id) {
    var geom = new THREE.Geometry();
    // the geometry that will contain all our cubes
    // material to use for each of our elements. Could use a set of materials to
    // add colors relative to the density. Not done here.

    // var last_element = new THREE.MeshLambertMaterial({ color: 0x000000, opacity: 0.6, emissive: 0x7deb34 }); !!!!!
    for (var i = 0; i < data.length; i++) {

        //get the data, and set the offset, we need to do this since the x,y coordinates
        //from the data aren't in the correct format
        var x = parseInt(data[i].y) + 180;
        var y = parseInt((data[i].x) - 84) * -1;
        var value = parseFloat(data[i].z);

        // calculate the position where we need to start the cube
        var position = latLongToVector3(y + 90, x, 600, 2);

        if (id == i) {
            var cubeMat = new THREE.MeshLambertMaterial({ color: 0x00D062, opacity: 1 });
        }
        else {
            var cubeMat = new THREE.MeshLambertMaterial({ color: 0xcc3333, opacity: 1 });
        }

        // create the cube
        var cube = new THREE.Mesh(new THREE.CubeGeometry(25, 25, 1 + value / 8, 1, 1, 1, cubeMat));

        // position the cube correctly
        cube.position = position;
        cube.lookAt(new THREE.Vector3(0, 0, 0));


        // merge with main model
        THREE.GeometryUtils.merge(geom, cube);
    }

    // create a new mesh, containing all the other meshes.loadingRelief
    var total = new THREE.Mesh(geom, new THREE.MeshFaceMaterial());

    // and add the total mesh to the scene
    scene.add(total);
    return total;
}

function latLongToVector3(lat, lon, radius, heigth) {
    var phi = (lat) * Math.PI / 180;
    var theta = (lon - 180) * Math.PI / 180;

    var x = -(radius + heigth) * Math.cos(phi) * Math.cos(theta);
    var y = (radius + heigth) * Math.sin(phi);
    var z = (radius + heigth) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

const zoomInput = document.getElementById("zoom-range");
var currentZoom = 1;
const speedInput = document.getElementById("speed-range");
var currentSpeed = 0.0001;

zoomInput.addEventListener("input", function (event) {
    var newZoom = parseFloat(event.target.value);
    updateZoom(newZoom);
});

function updateZoom(newZoom) {
    camera.position.set(POS_X * newZoom, POS_Y * newZoom, POS_Z * newZoom);
    currentZoom = newZoom;

    render();
}

speedInput.addEventListener("input", function (event) {
    var newSpeed = parseFloat(event.target.value);
    updateSpeed(newSpeed);
});

function updateSpeed(newSpeed) {
    speed = newSpeed;
    render();
}

document.getElementById("button-close").onclick = function () {
    document.getElementById("info").style.display = "none";
    window.location.href = 'index.html';
};

function loadingButtonInformation(data, id) {
    photos_apollo = ['apollo11.jpg', 'apollo12.jpg', 'apollo14.jpg', 'apollo15.jpg', 'apollo16.jpg'];
    text_apollo = ['Apollo 11 (July 16–24, 1969) was the American spaceflight that first landed humans on the Moon.',
        'Apollo 12 (November 14–24, 1969) was the sixth crewed flight in the United States Apollo program and the second to land on the Moon.',
        'Apollo 14 (January 31 – February 9, 1971) was the eighth crewed mission in the United States Apollo program, the third to land on the Moon, and the first to land in the lunar highlands.',
        "Apollo 15 (July 26 – August 7, 1971) was the ninth crewed mission in the United States' Apollo program and the fourth to land on the Moon.",
        "Apollo 16 (April 16–27, 1972) was the tenth crewed mission in the United States Apollo space program, administered by NASA, and the fifth and penultimate to land on the Moon."]
    document.getElementById("info-title").innerHTML = data[id].name;
    document.getElementById("info").querySelector("img").src = "assets/apollo_photo/" + photos_apollo[id];
    document.getElementById("info").querySelector("p").innerHTML = text_apollo[id];
    document.getElementById("info_cord").innerHTML = "Lngitude: " + data[id].x + " | Latitude: " + data[id].y;
}

var ReliefOn = false;
var COLOR_WIND = "0xffa500";
function loadingRelief() {
    if (!ReliefOn) {
        try {
            scene.remove(sp)
        }
        catch { NaN; }
        var spGeo = new THREE.SphereGeometry(600, 50, 50);
        var planetTexture = THREE.ImageUtils.loadTexture("assets/full.jpg");
        var mat2 = new THREE.MeshPhongMaterial({
            map: planetTexture,
            shininess: 0.2
        });
        sp = new THREE.Mesh(spGeo, mat2);
        COLOR_WIND = "0x#00012c"
        scene.add(sp);
    }
    else {
        try {
            scene.remove(sp)
        }
        catch { NaN; }
        var spGeo = new THREE.SphereGeometry(600, 50, 50);
        COLOR_WIND = "0xffa500";
        var planetTexture = THREE.ImageUtils.loadTexture("assets/main_moon.jpg");
        var mat2 = new THREE.MeshPhongMaterial({
            map: planetTexture,
            shininess: 0.2
        });
        sp = new THREE.Mesh(spGeo, mat2);
        scene.add(sp);
    }
    ReliefOn = !ReliefOn;
    return sp;
}

var WindOn = false;
function Wind() {
    temp_opacity = 0;
    params_opacity = document.getElementById("change-opacity-wind").value;
    if (temp_opacity != params_opacity) {
        try {
            scene.remove(meshClouds);
        }
        catch { NaN; }
    }
    if (!WindOn) {
        var spGeo = new THREE.SphereGeometry(600, 50, 50);
        var cloudsTexture = THREE.ImageUtils.loadTexture("assets/earth_clouds_1024.png");
        var materialClouds = new THREE.MeshPhongMaterial({ color: COLOR_WIND, map: cloudsTexture, transparent: true, opacity: params_opacity });

        meshClouds = new THREE.Mesh(spGeo, materialClouds);
        meshClouds.scale.set(1.015, 1.015, 1.015);
        scene.add(meshClouds);
        var animate = function () {
            requestAnimationFrame(animate);
            meshClouds.rotation.y += 0.006;
            meshClouds.rotation.x += 0.006;

            renderer.render(scene, camera);
        };
        animate();
    }
    else {
        scene.remove(meshClouds);
    }
    WindOn = !WindOn;
}

function MoonShake() {
    let url = '/data/getMoonshake.json'
    fetch(url)
        .then(response => {
            // Check if the response status is OK (200)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            months = ['January ', 'February', 'March', 'April', 'May ', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            tmp = '<option value="#" selected disabled>Choose Date</option>';
            for (let i = 0; i < data.length; i++) {
                tmp += '<option value="' + i + '">' + data[i].day + " " + months[data[i].month] + " " + data[i].year + '</option>"';
            }

            document.getElementById('year').innerHTML = tmp;
            globalDataPoints = data;;
            PointsActivity();
            return data;

        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function PointsActivity() {
    return globalDataPoints;
}

var activities = document.getElementById("year");

var dotes = [];

activities.addEventListener("change", function () {
    document.getElementById("graphics").querySelector("img").src = "#";
    for (let i = 0; i < dotes.length; i++) {
        removePointer(dotes[i]);
    }
    document.getElementById("shake-info").style.display = "block";
    months = ['January ', 'February', 'March', 'April', 'May ', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    globalDataPoints = PointsActivity();
    pointer(parseInt(globalDataPoints[activities.value].x), parseInt(globalDataPoints[activities.value].y), 10 ^ (0.5 * parseFloat(globalDataPoints[activities.value].magn) + 3), "#FFFF00", 0.3);
    dotes.push(String("canvas" + parseInt(globalDataPoints[activities.value].x) + parseInt(globalDataPoints[activities.value].y)))
    document.getElementById("moonquake_date").innerHTML = globalDataPoints[activities.value].day + " " + months[globalDataPoints[activities.value].month] + " " + globalDataPoints[activities.value].year;
    document.getElementById("moonquake_coord").innerHTML = "Longitude: " + globalDataPoints[activities.value].x + " | Latitude: " + globalDataPoints[activities.value].y;
    document.getElementById("moonquake_magn").innerHTML = globalDataPoints[activities.value].magn;
    document.getElementById("shake-info").querySelector("button").id = activities.value;
    document.getElementById("graphics").style.display = "block";
    loadingGraphicChoose(PointsActivity(), globalDataPoints[activities.value].year, globalDataPoints[activities.value].month, globalDataPoints[activities.value].day)
});

function closeShakeInfo(obj) {
    get_delete_obj = "canvas" + globalDataPoints[obj.id].x + globalDataPoints[obj.id].y;
    removePointer(get_delete_obj);
    document.getElementById("shake-info").style.display = "none";
    document.getElementById("graphics").style.display = "none";
}

MoonShake()

function __init__() {
    if (params.filter == 1) {
        addEarth();
    }
    else if (params.filter == 2) {
        loadingRelief();
    }
    else {
        addEarth();
    }
}

var full_name_screen;
function loadingGraphicChoose() {
    globalDataPoints[activities.value].month = parseInt(globalDataPoints[activities.value].month) + 1
    if (globalDataPoints[activities.value].day == 0) {
        globalDataPoints[activities.value].day = 1;
    }

    if (globalDataPoints[activities.value].month == 0) {
        globalDataPoints[activities.value].month = 1;
    }
    if (globalDataPoints[activities.value].month < 10) {
        globalDataPoints[activities.value].year += "0";
    }
    if (globalDataPoints[activities.value].day < 10) {
        globalDataPoints[activities.value].month += "0";
    }
    data = "data_" + globalDataPoints[activities.value].year + globalDataPoints[activities.value].month + globalDataPoints[activities.value].day;
    const header_photo = data + "_";
    full_name_screen = header_photo;
}

function loadingScreen(tag) {
    let source = "/assets/images/";
    console.log(source + full_name_screen + tag + ".jpeg");
    let image_block = document.getElementById("graphics").querySelector("img");
    fetch(source + full_name_screen + tag + ".jpeg")
        .then(response => {
            if (response.status === 200) {
                image_block.src = source + full_name_screen + tag + ".jpeg"
            } else if (response.status === 404) {
                image_block.src = source + full_name_screen + "missing" + ".jpeg"
            } else {
                alert('Сталася інша помилка: ' + response.status);
            }
        })
        .catch(error => {
            console.error('Помилка запиту:', error);
        });


}

__init__()