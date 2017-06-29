/// <reference path="./typings/index.d.ts"/>

import { EmuleAPI } from "./EmuleAPI"
import {SearchConfig} from "./models/SearchConfig";
import {SearchProtocol} from "./models/SearchProtocol";

var api: EmuleAPI = new EmuleAPI("http://localhost:4711", "");
api.search({ name: "test", minSize: 0, maxSize: 0, searchProtocol: SearchProtocol.All }, 5).then(console.log).catch(console.log);