import {SearchProtocol} from "./SearchProtocol";

export class SearchConfig {
    name: string;
    minSize: number = 0;
    maxSize: number = 0;
    searchProtocol: SearchProtocol = SearchProtocol.All;

    constructor() {}
}