// Generic Strings
const root_url = "https://electro-smith.github.io/Programmer"

// New changes involve reading from sources.json to find the 'sources' we should pull from
// Those sources replace the previously hard coded 'examples.json' file, and should otherwise
// function the same.

// The changes should primarily only affect gatherExampleData

// When imported the examples will have the original data located in the .json file
// as well as the 'source' field containing the data structure used to find the example

var data = {
    products: [],              // NEW: Product array from products.json
    selectedProduct: null,     // NEW: Currently selected product
    no_device: true,
    firmwareFile: null,
    blinkFirmwareFile: null,
    bootloaderFirmwareFile: null,
    displayImportedFile: false,
    displaySelectedFile: false,
    // Legacy fields (may be removed later)
    platforms: [],
    examples: [],
    sel_platform: null,
    sel_example: null
}

// Global Buffer for reading files
var ex_buffer

// Gets the root url
// should be https://localhost:9001/Programmer on local
// and https://electro-smith.github.io/Programmer on gh-pages
function getRootUrl() {
    var url = document.URL;
    return url;
}

// Reads the specified file containing JSON example meta-data
// function gatherExampleData()
// {
//     // Get Source list as data
//     var self = this // assign self to 'this' before nested function calls...
//     var src_url = getRootUrl().concat("data/sources.json")
//     var raw = new XMLHttpRequest();
//     raw.open("GET", src_url, true);
//     raw.responseType = "text"
//     raw.onreadystatechange = function ()
//     {
//         if (this.readyState === 4 && this.status === 200) {
//             var obj = this.response;
//             buffer = JSON.parse(obj);
//             buffer.forEach( function(ex_src) {
//                 // Launch another request with async function to load examples from the
//                 // specified urls
//                 // This will fill examples directly, and replace the importExamples/timeout situation.
//                 var ext_raw = new XMLHttpRequest();
//                 ext_raw.open("GET", ex_src.data_url, true);
//                 ext_raw.responseType = "text"
//                 ext_raw.onreadystatechange = function ()
//                 {
//                     if (this.readyState === 4 && this.status === 200) {
//                         // Now this.response will contain actual example data
//                         var ext_obj = this.response;
//                         ex_buffer = JSON.parse(ext_obj);
//                         // Now we could just fill the examples data
//                         // ex_buffer.forEach( function(ex_data) {
//                         //     console.log("%s - %s", ex_src.name, ex_data.name);
//                         // })
//                         const unique_platforms = [...new Set(ex_buffer.map(obj => obj.platform))]
//                         // This needs to be fixed to 'ADD' examples
//                         //self.examples = data
//                         self.examples.push(ex_buffer)
//                         var temp_platforms = self.platforms.push(unique_platforms)

//                         const new_platforms = [...new Set(temp_platforms.map(obj => obj))]
//                         self.platforms = new_platforms
//                     }
//                 }
//                 ext_raw.send(null)

//                     // var self = this
//                     // const unique_platforms = [...new Set(data.map(obj => obj.platform))]
//                     // self.examples = data
//                     // self.platforms = unique_platforms
//             })
//         }
//     }
//     raw.send(null)
// }


function displayReadMe(fname)
{
    var url = self.data.sel_example.url
    fname   = fname.substring(5,fname.length-4);

    div = document.getElementById("readme")

    marked.setOptions({
	renderer: new marked.Renderer(),
	highlight: function(code, language) {
	    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
	    return hljs.highlight(validLanguage, code).value;
	},
	pedantic: false,
	gfm: true,
	breaks: false,
	sanitize: false,
	smartLists: true,
	smartypants: false,
	xhtml: false
    });


    fetch(url)
	.then(response => response.text())
    	.then(text => div.innerHTML = marked.parse(text.replace("404: Not Found", "No additional details available for this example.")));
}

async function readServerFirmwareFile(path, dispReadme = true)
{
    return new Promise((resolve) => {
        var buffer
        var raw = new XMLHttpRequest();
        var fname = path;

        if(dispReadme){
            displayReadMe(fname)
        }

        raw.open("GET", fname, true);
        raw.responseType = "arraybuffer"
        raw.onreadystatechange = function ()
        {
            if (this.readyState === 4 && this.status === 200) {
                resolve(this.response)
            }
        }
        raw.send(null)
    })
}

var app = new Vue({
    el: '#app',
    template:
    `
    <b-container class="app_body">
    <div align="center">
        <button id="detach" disabled="true" hidden="true">Detach DFU</button>
        <button id="upload" disabled="true" hidden="true">Upload</button>
        <b-form id="configForm">
            <p> <label for="transferSize"  hidden="true">Transfer Size:</label>
            <input type="number" name="transferSize"  hidden="true" id="transferSize" value="1024"></input> </p>
            <p> <span id="status"></span> </p>

            <p><label hidden="true" for="vid">Vendor ID (hex):</label>
            <input hidden="true" list="vendor_ids" type="text" name="vid" id="vid" maxlength="6" size="8" pattern="0x[A-Fa-f0-9]{1,4}">
            <datalist id="vendor_ids"> </datalist> </p>

            <div id="dfuseFields" hidden="true">
                <label for="dfuseStartAddress" hidden="true">DfuSe Start Address:</label>
                <input type="text" name="dfuseStartAddress" id="dfuseStartAddress"  hidden="true" title="Initial memory address to read/write from (hex)" size="10" pattern="0x[A-Fa-f0-9]+">
                <label for="dfuseUploadSize" hidden="true">DfuSe Upload Size:</label>
                <input type="number" name="dfuseUploadSize" id="dfuseUploadSize" min="1" max="2097152" hidden="true">
            </div>
        </b-form>
    </div>
    <b-row align="center" class="app_column">
        <div style="width: 100%;">
            <legend>Puremagnetik Updater</legend>
            <dialog id="interfaceDialog">
                Your device has multiple DFU interfaces. Select one from the list below:
                <b-form id="interfaceForm" method="dialog">
                    <b-button id="selectInterface" type="submit">Select interface</b-button>
                </b-form>
            </dialog>
            <div id="usbInfo" hidden="true" style="white-space: pre"></div>
            <div id="dfuInfo"  hidden="true" style="white-space: pre"></div>

            <!-- Product Selector -->
            <div class="product-selector-section">
                <h2 style="font-size: 1.5rem; font-weight: 600; color: var(--text-dark); margin-bottom: 20px; text-align: center;">Select Your Product</h2>
                <div class="product-grid">
                    <div
                        v-for="product in products"
                        :key="product.id"
                        @click="productSelected(product)"
                        :class="['product-card', { 'product-card-selected': selectedProduct && selectedProduct.id === product.id }]"
                    >
                        <div class="product-image-container">
                            <img :src="product.image" :alt="product.name" class="product-image">
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">{{product.name}}</h3>
                            <p class="product-description">{{product.description}}</p>
                            <p class="product-version">v{{product.firmware.version}}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <!--<b-button variant="es" v-b-toggle.collapseHelp>Display Help</b-button> -->
                <b-collapse id="collapseHelp" style="display:block;" class="collapse show">
                    <div class="nested_list">
                        <br><div class="warning-box">
                            <h3>⚠️ Important Warnings</h3>
                            <ul>
                                <li><strong>Warranty Notice:</strong> User-performed firmware updates may invalidate your warranty if the MCU (microcontroller) is damaged during the update process.</li>
                                <li><strong>Static Discharge:</strong> Before touching the MCU or internal components, discharge any static electricity by touching a grounded metal object (such as a metal water faucet or the metal part of a power outlet cover plate).</li>
                                <li><strong>Professional Service Available:</strong> If you prefer not to perform the update yourself, you can send your device back to us for a free repair/update service (you pay postage only). Contact us at <a href="mailto:hello@puremagnetik.com">hello@puremagnetik.com</a> for details.</li>
                            </ul>
                        </div>
                        <h3>Usage:</h3>
                        <ol>
                            <li><p>Use the Chrome browser for this page.</p></li>
                            <li><p>Do not use a USB hub.</p></li>
                            <li><p>Keep the pedal <i>disconnected</i> from a power source throughout the update.</p></li>
                            <li><p><strong>Discharge static electricity</strong> by touching a grounded metal object before proceeding.</p></li>
                            <li><p>Remove the 4 screws and the bottom plate of the pedal.</p></li>
                            <li><p>Inside the pedal, locate the micro USB port.

                            <p><img height="477px" width="365px" src="https://cdn.shopify.com/s/files/1/1561/5265/files/IMG_7651.jpg?v=1743518332"></p><br>
                            <li v-if="selectedProduct"><p>{{selectedProduct.installation_notes}}</p></li>
                            <li v-else><p>On the pedal, hold the appropriate button down while plugging the USB cable into the port.
                            <br>The red LED on the yellow board will light!
                            <br>If the blue LED on the pedal lights up, reconnect again with the button held. The blue LED should not light up.</p></li>
                            <li><p>Next, hit "Connect" and choose "DFU" device.
                            <br><br><b-button variant="es" id="connect">Connect</b-button></p></li>
                            <li><p>Hit "Flash Update" and wait for the progress bar to finish.
                            <br><br><b-button variant="es" id="blink" :disabled="no_device">Flash Update!</b-button>
                            <br><small v-if="selectedProduct" style="color: #64748b; font-weight: 500; margin-top: 8px; display: inline-block;">Version: {{selectedProduct.name}} v{{selectedProduct.firmware.version}} ({{selectedProduct.firmware.release_date}})</small></p></li>
                        </ol>
                        <p>
                            On windows, you may have to update the driver to WinUSB.

                            To do this, you can download the free software, Zadig. Instructions for this can be found <a href="https://github.com/electro-smith/DaisyWiki/wiki/Using-Zadig-to-Reset-USB-Driver-(Windows-Only)">here.</a>
                        </p>
                    </div>
                </b-collapse>
                <b-collapse id="collapseHelp">
                    <div class="nested_list">
                        <h1>Requirements</h1>
                        <p>In order to use this, you will need:</p>
                        <ul>
                            <li>
                                <p>An up-to-date version of Chrome, at least version 61 or newer</p>
                            </li>
                            <li>
                                <p>A Daisy Seed SOM. (The user-uploaded binary will work for any STM32 chip with a built in DFU bootloader).</p>
                            </li>
                        </ul>
                    </div>
                </b-collapse>
            </div>
        </div>
        </b-row>
        <b-row align="between" style="visibility: hidden;height: 0px; display:none;">
            <b-col align="center" class="app_column">
                <b-container >
                    <b-row class="p-2">
                        <legend>Getting Started? Flash the Blink example!</legend>
                        <div><b-button variant="es" id="blink"  :disabled="no_device">Flash Blink!</b-button></div>
                    </b-row>
                    <hr>
                    <b-row class="p-2">
                        <legend> Or select a platform and a program from the menu below.</legend>
                        <b-form-select placeholder="Platform" v-model="sel_platform" textContent="Select a platform" id="platformSelector">
                            <template v-slot:first>
                                <b-form-select-option :value="null" disabled>-- Platform --</b-form-select-option>
                            </template>
                            <option v-for="platform in platforms" :value="platform">{{platform}}</option>
                        </b-form-select>
                        <b-form-select v-model="sel_example" id="firmwareSelector" required @change="programChanged">
                            <template v-slot:first>
                                <b-form-select-option :value="null" disabled>-- Example --</b-form-select-option>
                            </template>
                            <b-form-select-option v-for="example in platformExamples" v-bind:key="example.name" :value="example">{{example.name}}</b-form-select-option>
                        </b-form-select>
                    </b-row>

                </b-container>

            </b-col>
        </b-row>
        <b-row align="between" style="visibility: hidden;height: 0px; display:none;">
            <b-col align="center" class="app_column">
            <b-container>
            <b-row class="p-2">
                    <legend> Or select a file from your computer</legend>
                        <b-form-file
                            id="firmwareFile"
                            v-model="firmwareFile"
                            :state="Boolean(firmwareFile)"
                            placeholder="Choose or drop a file..."
                            drop-placeholder="Drop file here..."
                        ></b-form-file>
                </b-row>
                </b-container>
                </b-col>
            </b-row>
        <b-row>
        <b-col align="center" class="app_column">
        <b-container align="center">
            <h2 style="font-size: 1.75rem; font-weight: 600; color: var(--text-dark); margin-bottom: 20px; text-align: center;">Programming Status</h2>
            <b-button id="download" variant='es' :disabled="no_device || !sel_example" style="visibility: hidden;height: 0px; display:none;"> Program</b-button>

            <!--<b-button variant="es" v-b-toggle.collapseAdvanced>Advanced...</b-button> -->
            <b-collapse id="collapseAdvanced">
                <div style="margin: 20px 0;"> <b-button variant="es" id="bootloader"  :disabled="no_device">Flash Bootloader Image</b-button> </div>
            </b-collapse>

            <div class="log" id="downloadLog"></div>
            <div v-if="sel_example||firmwareFile" >
                <div v-if="displaySelectedFile">
                <!--<h3 class="info">Name: {{sel_example.name}}</h3>-->
                <!--<li>Description: {{sel_example.description}}</li>-->
                <!--<h3 class="info">File Location: {{sel_example.filepath}} </h3>-->
                </div>
            <br>
            </div>
            <div><div id = "readme"></div> </div>
        </b-container>
        </b-col>
        </b-row>
    </b-row>

    </b-container>
    `,
    data: data,
    computed: {
        platformExamples: function () {

            return this.examples.filter(example => example.platform === this.sel_platform)
        }
    },
    created() {
        console.log("Page Created")
    },
    mounted() {
        var self = this
        console.log("Mounted Page")
        // Load products from builds/products.json
        this.importProducts()
        // Keep legacy importExamples() for backwards compatibility (if needed)
        // this.importExamples()
    },
    methods: {
        importProducts() {
            var self = this
            var base_url = getRootUrl().split("?")[0]
            // Remove the filename (index.html) from the URL if present
            if (base_url.endsWith('.html')) {
                base_url = base_url.substring(0, base_url.lastIndexOf('/') + 1)
            }
            var products_url = base_url + "builds/products.json"
            console.log("Loading products from: " + products_url)
            var raw = new XMLHttpRequest();
            raw.open("GET", products_url, true);
            raw.responseType = "text"
            raw.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    var obj = JSON.parse(this.response);
                    self.products = obj.products;
                    console.log("Loaded " + self.products.length + " products");

                    // Preload first product's firmware automatically
                    if (self.products.length > 0) {
                        self.productSelected(self.products[0]);
                    }
                }
            }
            raw.send(null)
        },
        productSelected(product) {
            var self = this
            self.selectedProduct = product
            self.firmwareFileName = product.name + " v" + product.firmware.version
            console.log("Selected product: " + product.name + " v" + product.firmware.version)

            // Load firmware binary
            readServerFirmwareFile(product.firmware.url, false).then(buffer => {
                blinkFirmwareFile = buffer
                console.log("Firmware loaded: " + product.firmware.filename)
            })
        },
        importExamples() {
            // var self = this
            // const unique_platforms = [...new Set(data.map(obj => obj.platform))]
            // self.examples = data
            // self.platforms = unique_platforms
            // New code below:
            // Get Source list as data
            var self = this // assign self to 'this' before nested function calls...
            var src_url = getRootUrl().split("?")[0].concat("data/sources.json") //need to strip out query string
            var raw = new XMLHttpRequest();
            raw.open("GET", src_url, true);
            raw.responseType = "text"
            raw.onreadystatechange = function ()
            {
                if (this.readyState === 4 && this.status === 200) {
                    var obj = this.response;
                    buffer = JSON.parse(obj);
                    buffer.forEach( function(ex_src) {
                        // Launch another request with async function to load examples from the
                        // specified urls
                        // This will fill examples directly, and replace the importExamples/timeout situation.
                        var ext_raw = new XMLHttpRequest();
                        ext_raw.open("GET", ex_src.data_url, true);
                        ext_raw.responseType = "text"
                        ext_raw.onreadystatechange = function ()
                        {
                            // This response will contain example data for the specified source.
                            if (this.readyState === 4 && this.status === 200) {
                                var ext_obj = this.response;
                                ex_buffer = JSON.parse(ext_obj);
                                const unique_platforms = [...new Set(ex_buffer.map(obj => obj.platform))]
                                ex_buffer.forEach( function(ex_dat) {
                                    //  Add "source" to example data
                                    ex_dat.source = ex_src

                                    self.examples.sort(function (i1, i2){
                                        return i1.name.toLowerCase() < i2.name.toLowerCase() ? -1 : 1
                                    })
                                    self.examples.push(ex_dat)
                                })
                                unique_platforms.forEach( function(u_plat) {
                                    if (!self.platforms.includes(u_plat)) {
                                        self.platforms.push(u_plat)
                                    }
                                })
                            }
                        }
                        ext_raw.send(null)

                            // var self = this
                            // const unique_platforms = [...new Set(data.map(obj => obj.platform))]
                            // self.examples = data
                            // self.platforms = unique_platforms
                    })
                }
            }
            raw.send(null)
        },
        programChanged(){
        	var self = this

            // Read new file
            self.firmwareFileName = self.sel_example.name
            this.displaySelectedFile = true;
            var srcurl = self.sel_example.source.repo_url
            //var expath = srcurl.substring(0, srcurl.lastIndexOf("/") +1).extend;
            var expath = srcurl.concat(self.sel_example.filepath)
        	readServerFirmwareFile(expath).then(buffer => {
                firmwareFile = buffer
            })
        },
    },
    watch: {
        firmwareFile(newfile){
            firmwareFile = null;
            this.displaySelectedFile = true;
            // Create dummy example struct
            // This updates sel_example to enable the Program button when a file is loaded
            var new_example = {
                name: newfile.name,
                description: "Imported File",
                filepath: null,
                platform: null
            }
            this.sel_example = new_example;
            let reader = new FileReader();
            reader.onload = function() {
                this.firmwareFile = reader.result;
                firmwareFile = reader.result;
            }
            reader.readAsArrayBuffer(newfile);
        },
        // LEGACY: Commented out - now using products system instead
        // examples(){
        //     var self = this

        //     //grab the blink firmware file
        //     var blink_example = self.examples.filter(example => example.name.toLowerCase() === "blink" && example.platform === "seed")[0]

        //     // Read new file
        //     self.firmwareFileName = blink_example.name
        //     var srcurl = blink_example.source.repo_url
        //     //var expath = srcurl.concat(blink_example.filepath)
        //     var expath = "https://ec2.puremagnetik.com/firmware_update/NightPassage_1_0_7.bin"
        // 	readServerFirmwareFile(expath, false).then(buffer => {
        //         blinkFirmwareFile = buffer
        //     })

        //     // grab the bootloader firmware file
        //     var srcurl = blink_example.source.bootloader_url
        // 	readServerFirmwareFile(srcurl, false).then(buffer => {
        //         bootloaderFirmwareFile = buffer
        //     })

        //     //parse the query strings
        //     var searchParams = new URLSearchParams(getRootUrl().split("?")[1])

        //     var platform = searchParams.get('platform')
        //     var name = searchParams.get('name')
        //     if(platform != null && self.examples.filter(ex => ex.platform === platform)){
        //         self.sel_platform = platform

        //         if(name != null){
        //             var ex = self.examples.filter(ex => ex.name === name && ex.platform === platform)[0]
        //             if(ex != null){
        //                 self.sel_example = ex
        //                 this.programChanged()
        //             }
        //         }
        //     }
        // }
    }
})
